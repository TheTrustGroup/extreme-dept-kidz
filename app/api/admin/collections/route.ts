import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { createCollectionSchema, validate } from "@/lib/validation/schemas";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest): Promise<NextResponse> {
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
