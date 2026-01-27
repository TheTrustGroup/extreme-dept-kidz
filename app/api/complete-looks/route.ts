import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

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

    return apiSuccess(
      {
        looks: transformedLooks,
        count: transformedLooks.length,
      },
      'Complete looks fetched successfully'
    );
  } catch (error) {
    logger.error("❌ GET /api/complete-looks error:", error);
    return apiError(
      "Failed to fetch complete looks",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
