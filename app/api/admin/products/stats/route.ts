import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { withCors } from "@/lib/utils/cors";
import { retryPrismaQuery } from "@/lib/utils/retry";

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
    // Use retry logic for transient failures

    const [
      allCount,
      publishedCount,
      draftsCount,
      perProductStock,
    ] = await Promise.all([
      // All products count
      retryPrismaQuery(() => prisma!.product.count(), { timeoutMs: 5000 }),
      
      // Published (active) products count
      retryPrismaQuery(() => prisma!.product.count({
        where: { inStock: true },
      }), { timeoutMs: 5000 }),
      
      // Draft products count (no images or incomplete data)
      retryPrismaQuery(() => prisma!.product.count({
        where: {
          OR: [
            { images: { none: {} } },
            { name: { equals: '' } },
          ],
        },
      }), { timeoutMs: 5000 }),
      
      // Per-product stock totals using DB aggregation (avoid loading all variants for all products)
      retryPrismaQuery(
        () =>
          prisma!.productVariant.groupBy({
            by: ['productId'],
            _sum: { stock: true },
            where: { isActive: true },
          }),
        { timeoutMs: 5000 }
      ),
    ]);

    // Calculate low/out-of-stock counts from aggregated stock totals
    const stockTotals = perProductStock.map((row) => Number(row._sum.stock || 0));
    const lowStockCount = stockTotals.filter((stock) => stock > 0 && stock <= 10).length;
    const outOfStockCount = stockTotals.filter((stock) => stock <= 0).length;

    const response = withCors(request, apiSuccess({
      all: allCount,
      published: publishedCount,
      drafts: draftsCount,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
    }, 'Product stats fetched successfully', undefined, { requestId }));
    response.headers.set('Cache-Control', 'private, max-age=20, stale-while-revalidate=60');
    return response;
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
