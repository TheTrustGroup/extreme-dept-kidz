import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError, apiNotFound } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/complete-looks/[id]
 * Get a specific complete look by ID or slug (public endpoint)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { id } = await params;

    // Try to find by ID first, then by slug
    const look = await prisma.completeLook.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
        isActive: true,
      },
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
    });

    if (!look) {
      return apiNotFound("Complete look");
    }

    // Transform to match frontend format
    const products = look.products.map((p: any) => p.product);
    const totalPrice = products.reduce((sum: number, p: any) => sum + p.price, 0);
    const bundlePrice = look.bundlePrice;
    const savings = totalPrice - bundlePrice;

    const transformedLook = {
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

    return apiSuccess(transformedLook, "Complete look fetched successfully");
  } catch (error) {
    logger.error("Failed to fetch complete look:", error);
    return apiError(
      "Failed to fetch complete look",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
