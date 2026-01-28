import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/utils/cache-revalidation";
import { apiSuccess, apiError, apiValidationError } from "@/lib/utils/api-response";
import { createCompleteLookSchema, validate } from "@/lib/validation/schemas";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { logActivity, ActivityActions } from "@/lib/services/admin/activity.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  // RBAC: Viewing complete looks requires viewer role or higher
  const auth = await authenticateAndAuthorize(request, 'viewer');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const looks = await (prisma as any).completeLook.findMany({
      include: {
        products: {
          include: {
            product: {
              include: {
                category: true,
                images: true,
                variants: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return apiSuccess(
      {
        looks,
        count: looks.length,
      },
      'Complete looks fetched successfully'
    );
  } catch (error) {
    logger.error("❌ GET /api/admin/complete-looks error:", error);
    return apiError(
      "Failed to fetch complete looks",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // RBAC: Creating complete looks requires admin role or higher
  const auth = await authenticateAndAuthorize(request, 'admin');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions. Admin role required to create complete looks.' }, { status: 403 });
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const body = await request.json();

    // Validate input
    const validation = validate(createCompleteLookSchema, body);
    if (!validation.success) {
      return apiValidationError(validation.errors);
    }

    const validatedData = validation.data;

    // Generate slug if not provided
    const slug = validatedData.slug || 
      validatedData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Check if slug already exists
    const existingLook = await (prisma as any).completeLook.findUnique({
      where: { slug },
    });
    if (existingLook) {
      return apiError(
        "Complete look with this slug already exists",
        409,
        `A complete look with slug "${slug}" already exists. Please use a different slug.`
      );
    }

    // Verify all products exist
    const products = await prisma.product.findMany({
      where: {
        id: { in: validatedData.productIds },
      },
    });

    if (products.length !== validatedData.productIds.length) {
      const foundIds = products.map(p => p.id);
      const missingIds = validatedData.productIds.filter(id => !foundIds.includes(id));
      return apiError(
        "Some products not found",
        404,
        `Products with IDs ${missingIds.join(', ')} do not exist`
      );
    }

    // Calculate bundle price if not provided (sum of products with discount)
    const bundlePriceValue = typeof validatedData.bundlePrice === 'number' 
      ? validatedData.bundlePrice 
      : parseFloat(String(validatedData.bundlePrice));
    
    if (isNaN(bundlePriceValue) || bundlePriceValue <= 0) {
      return apiError(
        "Invalid bundle price",
        400,
        "Bundle price must be a positive number"
      );
    }
    
    let bundlePrice = Math.round(bundlePriceValue * 100); // Convert to cents
    if (validatedData.bundleDiscount !== undefined && validatedData.bundleDiscount !== null) {
      const bundleDiscountValue = typeof validatedData.bundleDiscount === 'number' 
        ? validatedData.bundleDiscount 
        : parseFloat(String(validatedData.bundleDiscount));
      if (!isNaN(bundleDiscountValue) && bundleDiscountValue > 0 && bundleDiscountValue <= 100) {
        const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
        const discountAmount = Math.round(totalPrice * (bundleDiscountValue / 100));
        bundlePrice = totalPrice - discountAmount;
      }
    }

    // Create complete look
    const completeLook = await (prisma as any).completeLook.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description,
        mainImage: validatedData.mainImage,
        bundlePrice,
        bundleDiscount: validatedData.bundleDiscount || null,
        featured: validatedData.featured || false,
        isActive: validatedData.isActive !== undefined ? validatedData.isActive : true,
        ageRange: validatedData.ageRange || null,
        tags: validatedData.tags || [],
        products: {
          create: validatedData.productIds.map((productId: string, index: number) => ({
            productId,
            isRequired: validatedData.requiredProductIds?.includes(productId) ?? true,
            order: index,
          })),
        },
      },
      include: {
        products: {
          include: {
            product: {
              include: {
                category: true,
                images: true,
                variants: true,
              },
            },
          },
        },
      },
    });

    // CRITICAL FIX: Revalidate cache with tags for efficient invalidation
    try {
      // Revalidate complete-looks tags
      revalidateTag(CACHE_TAGS.completeLooks);
      
      // Revalidate paths
      revalidatePath('/admin/looks');
      revalidatePath('/looks');
      revalidatePath('/style-guide');
      revalidatePath('/api/complete-looks');
    } catch (revalidateError) {
      logger.error('Failed to revalidate cache:', revalidateError);
    }

    // Log activity
    await logActivity({
      adminUserId: auth.user!.id,
      action: ActivityActions.COMPLETE_LOOK_CREATED,
      resource: 'CompleteLook',
      resourceId: completeLook.id,
      details: {
        name: completeLook.name,
        slug: completeLook.slug,
        productCount: validatedData.productIds.length,
      },
    }, request);

    return apiSuccess(
      completeLook,
      'Complete look created successfully',
      { statusCode: 201 }
    );
  } catch (error) {
    logger.error("❌ POST /api/admin/complete-looks error:", error);
    return apiError(
      "Failed to create complete look",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
