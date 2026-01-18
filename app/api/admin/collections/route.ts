import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { createCollectionSchema, validate } from "@/lib/validation/schemas";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { logActivity, ActivityActions } from "@/lib/services/admin/activity.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  // RBAC: Viewing collections requires viewer role or higher
  const auth = await authenticateAndAuthorize(request, 'viewer');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }
  try {
    if (!prisma) {
      // Return empty array instead of error - collections are optional
      return apiSuccess([], "Collections fetched successfully (no database)");
    }

    const collections = await prisma.collection.findMany({
      include: {
        products: {
          select: {
            productId: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return apiSuccess(
      {
        collections,
        count: collections.length,
      },
      "Collections fetched successfully"
    );
  } catch (error) {
    logger.error("Failed to fetch collections:", error);
    // Return empty array instead of error - collections are optional
    return apiSuccess([], "Collections fetched successfully (fallback)");
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // RBAC: Creating collections requires admin role or higher
  const auth = await authenticateAndAuthorize(request, 'admin');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions. Admin role required to create collections.' }, { status: 403 });
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const body = await request.json();

    // Validate input
    const validation = validate(createCollectionSchema, body);
    if (!validation.success) {
      return apiError(
        "Validation failed",
        400,
        JSON.stringify(validation.errors)
      );
    }

    const { name, slug, description, image, isActive } = validation.data;

    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const collection = await prisma.collection.create({
      data: {
        name,
        slug: finalSlug,
        description: description || '',
        image: image || '',
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    // Revalidate cache
    try {
      revalidatePath('/collections');
      revalidatePath('/admin/collections');
    } catch (revalidateError) {
      logger.error('Failed to revalidate cache:', revalidateError);
    }

    // Log activity
    await logActivity({
      adminUserId: auth.user!.id,
      action: ActivityActions.COLLECTION_CREATED,
      resource: 'Collection',
      resourceId: collection.id,
      details: {
        name: collection.name,
        slug: collection.slug,
      },
    }, request);

    return apiSuccess(collection, "Collection created successfully", { statusCode: 201 });
  } catch (error) {
    logger.error("Failed to create collection:", error);
    return apiError(
      "Failed to create collection",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
