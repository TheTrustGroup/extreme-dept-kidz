import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { withCors } from "@/lib/utils/cors";

export const dynamic = "force-dynamic";

/**
 * Consolidated Product Stats Endpoint
 * 
 * Returns all product statistics in a single request instead of 5 separate calls.
 * Reduces API calls from 5 to 1, improving page load performance.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Extract request ID for tracking
  const requestId = request.headers.get('X-Request-ID') || undefined;
  
  // RBAC: Viewing stats requires viewer role or higher
  const auth = await authenticateAndAuthorize(request, 'viewer');
  if (auth.error) return withCors(request, auth.error);
  if (!auth.authorized) {
    return withCors(request, NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 }));
  }

  try {
    if (!prisma) {
      return withCors(request, apiError("Database not available", 500, undefined, undefined, requestId));
    }

    // Calculate all stats in parallel for better performance
    const [
      allCount,
      publishedCount,
      draftsCount,
      lowStockProducts,
      outOfStockProducts,
    ] = await Promise.all([
      // All products count
      prisma.product.count(),
      
      // Published (active) products count
      prisma.product.count({
        where: { inStock: true },
      }),
      
      // Draft products count (no images or incomplete data)
      prisma.product.count({
        where: {
          OR: [
            { images: { none: {} } },
            { name: { equals: '' } },
          ],
        },
      }),
      
      // Low stock products (need to calculate total stock per product)
      prisma.product.findMany({
        select: {
          id: true,
          variants: {
            select: {
              stock: true,
            },
          },
        },
      }),
      
      // Out of stock products
      prisma.product.findMany({
        where: { inStock: false },
        select: {
          id: true,
          variants: {
            select: {
              stock: true,
            },
          },
        },
      }),
    ]);

    // Calculate low stock count (total stock > 0 and <= 10)
    const lowStockCount = lowStockProducts.filter(product => {
      const totalStock = product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0);
      return totalStock > 0 && totalStock <= 10;
    }).length;

    // Calculate out of stock count (total stock === 0 or inStock === false)
    const outOfStockCount = outOfStockProducts.length + lowStockProducts.filter(product => {
      const totalStock = product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0);
      return totalStock === 0;
    }).length;

    return withCors(request, apiSuccess({
      all: allCount,
      published: publishedCount,
      drafts: draftsCount,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
    }, 'Product stats fetched successfully', undefined, { requestId }));
  } catch (error) {
    logger.error("❌ GET /api/admin/products/stats error:", error);
    return withCors(request, apiError(
      "Failed to fetch product stats",
      500,
      error instanceof Error ? error.message : "Unknown error",
      undefined,
      requestId
    ));
  }
}
