/**
 * Inventory API Route
 * 
 * GET /api/inventory/[productId]
 * 
 * Returns inventory/stock information for a product and its variants.
 */

import { NextRequest, NextResponse } from "next/server";
import { apiSuccess, apiError, apiNotFound } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
): Promise<NextResponse> {
  // Lazy load prisma to avoid build-time initialization
  const prismaModule = await import("@/lib/db/prisma");
  const prisma = prismaModule.prisma;
  
  if (!prisma) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  try {
    const variants = await prisma.productVariant.findMany({
      where: {
        productId: params.productId,
        isActive: true,
      },
      select: {
        id: true,
        size: true,
        color: true,
        stock: true,
        reserved: true,
        lowStockThreshold: true,
      },
      orderBy: { size: "asc" },
    });

    if (variants.length === 0) {
      return apiNotFound("Product or product variants");
    }

    // Calculate available stock (stock - reserved)
    type VariantType = {
      id: string;
      size: string;
      color: string | null;
      stock: number;
      reserved: number;
      lowStockThreshold: number;
    };
    const inventory = variants.map((v: VariantType) => ({
      variantId: v.id,
      size: v.size,
      color: v.color,
      stock: v.stock,
      reserved: v.reserved,
      available: v.stock - v.reserved,
      inStock: v.stock - v.reserved > 0,
      isLowStock: v.stock <= v.lowStockThreshold,
    }));

    // Overall product stock status
    const totalAvailable = inventory.reduce(
      (sum: number, v: { available: number }) => sum + v.available,
      0
    );
    const hasStock = totalAvailable > 0;

    return apiSuccess(
      {
        productId: params.productId,
        hasStock,
        totalAvailable,
        variants: inventory,
      },
      "Inventory fetched successfully"
    );
  } catch (error) {
    logger.error("Error fetching inventory:", error);
    return apiError(
      "Failed to fetch inventory",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

