/**
 * Single Product API Route
 * 
 * GET /api/products/[slug]
 * 
 * Returns a single product by slug with full details.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDatabaseStatus } from "@/lib/db";
import { getProductBySlug } from "@/lib/data/products";
import { apiSuccess, apiError, apiNotFound } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    
    // Use DB abstraction layer; storefront: only products visible on website
    const product = await getProductBySlug(slug, { storefrontOnly: true });

    if (!product) {
      return apiNotFound("Product");
    }

    return apiSuccess(product, "Product fetched successfully");
  } catch (error) {
    logger.error("❌ Error fetching product:", error);
    
    // Retry once (same DB call; no mock in production)
    try {
      const { slug } = await params;
      const fallbackProduct = await getProductBySlug(slug, { storefrontOnly: true });
      if (fallbackProduct) {
        return apiSuccess(
          fallbackProduct,
          "Product fetched successfully (using fallback data)",
          { warning: "Using fallback data due to database error" }
        );
      }
    } catch (fallbackError) {
      // Fallback also failed
    }
    
    return apiError(
      "Unable to fetch product. Please try again later.",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

