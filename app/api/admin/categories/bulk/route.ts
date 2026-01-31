import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError, apiValidationError } from "@/lib/utils/api-response";
import { parseJsonBody } from "@/lib/utils/parse-body";
import { bulkCategoriesSchema, validate } from "@/lib/validation/schemas";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { logActivity, ActivityActions } from "@/lib/services/admin/activity.service";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/utils/cache-revalidation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  // RBAC: Bulk actions require admin role or higher
  const auth = await authenticateAndAuthorize(request, 'admin');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const parsed = await parseJsonBody(request);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

    const validation = validate(bulkCategoriesSchema, body);
    if (!validation.success) {
      return apiValidationError(validation.errors);
    }

    const { ids, action } = validation.data;

    // Verify all categories exist
    const categories = await prisma.category.findMany({
      where: { id: { in: ids } },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (categories.length !== ids.length) {
      return apiError("Some categories not found", 404);
    }

    let result;
    const categoryNames = categories.map(c => c.name);

    switch (action) {
      case 'delete': {
        // Check if any categories have products
        const categoriesWithProducts = categories.filter(c => (c._count?.products || 0) > 0);
        if (categoriesWithProducts.length > 0) {
          return apiError(
            "Cannot delete categories with products",
            409,
            `The following categories have products and cannot be deleted: ${categoriesWithProducts.map(c => c.name).join(', ')}`
          );
        }

        // Delete categories
        result = await prisma.category.deleteMany({
          where: { id: { in: ids } },
        });

        // Log activity for each deletion
        for (const category of categories) {
          await logActivity({
            adminUserId: auth.user!.id,
            action: ActivityActions.CATEGORY_DELETED,
            resource: 'Category',
            resourceId: category.id,
            details: { name: category.name },
          }, request);
        }
        break;
      }

      case 'activate': {
        result = await prisma.category.updateMany({
          where: { id: { in: ids } },
          data: { isActive: true },
        });

        await logActivity({
          adminUserId: auth.user!.id,
          action: ActivityActions.CATEGORY_UPDATED,
          resource: 'Category',
          resourceId: ids[0],
          details: {
            action: 'bulk_activate',
            count: ids.length,
            categories: categoryNames,
          },
        }, request);
        break;
      }

      case 'deactivate': {
        result = await prisma.category.updateMany({
          where: { id: { in: ids } },
          data: { isActive: false },
        });

        await logActivity({
          adminUserId: auth.user!.id,
          action: ActivityActions.CATEGORY_UPDATED,
          resource: 'Category',
          resourceId: ids[0],
          details: {
            action: 'bulk_deactivate',
            count: ids.length,
            categories: categoryNames,
          },
        }, request);
        break;
      }
    }

    // Revalidate cache
    try {
      revalidateTag(CACHE_TAGS.categories);
      revalidateTag(CACHE_TAGS.collections);
      revalidateTag(CACHE_TAGS.homepage);
      revalidatePath("/admin/categories");
      revalidatePath("/collections");
      revalidatePath("/");
    } catch (e) {
      logger.error("Failed to revalidate after bulk action:", e);
    }

    const count = result?.count ?? 0;
    return apiSuccess(
      {
        count,
        action,
        categories: categoryNames,
      },
      `Successfully ${action === 'delete' ? 'deleted' : action === 'activate' ? 'activated' : 'deactivated'} ${count} categor${count === 1 ? 'y' : 'ies'}`
    );
  } catch (error: unknown) {
    logger.error("Bulk action error:", error);
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((e) => {
        errors[e.path.join(".")] = e.message;
      });
      return apiValidationError(errors);
    }
    return apiError(
      "Failed to perform bulk action",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
