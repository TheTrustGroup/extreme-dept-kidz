/**
 * Inventory API Route
 * 
 * GET /api/inventory/[productId]
 * 
 * Returns inventory/stock information for a product and its variants.
 */

import { NextRequest, NextResponse } from "next/server";

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
      return NextResponse.json(
        { error: "Product not found or has no variants" },
        { status: 404 }
      );
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

    return NextResponse.json({
      productId: params.productId,
      hasStock,
      totalAvailable,
      variants: inventory,
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

