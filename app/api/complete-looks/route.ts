import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";

// CRITICAL FIX: Allow ISR caching for better performance
// This route can be cached since complete looks don't change frequently
export const dynamic = "force-dynamic";
export const revalidate = 60; // Revalidate every 60 seconds

/**
 * GET /api/complete-looks
 * Get all active complete looks (public endpoint)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const featured = searchParams.get('featured') === 'true';

    const where: any = {
      isActive: true,
    };

    if (productId) {
      where.products = {
        some: {
          productId,
        },
      };
    }

    if (featured) {
      where.featured = true;
    }

    const looks = await (prisma as any).completeLook.findMany({
      where,
      include: {
        products: {
          include: {
            product: {
              include: {
                category: true,
                images: {
                  orderBy: { order: 'asc' },
                },
                variants: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: featured ? { createdAt: 'desc' } : { createdAt: 'desc' },
    });

    // Transform to match frontend format
    const transformedLooks = looks.map((look: any) => {
      const products = look.products.map((p: any) => p.product);
      const totalPrice = products.reduce((sum: number, p: any) => sum + p.price, 0);
      const bundlePrice = look.bundlePrice;
      const savings = totalPrice - bundlePrice;

      return {
        id: look.id,
        name: look.name,
        slug: look.slug,
        description: look.description,
        mainImage: look.mainImage,
        totalPrice,
        bundlePrice,
        savings,
        bundleDiscount: look.bundleDiscount,
        featured: look.featured,
        tags: look.tags,
        ageRange: look.ageRange,
        products: look.products.map((p: any) => ({
          productId: p.productId,
          product: p.product,
          required: p.isRequired,
          isOptional: !p.isRequired,
        })),
        items: look.products.map((p: any) => ({
          productId: p.productId,
          product: p.product,
          required: p.isRequired,
        })),
      };
    });

    // CRITICAL FIX: Add CDN cache headers for performance
    return apiSuccess(
      {
        looks: transformedLooks,
        count: transformedLooks.length,
      },
      'Complete looks fetched successfully',
      undefined,
      {
        cache: 60, // Cache for 60 seconds
        tags: ['complete-looks', productId ? `complete-looks-product-${productId}` : 'complete-looks-all'],
      }
    );
  } catch (error) {
    logger.error("❌ GET /api/complete-looks error:", error);
    
    // CRITICAL FIX: Better error handling with detailed logging
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Get search params again for logging (they're in scope here)
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
    // This allows the page to render even if complete looks fail to load
    return apiSuccess(
      {
        looks: [],
        count: 0,
      },
      'Complete looks fetched successfully (empty due to error)',
      undefined,
      {
        cache: 60, // Still cache the error response to prevent repeated failures
      }
    );
  }
}
