import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticateRequest } from "@/lib/auth/middleware";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/inventory/sync
 * 
 * Syncs inventory updates from offline queue.
 * Accepts bulk updates for a product's sizes.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate admin user
    const authResult = await authenticateRequest(request);
    if (authResult.error || !authResult.user) {
      return authResult.error || NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { productId, sizes } = body;

    if (!productId || !Array.isArray(sizes)) {
      return NextResponse.json(
        { error: "Invalid request. Expected productId and sizes array." },
        { status: 400 }
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
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
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
          console.warn("Failed to log inventory change:", logError);
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
          console.warn("Failed to log inventory change:", logError);
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

    return NextResponse.json({
      success: true,
      productId,
      updated: updateResults.length,
      results: updateResults,
    });
  } catch (error) {
    console.error("Failed to sync inventory:", error);
    return NextResponse.json(
      { 
        error: "Failed to sync inventory",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
