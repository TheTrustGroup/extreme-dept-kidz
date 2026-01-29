import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { withCors } from "@/lib/utils/cors";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  // RBAC: Viewing inventory requires manager role or higher
  const auth = await authenticateAndAuthorize(request, 'manager');
  if (auth.error) return withCors(request, auth.error);
  if (!auth.authorized) {
    return withCors(request, NextResponse.json({ error: 'Insufficient permissions. Manager role required to view inventory.' }, { status: 403 }));
  }
  try {
    if (!prisma) {
      return withCors(request, apiError("Database not available", 500));
    }

    const variants = await prisma.productVariant.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            images: {
              where: {
                isPrimary: true,
              },
              take: 1,
              select: {
                url: true,
              },
            },
          },
        },
      },
      where: {
        isActive: true,
      },
      orderBy: {
        product: {
          name: "asc",
        },
      },
    });

    // Transform to table format
    const tableVariants = variants.map(v => ({
      id: v.id,
      productId: v.product.id,
      productName: v.product.name,
      category: v.product.category?.name || 'Uncategorized',
      sku: v.sku,
      size: v.size,
      stock: v.stock,
      lowStockThreshold: v.lowStockThreshold,
      price: v.price || v.product.price || 0,
      imageUrl: v.product.images[0]?.url,
    }));

    return withCors(request, apiSuccess(
      {
        variants: tableVariants,
        count: variants.length,
        lowStock: variants.filter(v => v.stock > 0 && v.stock <= v.lowStockThreshold).length,
        outOfStock: variants.filter(v => v.stock === 0).length,
      },
      "Inventory fetched successfully"
    ));
  } catch (error) {
    logger.error("Failed to fetch inventory:", error);
    return withCors(request, apiError(
      "Failed to fetch inventory",
      500,
      error instanceof Error ? error.message : "Unknown error"
    ));
  }
}
