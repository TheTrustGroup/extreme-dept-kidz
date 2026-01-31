import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError, apiNotFound, apiValidationError } from "@/lib/utils/api-response";
import { z } from "zod";
import { updateInventorySchema, validate } from "@/lib/validation/schemas";
import { parseJsonBody } from "@/lib/utils/parse-body";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { withCors } from "@/lib/utils/cors";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
): Promise<NextResponse> {
  // RBAC: Updating inventory requires manager role or higher (warehouse + admin use same DB)
  const auth = await authenticateAndAuthorize(request, "manager");
  if (auth.error) return withCors(request, auth.error);
  if (!auth.authorized) {
    return withCors(
      request,
      NextResponse.json(
        { error: "Insufficient permissions. Manager role required to update inventory." },
        { status: 403 }
      )
    );
  }
  try {
    if (!prisma) {
      return withCors(request, apiError("Database not available", 500));
    }

    const { variantId } = await params;
    const parsed = await parseJsonBody(request);
    if (!parsed.ok) return withCors(request, parsed.response);
    const body = parsed.data;

    // Validate input (merge body with variantId from params)
    const validation = validate(updateInventorySchema, { ...(body && typeof body === "object" ? body : {}), variantId });
    if (!validation.success) {
      return withCors(request, apiValidationError(validation.errors));
    }

    const { quantity, action } = validation.data;

    // Get current variant to track change
    const currentVariant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!currentVariant) {
      return withCors(request, apiNotFound("Product variant"));
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

    return withCors(
      request,
      apiSuccess(
        {
          variant,
          change: newStock - oldStock,
          previousStock: oldStock,
          newStock,
        },
        "Inventory updated successfully"
      )
    );
  } catch (error: unknown) {
    logger.error("Failed to update inventory:", error);
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((e) => {
        errors[e.path.join(".")] = e.message;
      });
      return withCors(request, apiValidationError(errors));
    }
    return withCors(
      request,
      apiError(
        "Failed to update inventory",
        500,
        error instanceof Error ? error.message : "Unknown error"
      )
    );
  }
}
