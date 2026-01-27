import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError, apiNotFound, apiValidationError } from "@/lib/utils/api-response";
import { updateCategorySchema, validate } from "@/lib/validation/schemas";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { logActivity, ActivityActions } from "@/lib/services/admin/activity.service";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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

    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!category) {
      return apiNotFound("Category");
    }

    return apiSuccess(category, "Category fetched successfully");
  } catch (error) {
    logger.error("Failed to fetch category:", error);
    return apiError(
      "Failed to fetch category",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // RBAC: Updating categories requires admin role or higher
  const auth = await authenticateAndAuthorize(request, 'admin');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions. Admin role required to update categories.' }, { status: 403 });
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = validate(updateCategorySchema, body);
    if (!validation.success) {
      return apiValidationError(validation.errors);
    }

    // Check if category exists
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return apiNotFound("Category");
    }

    // Type-safe data preparation for Prisma
    const updateData: Prisma.CategoryUpdateInput = {
      ...(validation.data.name !== undefined && { name: validation.data.name }),
      ...(validation.data.slug !== undefined && { slug: validation.data.slug }),
      ...(validation.data.description !== undefined && { description: validation.data.description }),
      ...(validation.data.image !== undefined && { image: validation.data.image }),
      ...(validation.data.isActive !== undefined && { isActive: validation.data.isActive }),
    };

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    // Log activity
    await logActivity({
      adminUserId: auth.user!.id,
      action: ActivityActions.CATEGORY_UPDATED,
      resource: 'Category',
      resourceId: id,
      details: {
        name: category.name,
        changes: validation.data,
      },
    }, request);

    return apiSuccess(category, "Category updated successfully");
  } catch (error) {
    logger.error("Failed to update category:", error);
    return apiError(
      "Failed to update category",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // RBAC: Deleting categories requires admin role or higher
  const auth = await authenticateAndAuthorize(request, 'admin');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions. Admin role required to delete categories.' }, { status: 403 });
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { id } = await params;

    // Check if category exists
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return apiNotFound("Category");
    }

    const categoryName = existing.name;

    await prisma.category.delete({
      where: { id },
    });

    // Log activity
    await logActivity({
      adminUserId: auth.user!.id,
      action: ActivityActions.CATEGORY_DELETED,
      resource: 'Category',
      resourceId: id,
      details: {
        name: categoryName,
      },
    }, request);

    return apiSuccess({ id }, "Category deleted successfully");
  } catch (error) {
    logger.error("Failed to delete category:", error);
    
    // Handle foreign key constraint errors
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return apiError(
        "Cannot delete category: it is being used by products",
        409,
        "Remove all products from this category first"
      );
    }
    
    return apiError(
      "Failed to delete category",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
