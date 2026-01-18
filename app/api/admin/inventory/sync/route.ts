import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { apiSuccess, apiError, apiNotFound, apiUnauthorized } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/inventory/sync
 * 
 * Syncs inventory updates from offline queue.
 * Accepts bulk updates for a product's sizes.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // RBAC: Syncing inventory requires manager role or higher
  const auth = await authenticateAndAuthorize(request, 'manager');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions. Manager role required to sync inventory.' }, { status: 403 });
  }

  try {

    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const body = await request.json();
    const { productId, sizes } = body;

    if (!productId || !Array.isArray(sizes)) {
      return apiError(
        "Invalid request. Expected productId and sizes array.",
        400
      );
    }

    // Get product to verify it exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: true,
      },
    });

    if (!product) {
      return apiNotFound("Product");
    }

    // Update or create variants for each size
    const updateResults = [];
    for (const sizeData of sizes) {
      const { size, quantity, inStock } = sizeData;

      // Find existing variant by productId and size
      const existingVariant = product.variants.find(
        v => v.size === size
      );

      if (existingVariant) {
        // Update existing variant
        const oldStock = existingVariant.stock;
        const variant = await prisma.productVariant.update({
          where: { id: existingVariant.id },
          data: {
            stock: quantity || 0,
            isActive: inStock !== false,
          },
        });

        // Log inventory change
        try {
          await prisma.inventoryLog.create({
            data: {
              variantId: variant.id,
              change: (quantity || 0) - oldStock,
              reason: "adjustment",
              notes: `Synced from offline queue. Previous stock: ${oldStock}, New stock: ${quantity || 0}`,
            },
          });
        } catch (logError) {
          logger.warn("Failed to log inventory change:", logError);
        }

        updateResults.push({ size, variantId: variant.id, updated: true });
      } else {
        // Create new variant if it doesn't exist
        // Generate SKU if not provided
        const sku = `${product.sku || product.id}-${size}`;
        
        const variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            size,
            sku,
            stock: quantity || 0,
            price: product.price, // Use product price as default
            isActive: inStock !== false,
          },
        });

        // Log inventory change
        try {
          await prisma.inventoryLog.create({
            data: {
              variantId: variant.id,
              change: quantity || 0,
              reason: "adjustment",
              notes: `Created and synced from offline queue. Initial stock: ${quantity || 0}`,
            },
          });
        } catch (logError) {
          logger.warn("Failed to log inventory change:", logError);
        }

        updateResults.push({ size, variantId: variant.id, created: true });
      }
    }

    // Update product's inStock status based on variants
    const hasStock = updateResults.some(r => {
      const sizeData = sizes.find(s => s.size === r.size);
      return sizeData && (sizeData.quantity || 0) > 0;
    });

    await prisma.product.update({
      where: { id: productId },
      data: { inStock: hasStock },
    });

    return apiSuccess(
      {
        productId,
        updated: updateResults.length,
        results: updateResults,
      },
      "Inventory synced successfully"
    );
  } catch (error) {
    logger.error("Failed to sync inventory:", error);
    return apiError(
      "Failed to sync inventory",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
