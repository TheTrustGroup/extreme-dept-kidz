import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db/prisma";
import { apiError, apiSuccess, apiValidationError } from "@/lib/utils/api-response";
import { parseJsonBody } from "@/lib/utils/parse-body";
import { bulkOrdersSchema, validate } from "@/lib/validation/schemas";
import { logActivity, ActivityActions } from "@/lib/services/admin/activity.service";
import { revalidatePath } from "next/cache";

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

        const updateData: any = {
          status: updateStatus,
        };

        // Handle status-specific fields
        if (updateStatus === 'SHIPPED') {
          updateData.shippedAt = new Date();
        } else if (updateStatus === 'DELIVERED') {
          updateData.deliveredAt = new Date();
        } else if (updateStatus === 'CANCELLED') {
          updateData.cancelledAt = new Date();
        }

        result = await prisma.order.updateMany({
          where: { id: { in: ids } },
          data: updateData,
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
        result = await prisma.order.updateMany({
          where: { id: { in: ids } },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            cancelledReason: cancelledReason || 'Bulk cancellation',
          },
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
