import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { apiSuccess, apiError, apiValidationError } from "@/lib/utils/api-response";
import { createCategorySchema, validate } from "@/lib/validation/schemas";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { logActivity, ActivityActions } from "@/lib/services/admin/activity.service";
import { CACHE_TAGS, revalidateCollectionPage } from "@/lib/utils/cache-revalidation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  // RBAC: Viewing categories requires viewer role or higher
  const auth = await authenticateAndAuthorize(request, 'viewer');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }
  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: { select: { products: true } },
      },
    });
    
    return apiSuccess(
      {
        categories,
        count: categories.length,
      },
      'Categories fetched successfully'
    );
  } catch (error) {
    logger.error("❌ GET /api/admin/categories error:", error);
    return apiError(
      "Failed to fetch categories",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // RBAC: Creating categories requires admin role or higher
  const auth = await authenticateAndAuthorize(request, 'admin');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions. Admin role required to create categories.' }, { status: 403 });
  }

  try {
    const body = await request.json();

    // Validate input
    const validation = validate(createCategorySchema, body);
    if (!validation.success) {
      return apiValidationError(validation.errors);
    }

    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { name, description, image, isActive } = validation.data;

    // Generate slug if not provided
    const slug = validation.data.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return apiError(
        "Category with this slug already exists",
        409,
        `A category with slug "${slug}" already exists. Please use a different slug.`
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        image: image || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    // Revalidate cache so /collections/[slug] shows new category immediately
    try {
      // Tag-based revalidation (most efficient)
      revalidateTag(CACHE_TAGS.categories);
      revalidateTag(CACHE_TAGS.collections);
      revalidateTag(CACHE_TAGS.category(category.slug));
      revalidateTag(CACHE_TAGS.homepage);
      
      // Path-based revalidation (for immediate updates)
      revalidatePath('/admin/categories');
      revalidatePath('/collections');
      revalidatePath(`/collections/${category.slug}`);
      revalidatePath('/');
      
      logger.log(`[Cache] Revalidated category: ${category.slug} (tags + paths)`);
    } catch (revalidateError) {
      logger.error('Failed to revalidate cache:', revalidateError);
      // Don't fail the request if revalidation fails
    }

    // Log activity
    await logActivity({
      adminUserId: auth.user!.id,
      action: ActivityActions.CATEGORY_CREATED,
      resource: 'Category',
      resourceId: category.id,
      details: {
        name: category.name,
        slug: category.slug,
      },
    }, request);
    
    return apiSuccess(
      category,
      "Category created successfully",
      { statusCode: 201 }
    );
  } catch (error) {
    logger.error("❌ POST /api/admin/categories error:", error);
    return apiError(
      "Failed to create category",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
