import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError, apiNotFound, apiValidationError } from "@/lib/utils/api-response";
import { updateCategorySchema, validate } from "@/lib/validation/schemas";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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

    const category = await prisma.category.update({
      where: { id },
      data: validation.data,
    });

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

    await prisma.category.delete({
      where: { id },
    });

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
