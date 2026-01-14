import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError, apiNotFound, apiValidationError } from "@/lib/utils/api-response";
import { updateCollectionSchema, validate } from "@/lib/validation/schemas";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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

    // Check if collection exists
    const existing = await prisma.collection.findUnique({ where: { id } });
    if (!existing) {
      return apiNotFound("Collection");
    }

    const collection = await prisma.collection.update({
      where: { id },
      data: validation.data,
    });

    // Revalidate cache
    try {
      revalidatePath('/collections');
      revalidatePath(`/collections/${collection.slug}`);
      revalidatePath('/admin/collections');
    } catch (revalidateError) {
      logger.error('Failed to revalidate cache:', revalidateError);
    }

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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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
