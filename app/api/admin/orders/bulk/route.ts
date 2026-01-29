import { NextRequest, NextResponse } from "next/server";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db/prisma";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
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

    const body = await request.json();
    const { ids, action, status, cancelledReason } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return apiError("No orders selected", 400);
    }

    if (!['updateStatus', 'cancel'].includes(action)) {
      return apiError("Invalid action", 400);
    }

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
      case 'updateStatus':
        if (!status) {
          return apiError("Status is required", 400);
        }

        const updateData: any = {
          status,
        };

        // Handle status-specific fields
        if (status === 'SHIPPED') {
          updateData.shippedAt = new Date();
        } else if (status === 'DELIVERED') {
          updateData.deliveredAt = new Date();
        } else if (status === 'CANCELLED') {
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
            status,
            count: ids.length,
            orders: orderNumbers.slice(0, 5),
          },
        }, request);
        break;

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
  } catch (error) {
    console.error("Bulk orders action error:", error);
    return apiError(
      "Failed to perform bulk action",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
