import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError, apiNotFound, apiValidationError } from "@/lib/utils/api-response";
import { updateCollectionSchema, validate } from "@/lib/validation/schemas";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { logActivity, ActivityActions } from "@/lib/services/admin/activity.service";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // RBAC: Viewing collections requires viewer role or higher
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
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            productId: true,
          },
        },
      },
    });

    if (!collection) {
      return apiNotFound("Collection");
    }

    return apiSuccess(collection, "Collection fetched successfully");
  } catch (error) {
    logger.error("Failed to fetch collection:", error);
    return apiError(
      "Failed to fetch collection",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // RBAC: Updating collections requires admin role or higher
  const auth = await authenticateAndAuthorize(request, 'admin');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions. Admin role required to update collections.' }, { status: 403 });
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = validate(updateCollectionSchema, body);
    if (!validation.success) {
      return apiValidationError(validation.errors);
    }

    // Extract validated data after success check with type assertion
    const validatedData = validation.data as {
      name?: string;
      slug?: string;
      description?: string;
      image?: string;
      bannerImage?: string;
      isActive?: boolean;
    };

    // Check if collection exists
    const existing = await prisma.collection.findUnique({ where: { id } });
    if (!existing) {
      return apiNotFound("Collection");
    }

    // Build update data object
    const updateData: Prisma.CollectionUpdateInput = {
      ...(validatedData.name !== undefined && { name: validatedData.name }),
      ...(validatedData.slug !== undefined && { slug: validatedData.slug }),
      ...(validatedData.description !== undefined && { description: validatedData.description }),
      ...(validatedData.image !== undefined && { image: validatedData.image }),
      ...(validatedData.bannerImage !== undefined && { bannerImage: validatedData.bannerImage }),
      ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
    };

    const collection = await prisma.collection.update({
      where: { id },
      data: updateData,
    });

    // Revalidate cache
    try {
      revalidatePath('/collections');
      revalidatePath(`/collections/${collection.slug}`);
      revalidatePath('/admin/collections');
    } catch (revalidateError) {
      logger.error('Failed to revalidate cache:', revalidateError);
    }

    // Log activity
    await logActivity({
      adminUserId: auth.user!.id,
      action: ActivityActions.COLLECTION_UPDATED,
      resource: 'Collection',
      resourceId: id,
      details: {
        name: collection.name,
        changes: validatedData,
      },
    }, request);

    return apiSuccess(collection, "Collection updated successfully");
  } catch (error) {
    logger.error("Failed to update collection:", error);
    return apiError(
      "Failed to update collection",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // RBAC: Deleting collections requires admin role or higher
  const auth = await authenticateAndAuthorize(request, 'admin');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions. Admin role required to delete collections.' }, { status: 403 });
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { id } = await params;

    // Check if collection exists
    const existing = await prisma.collection.findUnique({ where: { id } });
    if (!existing) {
      return apiNotFound("Collection");
    }

    const collectionName = existing.name;

    await prisma.collection.delete({
      where: { id },
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
      action: ActivityActions.COLLECTION_DELETED,
      resource: 'Collection',
      resourceId: id,
      details: {
        name: collectionName,
      },
    }, request);

    return apiSuccess({ id }, "Collection deleted successfully");
  } catch (error) {
    logger.error("Failed to delete collection:", error);
    
    // Handle foreign key constraint errors
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return apiError(
        "Cannot delete collection: it is being used by products",
        409,
        "Remove all products from this collection first"
      );
    }
    
    return apiError(
      "Failed to delete collection",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
