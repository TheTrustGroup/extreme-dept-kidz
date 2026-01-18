import { NextRequest, NextResponse } from "next/server";
import { getAllCategories, createCategory } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { apiSuccess, apiError, apiValidationError } from "@/lib/utils/api-response";
import { createCategorySchema, validate } from "@/lib/validation/schemas";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { logActivity, ActivityActions } from "@/lib/services/admin/activity.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  // RBAC: Viewing categories requires viewer role or higher
  const auth = await authenticateAndAuthorize(request, 'viewer');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }
  try {
    const categories = await getAllCategories();
    
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

    const { name, description, image, isActive } = validation.data;

    // Generate slug if not provided
    const slug = validation.data.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const category = await createCategory({
      name,
      slug,
      description: description || '',
      image: image || '',
      isActive: isActive !== undefined ? isActive : true,
    });

    // Revalidate cache
    try {
      revalidatePath('/admin/categories');
      revalidatePath('/collections');
    } catch (revalidateError) {
      logger.error('Failed to revalidate cache:', revalidateError);
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
