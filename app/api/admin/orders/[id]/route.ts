import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError, apiNotFound, apiValidationError } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { logActivity, ActivityActions } from "@/lib/services/admin/activity.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  cancelledReason: z.string().optional(),
});

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
 * GET /api/admin/orders/[id]
 * 
 * Get a single order with full details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // RBAC: Viewing orders requires manager role or higher
  const auth = await authenticateAndAuthorize(request, 'manager');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json(
      { error: 'Insufficient permissions. Manager role required to view orders.' },
      { status: 403 }
    );
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  where: { isPrimary: true },
                  take: 1,
                  select: {
                    url: true,
                    alt: true,
                  },
                },
              },
            },
            variant: {
              select: {
                id: true,
                size: true,
                color: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return apiNotFound("Order");
    }

    return apiSuccess(order, "Order fetched successfully");
  } catch (error) {
    logger.error("Failed to fetch order:", error);
    return apiError(
      "Failed to fetch order",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

/**
 * PUT /api/admin/orders/[id]
 * 
 * Update order status (manager role or higher)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // RBAC: Updating orders requires manager role or higher
  const auth = await authenticateAndAuthorize(request, 'manager');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json(
      { error: 'Insufficient permissions. Manager role required to update orders.' },
      { status: 403 }
    );
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateOrderStatusSchema.safeParse(body);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach(e => {
        errors[e.path.join('.')] = e.message;
      });
      return apiValidationError(errors);
    }

    const { status, trackingNumber, carrier, cancelledReason } = validation.data;

    // Get current order
    const currentOrder = await prisma.order.findUnique({
      where: { id },
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

    if (!currentOrder) {
      return apiNotFound("Order");
    }

    if (!isValidStatusTransition(currentOrder.status, status)) {
      return apiError(
        `Invalid status transition from ${currentOrder.status} to ${status}`,
        400
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      status,
    };

    // Handle status-specific fields
    if (status === 'SHIPPED' && !currentOrder.shippedAt) {
      updateData.shippedAt = new Date();
    }
    if (status === 'DELIVERED' && !currentOrder.deliveredAt) {
      updateData.deliveredAt = new Date();
    }
    if (status === 'CANCELLED' && !currentOrder.cancelledAt) {
      updateData.cancelledAt = new Date();
      if (cancelledReason) {
        updateData.cancelledReason = cancelledReason;
      }
    }

    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    if (carrier) {
      updateData.carrier = carrier;
    }

    // Update order and restore stock when cancellation happens after deduction.
    const order = await prisma.$transaction(async (tx) => {
      if (status === "CANCELLED" && currentOrder.status !== "CANCELLED") {
        await restockOrderItemsForCancellation(tx as NonNullable<typeof prisma>, id);
      }

      return tx.order.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
              variant: {
                select: {
                  size: true,
                },
              },
            },
          },
        },
      });
    });

    // Log activity
    await logActivity({
      adminUserId: auth.user!.id,
      action: ActivityActions.ORDER_UPDATED,
      resource: 'Order',
      resourceId: id,
      details: {
        orderNumber: order.orderNumber,
        previousStatus: currentOrder.status,
        newStatus: status,
        trackingNumber,
        carrier,
      },
    }, request);

    return apiSuccess(order, "Order updated successfully");
  } catch (error) {
    logger.error("Failed to update order:", error);
    return apiError(
      "Failed to update order",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
