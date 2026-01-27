import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
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

    const looks = await prisma.completeLook.findMany({
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
    const existingLook = await prisma.completeLook.findUnique({
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
    let bundlePrice = Math.round(validatedData.bundlePrice * 100); // Convert to cents
    if (validatedData.bundleDiscount && validatedData.bundleDiscount > 0) {
      const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
      const discountAmount = Math.round(totalPrice * (validatedData.bundleDiscount / 100));
      bundlePrice = totalPrice - discountAmount;
    }

    // Create complete look
    const completeLook = await prisma.completeLook.create({
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

    // Revalidate cache
    try {
      revalidatePath('/admin/looks');
      revalidatePath('/looks');
      revalidatePath('/style-guide');
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
