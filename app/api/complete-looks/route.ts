import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/utils/cache-revalidation";
import { CACHE_REVALIDATE_LOOKS } from "@/lib/utils/cache-constants";

// CRITICAL: ISR aligned with cache-constants (looks TTL)
export const dynamic = "auto";
export const revalidate = CACHE_REVALIDATE_LOOKS;

/**
 * GET /api/complete-looks
 * Get all active complete looks (public endpoint)
 * 
 * Performance optimizations:
 * - ISR caching (60s revalidate)
 * - Stale-while-revalidate strategy
 * - Query batching with proper includes
 * - Edge caching via CDN headers
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const featured = searchParams.get('featured') === 'true';

    // CRITICAL FIX: Use cached query with proper relation name
    const getCachedLooks = unstable_cache(
      async () => {
        if (!prisma) {
          throw new Error("Database not available");
        }

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

        // CRITICAL FIX: Use correct relation name 'products' (CompleteLookProduct[])
        const looks = await prisma.completeLook.findMany({
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
                    variants: {
                      select: {
                        id: true,
                        size: true,
                        stock: true,
                        isActive: true,
                      },
                    },
                    tags: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        // Transform to match frontend format
        return looks.map((look) => {
          const products = look.products.map((p) => p.product);
          const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
          const bundlePrice = look.bundlePrice;
          const savings = Math.max(0, totalPrice - bundlePrice);

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
            tags: look.tags || [],
            ageRange: look.ageRange,
            products: look.products.map((p) => ({
              productId: p.productId,
              product: p.product,
              required: p.isRequired,
              isOptional: !p.isRequired,
            })),
            items: look.products.map((p) => ({
              productId: p.productId,
              product: p.product,
              required: p.isRequired,
            })),
          };
        });
      },
      [`complete-looks-${productId || 'all'}-${featured ? 'featured' : 'all'}`],
      {
        tags: [
          CACHE_TAGS.completeLooks,
          productId ? `complete-looks-product-${productId}` : 'complete-looks-all',
          featured ? 'complete-looks-featured' : 'complete-looks-all',
        ],
        revalidate: CACHE_REVALIDATE_LOOKS,
      }
    );

    const transformedLooks = await getCachedLooks();

    // CRITICAL: Edge caching aligned with cache-constants (looks TTL)
    return apiSuccess(
      {
        looks: transformedLooks,
        count: transformedLooks.length,
      },
      'Complete looks fetched successfully',
      undefined,
      {
        cache: 'looks', // Align with cache-constants (s-maxage=60, SWR=300)
        tags: [
          CACHE_TAGS.completeLooks,
          productId ? `complete-looks-product-${productId}` : 'complete-looks-all',
          featured ? 'complete-looks-featured' : 'complete-looks-all',
        ],
      }
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
      {
        looks: [],
        count: 0,
      },
      'Complete looks fetched successfully (empty due to error)',
      undefined,
      {
        cache: 10, // Short cache for error responses
      }
    );
  }
}
