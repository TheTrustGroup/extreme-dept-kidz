import { NextResponse, NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError, apiNotFound, apiValidationError } from "@/lib/utils/api-response";
import { updateProductSchema, validate } from "@/lib/validation/schemas";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { logActivity, ActivityActions } from "@/lib/services/admin/activity.service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // RBAC: Viewing products requires viewer role or higher
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
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        variants: true,
        tags: true,
        collections: {
          include: {
            collection: true,
          },
        },
      },
    });

    if (!product) {
      return apiNotFound("Product");
    }

    return apiSuccess(product, "Product fetched successfully");
  } catch (error) {
    logger.error("Failed to fetch product:", error);
    return apiError(
      "Failed to fetch product",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // Store request for activity logging
  const requestForLogging = request;
  // RBAC: Updating products requires admin role or higher
  const auth = await authenticateAndAuthorize(request, 'admin');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions. Admin role required to update products.' }, { status: 403 });
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input (partial validation for updates)
    const validation = validate(updateProductSchema, body);
    if (!validation.success) {
      return apiValidationError(validation.errors);
    }

    // Check if product exists
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return apiNotFound("Product");
    }

    const {
      name,
      slug,
      description,
      price,
      compareAtPrice,
      sku,
      categoryId,
      images,
      sizes,
      tags,
    } = validation.data;

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description && { description }),
        ...(price !== undefined && { price: Math.round(price * 100) }),
        ...(compareAtPrice !== undefined && { 
          originalPrice: compareAtPrice ? Math.round(compareAtPrice * 100) : null 
        }),
        ...(sku && { sku }),
        ...(categoryId && { categoryId }),
        // Note: For simplicity, we're replacing all related data
        // In production, you'd want to handle updates more carefully
        ...(images && {
          images: {
            deleteMany: {},
            create: images.map((url: string, index: number) => ({
              url,
              alt: `${name || existing.name} - Image ${index + 1}`,
              isPrimary: index === 0,
              order: index,
            })),
          },
        }),
        ...(sizes && {
          variants: {
            deleteMany: {},
            create: sizes.map((size: { size: string; quantity: number; sku?: string }) => ({
              size: size.size,
              stock: size.quantity,
              sku: size.sku || `${existing.sku || 'SKU'}-${size.size}`,
            })),
          },
        }),
        ...(tags && {
          tags: {
            deleteMany: {},
            create: tags.map((tag: string) => ({ name: tag })),
          },
        }),
      },
      include: {
        category: true,
        images: true,
        variants: true,
        tags: true,
      },
    });

    // Revalidate cache to show updated product immediately
    try {
      revalidatePath(`/products/${id}`);
      revalidatePath('/products');
      revalidatePath('/collections');
      revalidatePath('/');
    } catch (revalidateError) {
      logger.error('Failed to revalidate cache:', revalidateError);
      // Don't fail the request if revalidation fails
    }

    // Log activity
    await logActivity({
      adminUserId: auth.user!.id,
      action: ActivityActions.PRODUCT_UPDATED,
      resource: 'Product',
      resourceId: id,
      details: {
        name: product.name,
        changes: {
          name: name || undefined,
          price: price !== undefined ? price : undefined,
          sku: sku || undefined,
        },
      },
    }, requestForLogging);

    return apiSuccess(product, "Product updated successfully");
  } catch (error) {
    logger.error("Failed to update product:", error);
    return apiError(
      "Failed to update product",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // Store request for activity logging
  const requestForLogging = request;
  // RBAC: Deleting products requires admin role or higher
  const auth = await authenticateAndAuthorize(request, 'admin');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions. Admin role required to delete products.' }, { status: 403 });
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { id } = await params;

    // Check if product exists
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return apiNotFound("Product");
    }

    // Store product info for logging before deletion
    const productName = existing.name;
    const productSku = existing.sku;

    await prisma.product.delete({
      where: { id },
    });

    // Revalidate cache after deletion
    try {
      revalidatePath('/products');
      revalidatePath('/collections');
      revalidatePath('/');
    } catch (revalidateError) {
      logger.error('Failed to revalidate cache:', revalidateError);
      // Don't fail the request if revalidation fails
    }

    // Log activity
    await logActivity({
      adminUserId: auth.user!.id,
      action: ActivityActions.PRODUCT_DELETED,
      resource: 'Product',
      resourceId: id,
      details: {
        name: productName,
        sku: productSku,
      },
    }, requestForLogging);

    return apiSuccess({ id }, "Product deleted successfully");
  } catch (error) {
    logger.error("Failed to delete product:", error);
    
    // Handle foreign key constraint errors
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return apiError(
        "Cannot delete product: it is associated with orders",
        409,
        "Archive the product instead of deleting it"
      );
    }
    
    return apiError(
      "Failed to delete product",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
