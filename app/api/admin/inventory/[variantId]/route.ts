import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError, apiNotFound, apiValidationError } from "@/lib/utils/api-response";
import { updateInventorySchema, validate } from "@/lib/validation/schemas";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
): Promise<NextResponse> {
  // RBAC: Updating inventory requires manager role or higher
  const auth = await authenticateAndAuthorize(request, 'manager');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions. Manager role required to update inventory.' }, { status: 403 });
  }
  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { variantId } = await params;
    const body = await request.json();

    // Validate input
    const validation = validate(updateInventorySchema, { ...body, variantId });
    if (!validation.success) {
      return apiValidationError(validation.errors);
    }

    const { quantity, action } = validation.data;

    // Get current variant to track change
    const currentVariant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!currentVariant) {
      return apiNotFound("Product variant");
    }

    const oldStock = currentVariant.stock;
    
    // Calculate new stock based on action
    let newStock: number;
    switch (action) {
      case 'add':
        newStock = oldStock + quantity;
        break;
      case 'subtract':
        newStock = Math.max(0, oldStock - quantity);
        break;
      case 'set':
      default:
        newStock = quantity;
        break;
    }

    // Update stock
    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: newStock },
    });

    // Log inventory change (existing inventory log)
    try {
      await prisma.inventoryLog.create({
        data: {
          variantId: variant.id,
          change: newStock - oldStock,
          reason: "adjustment",
          notes: `Updated via admin panel. Action: ${action}, Previous stock: ${oldStock}, New stock: ${newStock}`,
        },
      });
    } catch (logError) {
      // Silently fail if logging is not available
      logger.warn("Failed to log inventory change:", logError);
    }

    // Log admin activity (auth is already checked at the start of the function)
    const { logActivity, ActivityActions } = await import('@/lib/services/admin/activity.service');
    await logActivity({
      adminUserId: auth.user!.id,
      action: ActivityActions.INVENTORY_UPDATED,
      resource: 'ProductVariant',
      resourceId: variantId,
      details: {
        action,
        previousStock: oldStock,
        newStock,
        change: newStock - oldStock,
      },
    }, request);

    return apiSuccess(
      {
        variant,
        change: newStock - oldStock,
        previousStock: oldStock,
        newStock,
      },
      "Inventory updated successfully"
    );
  } catch (error) {
    logger.error("Failed to update inventory:", error);
    return apiError(
      "Failed to update inventory",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
