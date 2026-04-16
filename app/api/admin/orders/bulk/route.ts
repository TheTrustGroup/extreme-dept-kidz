import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db/prisma";
import { apiError, apiSuccess, apiValidationError } from "@/lib/utils/api-response";
import { parseJsonBody } from "@/lib/utils/parse-body";
import { bulkOrdersSchema, validate } from "@/lib/validation/schemas";
import { logActivity, ActivityActions } from "@/lib/services/admin/activity.service";
import { revalidatePath } from "next/cache";

const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED", "REFUNDED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

function isValidStatusTransition(currentStatus: string, nextStatus: string): boolean {
  if (currentStatus === nextStatus) return true;
  return (ALLOWED_STATUS_TRANSITIONS[currentStatus] ?? []).includes(nextStatus);
}

async function restockOrderItemsForCancellation(
  tx: NonNullable<typeof prisma>,
  orderId: string
): Promise<void> {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          variant: {
            select: {
              id: true,
              stock: true,
              productId: true,
            },
          },
        },
      },
    },
  });
  if (!order) return;

  const affectedProductIds = new Set<string>();
  for (const item of order.items) {
    const variant = item.variant;
    if (!variant) continue;
    affectedProductIds.add(variant.productId);
    await tx.productVariant.update({
      where: { id: variant.id },
      data: { stock: variant.stock + item.quantity },
    });
    await tx.inventoryLog.create({
      data: {
        variantId: variant.id,
        change: item.quantity,
        reason: "release",
        orderId: order.id,
        notes: `Order ${order.orderNumber} cancelled - stock restored`,
      },
    });
  }

  for (const productId of affectedProductIds) {
    const stockAggregate = await tx.productVariant.aggregate({
      where: { productId, isActive: true },
      _sum: { stock: true },
    });
    await tx.product.update({
      where: { id: productId },
      data: { inStock: (stockAggregate._sum.stock ?? 0) > 0 },
    });
  }
}

/**
 * Bulk Orders Actions API
 * 
 * Handles bulk operations on orders:
 * - updateStatus: Update status for multiple orders
 * - cancel: Cancel multiple orders
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // RBAC: Bulk actions require manager role or higher
  const auth = await authenticateAndAuthorize(request, 'manager');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const parsed = await parseJsonBody(request);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

    const validation = validate(bulkOrdersSchema, body);
    if (!validation.success) {
      return apiValidationError(validation.errors);
    }

    const { ids, action, status, cancelledReason } = validation.data;

    // Verify all orders exist
    const orders = await prisma.order.findMany({
      where: { id: { in: ids } },
    });

    if (orders.length !== ids.length) {
      return apiError("Some orders not found", 404);
    }

    let result;
    const orderNumbers = orders.map(o => o.orderNumber);

    switch (action) {
      case 'updateStatus': {
        const updateStatus = status!;
        const invalidTransitionOrder = orders.find((order) => !isValidStatusTransition(order.status, updateStatus));
        if (invalidTransitionOrder) {
          return apiError(
            `Invalid status transition from ${invalidTransitionOrder.status} to ${updateStatus}`,
            400
          );
        }

        result = await prisma.$transaction(async (tx) => {
          let updatedCount = 0;
          for (const order of orders) {
            const updateData: Record<string, unknown> = {
              status: updateStatus,
            };
            if (updateStatus === 'SHIPPED' && !order.shippedAt) {
              updateData.shippedAt = new Date();
            } else if (updateStatus === 'DELIVERED' && !order.deliveredAt) {
              updateData.deliveredAt = new Date();
            } else if (updateStatus === 'CANCELLED' && !order.cancelledAt) {
              updateData.cancelledAt = new Date();
            }
            if (updateStatus === "CANCELLED" && order.status !== "CANCELLED") {
              await restockOrderItemsForCancellation(tx as NonNullable<typeof prisma>, order.id);
            }
            await tx.order.update({
              where: { id: order.id },
              data: updateData,
            });
            updatedCount += 1;
          }
          return { count: updatedCount };
        });

        await logActivity({
          adminUserId: auth.user!.id,
          action: ActivityActions.ORDER_UPDATED,
          resource: 'Order',
          resourceId: ids[0],
          details: {
            action: 'bulk_update_status',
            status: updateStatus,
            count: ids.length,
            orders: orderNumbers.slice(0, 5),
          },
        }, request);
        break;
      }

      case 'cancel':
        result = await prisma.$transaction(async (tx) => {
          let updatedCount = 0;
          for (const order of orders) {
            if (!isValidStatusTransition(order.status, "CANCELLED")) {
              continue;
            }
            if (order.status !== "CANCELLED") {
              await restockOrderItemsForCancellation(tx as NonNullable<typeof prisma>, order.id);
            }
            await tx.order.update({
              where: { id: order.id },
              data: {
                status: 'CANCELLED',
                cancelledAt: order.cancelledAt ?? new Date(),
                cancelledReason: cancelledReason || 'Bulk cancellation',
              },
            });
            updatedCount += 1;
          }
          return { count: updatedCount };
        });

        await logActivity({
          adminUserId: auth.user!.id,
          action: ActivityActions.ORDER_UPDATED,
          resource: 'Order',
          resourceId: ids[0],
          details: {
            action: 'bulk_cancel',
            count: ids.length,
            orders: orderNumbers.slice(0, 5),
          },
        }, request);
        break;

      default:
        return apiError("Invalid action", 400);
    }

    // Revalidate cache
    revalidatePath('/admin/orders');

    return apiSuccess(
      {
        count: result.count || ids.length,
        action,
      },
      `Successfully ${action === 'updateStatus' ? 'updated' : 'cancelled'} ${ids.length} order${ids.length !== 1 ? 's' : ''}`
    );
  } catch (error: unknown) {
    console.error("Bulk orders action error:", error);
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((e) => {
        errors[e.path.join(".")] = e.message;
      });
      return apiValidationError(errors);
    }
    return apiError(
      "Failed to perform bulk action",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
