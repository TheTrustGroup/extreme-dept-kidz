/**
 * Single Product API Route
 * 
 * GET /api/products/[slug]
 * 
 * Returns a single product by slug with full details.
 */

import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug, getDatabaseStatus } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    
    // Use DB abstraction layer (with automatic fallback to mock data)
    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...product,
      dbStatus: getDatabaseStatus(), // Include DB status
    });
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    
    // Try fallback to mock data
    try {
      const { slug } = await params;
      const fallbackProduct = await getProductBySlug(slug);
      if (fallbackProduct) {
        return NextResponse.json({
          ...fallbackProduct,
          dbStatus: getDatabaseStatus(),
          warning: "Using fallback data due to database error",
        });
      }
    } catch (fallbackError) {
      // Fallback also failed
    }
    
    return NextResponse.json(
      { 
        error: "Unable to fetch product. Please try again later.",
        dbStatus: getDatabaseStatus(),
      },
      { status: 500 }
    );
  }
}

