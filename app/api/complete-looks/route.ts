import { NextRequest, NextResponse } from "next/server";
import { getCompleteLooksForProduct } from "@/lib/data/complete-looks";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/complete-looks
 * Uses lib/data/complete-looks — single source. Kept for external/warehouse clients.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId") || undefined;
    const featured = searchParams.get("featured") === "true";

    const transformedLooks = await getCompleteLooksForProduct(productId, featured);

    return apiSuccess(
      { looks: transformedLooks, count: transformedLooks.length },
      "Complete looks fetched successfully",
      undefined,
      { cache: "no-store" }
    );
  } catch (error) {
    logger.error("❌ GET /api/complete-looks error:", error);
    
    // CRITICAL FIX: Better error handling with detailed logging
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Get search params again for logging
    const { searchParams: errorSearchParams } = new URL(request.url);
    const errorProductId = errorSearchParams.get('productId');
    const errorFeatured = errorSearchParams.get('featured') === 'true';
    
    // Log detailed error info in development
    if (process.env.NODE_ENV === 'development') {
      logger.error("Complete looks query error details:", {
        productId: errorProductId,
        featured: errorFeatured,
        error: errorMessage,
        stack: errorStack,
      });
    }
    
    // CRITICAL FIX: Return empty array instead of error to prevent frontend crashes
    return apiSuccess(
      { looks: [], count: 0 },
      'Complete looks fetched successfully (empty due to error)',
      undefined,
      { cache: 'no-store' }
    );
  }
}
