import { NextResponse, NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError, apiNotFound, apiValidationError } from "@/lib/utils/api-response";
import { z } from "zod";
import { updateCategorySchema, validate } from "@/lib/validation/schemas";
import { parseJsonBody } from "@/lib/utils/parse-body";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { logActivity, ActivityActions } from "@/lib/services/admin/activity.service";
import { CACHE_TAGS, revalidateCollectionPage } from "@/lib/utils/cache-revalidation";
import type { Prisma } from "@prisma/client";
import { withCors } from "@/lib/utils/cors";
import { normalizeUrlSlug } from "@/lib/utils/slug";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // RBAC: Viewing categories requires viewer role or higher
  const auth = await authenticateAndAuthorize(request, 'viewer');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return withCors(request, NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 }));
  }
  try {
    if (!prisma) {
      return withCors(request, apiError("Database not available", 500));
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
      return withCors(request, apiNotFound("Category"));
    }

    return withCors(request, apiSuccess(category, "Category fetched successfully"));
  } catch (error) {
    logger.error("Failed to fetch category:", error);
    return withCors(request, apiError(
      "Failed to fetch category",
      500,
      error instanceof Error ? error.message : "Unknown error"
    ));
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
    return withCors(request, NextResponse.json({ error: 'Insufficient permissions. Admin role required to update categories.' }, { status: 403 }));
  }

  try {
    if (!prisma) {
      return withCors(request, apiError("Database not available", 500));
    }

    const { id } = await params;
    const parsed = await parseJsonBody(request);
    if (!parsed.ok) return withCors(request, parsed.response);
    const body = parsed.data;

    // Log request in development for debugging
    if (process.env.NODE_ENV === 'development' && body && typeof body === 'object') {
      const b = body as Record<string, unknown>;
      logger.log('Category update request:', {
        id,
        body: {
          hasName: !!b.name,
          hasSlug: !!b.slug,
          hasDescription: !!b.description,
          isActive: b.isActive,
        },
      });
    }

    // Validate input
    const validation = validate(updateCategorySchema, body);
    if (!validation.success) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Category validation failed:', validation.errors);
      }
      return withCors(request, apiValidationError(validation.errors));
    }

    // After the success check, extract with explicit type assertion
    // The transform on the schema makes TypeScript lose type info, so we assert it
    const validatedData = validation.data as {
      name?: string;
      slug?: string;
      description?: string;
      image?: string;
      isActive?: boolean;
    };

    // Check if category exists
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return withCors(request, apiNotFound("Category"));
    }

    // Resolve slug: explicit (normalized) or derived from name
    let finalSlug: string | undefined;
    if (validatedData.slug) {
      finalSlug = normalizeUrlSlug(validatedData.slug, "category");
    } else if (validatedData.name) {
      finalSlug = normalizeUrlSlug(validatedData.name, "category");
      const generatedSlugExists = await prisma.category.findFirst({
        where: {
          slug: finalSlug,
          id: { not: id },
        },
      });
      if (generatedSlugExists) {
        finalSlug = `${finalSlug}-${Date.now()}`;
      }
    }

    // Uniqueness when slug changes (explicit or regenerated)
    if (finalSlug !== undefined && finalSlug !== existing.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: finalSlug },
      });
      if (slugExists) {
        return withCors(request, apiError(
          "Category with this slug already exists",
          409,
          `A category with slug "${finalSlug}" already exists. Please use a different slug.`
        ));
      }
    }

    // Type-safe data preparation for Prisma
    const updateData: Prisma.CategoryUpdateInput = {
      ...(validatedData.name !== undefined && { name: validatedData.name }),
      ...(finalSlug !== undefined && { slug: finalSlug }),
      ...(validatedData.description !== undefined && { description: validatedData.description || null }),
      ...(validatedData.image !== undefined && { image: validatedData.image || null }),
      ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
    };

    // Log update data in development
    if (process.env.NODE_ENV === 'development') {
      logger.log('Updating category with data:', updateData);
    }

    let category;
    try {
      category = await prisma.category.update({
        where: { id },
        data: updateData,
      });
    } catch (prismaError) {
      // Handle Prisma-specific errors
      if (prismaError instanceof Error) {
        // Check for unique constraint violation
        if (prismaError.message.includes('Unique constraint') || prismaError.message.includes('duplicate key')) {
          return withCors(request, apiError(
            "Category with this slug already exists",
            409,
            "A category with this slug already exists. Please use a different slug."
          ));
        }
        // Check for foreign key constraint
        if (prismaError.message.includes('Foreign key constraint')) {
          return withCors(request, apiError(
            "Cannot update category: constraint violation",
            400,
            prismaError.message
          ));
        }
      }
      // Re-throw if not a handled error
      throw prismaError;
    }

    // Revalidate so /collections/[slug] reflects changes
    try {
      // Tag-based revalidation (most efficient)
      revalidateTag(CACHE_TAGS.categories);
      revalidateTag(CACHE_TAGS.collections);
      revalidateTag(CACHE_TAGS.category(existing.slug));
      if (category.slug !== existing.slug) {
        revalidateTag(CACHE_TAGS.category(category.slug));
      }
      revalidateTag(CACHE_TAGS.homepage);
      
      // Path-based revalidation (for immediate updates)
      revalidatePath("/admin/categories");
      revalidatePath("/collections");
      revalidatePath(`/collections/${existing.slug}`);
      if (category.slug !== existing.slug) {
        revalidatePath(`/collections/${category.slug}`);
      }
      revalidatePath("/");
      
      logger.log(`[Cache] Revalidated category update: ${existing.slug} → ${category.slug} (tags + paths)`);
    } catch (e) {
      logger.error("Failed to revalidate after category update:", e);
      // Don't fail the request if revalidation fails
    }

    await logActivity({
      adminUserId: auth.user!.id,
      action: ActivityActions.CATEGORY_UPDATED,
      resource: 'Category',
      resourceId: id,
      details: {
        name: category.name,
        changes: validatedData,
      },
    }, request);

    return withCors(request, apiSuccess(category, "Category updated successfully"));
  } catch (error: unknown) {
    logger.error("Failed to update category:", error);
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((e) => {
        errors[e.path.join(".")] = e.message;
      });
      return withCors(request, apiValidationError(errors));
    }

    // Provide more detailed error messages
    let errorMessage = "Failed to update category";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle specific error types
      if (error.message.includes('Unique constraint') || error.message.includes('duplicate key')) {
        statusCode = 409;
        errorMessage = "A category with this slug already exists. Please use a different slug.";
      } else if (error.message.includes('Foreign key constraint')) {
        statusCode = 400;
        errorMessage = "Cannot update category due to database constraints.";
      } else if (error.message.includes('Record to update not found')) {
        statusCode = 404;
        errorMessage = "Category not found.";
      }
      
      // Log full error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('[Category Update] Full error:', error);
        console.error('[Category Update] Error stack:', error.stack);
      }
    }
    
    return withCors(request, apiError(
      errorMessage,
      statusCode,
      error instanceof Error ? error.message : "Unknown error"
    ));
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
    return withCors(request, NextResponse.json({ error: 'Insufficient permissions. Admin role required to delete categories.' }, { status: 403 }));
  }

  try {
    if (!prisma) {
      return withCors(request, apiError("Database not available", 500));
    }

    const { id } = await params;

    // Check if category exists
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return withCors(request, apiNotFound("Category"));
    }

    const categoryName = existing.name;

    await prisma.category.delete({
      where: { id },
    });

    // Revalidate cache after deletion
    try {
      // Tag-based revalidation
      revalidateTag(CACHE_TAGS.categories);
      revalidateTag(CACHE_TAGS.collections);
      revalidateTag(CACHE_TAGS.category(existing.slug));
      revalidateTag(CACHE_TAGS.homepage);
      
      // Path-based revalidation
      revalidatePath("/admin/categories");
      revalidatePath("/collections");
      revalidatePath(`/collections/${existing.slug}`);
      revalidatePath("/");
      
      logger.log(`[Cache] Revalidated category deletion: ${existing.slug} (tags + paths)`);
    } catch (e) {
      logger.error("Failed to revalidate after category deletion:", e);
      // Don't fail the request if revalidation fails
    }

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

    return withCors(request, apiSuccess({ id }, "Category deleted successfully"));
  } catch (error) {
    logger.error("Failed to delete category:", error);
    
    // Handle foreign key constraint errors
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return withCors(request, apiError(
        "Cannot delete category: it is being used by products",
        409,
        "Remove all products from this category first"
      ));
    }
    
    return withCors(request, apiError(
      "Failed to delete category",
      500,
      error instanceof Error ? error.message : "Unknown error"
    ));
  }
}
