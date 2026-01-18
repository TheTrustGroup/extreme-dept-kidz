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
    });

    if (!currentOrder) {
      return apiNotFound("Order");
    }

    // Build update data
    const updateData: any = {
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

    // Update order
    const order = await prisma.order.update({
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

    // Log activity
    await logActivity({
      adminUserId: auth.user!.id,
      action: 'order.updated',
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
