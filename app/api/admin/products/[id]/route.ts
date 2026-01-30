import { NextResponse, NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { revalidateCategoryChange, revalidateAllCollectionPages, CACHE_TAGS } from "@/lib/utils/cache-revalidation";
import { triggerProductUpdatedWebhook } from "@/lib/utils/trigger-product-webhook";
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
        images: {
          orderBy: { order: 'asc' },
        },
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

    // Transform to include categoryId for form compatibility
    const productWithCategoryId = {
      ...product,
      categoryId: product.categoryId || product.category?.id,
    };

    return apiSuccess(productWithCategoryId, "Product fetched successfully");
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

    // Use validated data (after transforms)
    const validatedData = validation.data;

    // Build update data object with only provided fields
    const updateData: any = {};
    
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.slug !== undefined) updateData.slug = validatedData.slug;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.price !== undefined) {
      const priceValue = typeof validatedData.price === 'number' 
        ? validatedData.price 
        : parseFloat(String(validatedData.price));
      if (!isNaN(priceValue)) {
        updateData.price = Math.round(priceValue * 100);
      }
    }
    if (validatedData.originalPrice !== undefined) {
      if (validatedData.originalPrice) {
        const originalPriceValue = typeof validatedData.originalPrice === 'number' 
          ? validatedData.originalPrice 
          : parseFloat(String(validatedData.originalPrice));
        if (!isNaN(originalPriceValue)) {
          updateData.originalPrice = Math.round(originalPriceValue * 100);
        } else {
          updateData.originalPrice = null;
        }
      } else {
        updateData.originalPrice = null;
      }
    }
    if (validatedData.sku !== undefined) updateData.sku = validatedData.sku;
    if (validatedData.categoryId !== undefined) updateData.categoryId = validatedData.categoryId;
    if (validatedData.inStock !== undefined) updateData.inStock = validatedData.inStock;

    // Handle images update
    if (validatedData.images !== undefined && Array.isArray(validatedData.images)) {
      // Schema transforms images to array of strings, but TypeScript needs help with type inference
      const imageUrls = validatedData.images.map((img: string | { url: string; alt?: string; isPrimary?: boolean }) => {
        return typeof img === 'string' ? img : img.url;
      });
      
      updateData.images = {
        deleteMany: {},
        create: imageUrls.map((url: string, index: number) => ({
          url: String(url).trim(),
          alt: `${validatedData.name || existing.name} - Image ${index + 1}`,
          isPrimary: index === 0,
          order: index,
        })),
      };
    }

    // Handle sizes/variants update
    if (validatedData.sizes !== undefined && Array.isArray(validatedData.sizes)) {
      updateData.variants = {
        deleteMany: {},
        create: validatedData.sizes.map((size: { size: string; quantity: string | number; sku?: string }) => {
          // Schema transforms quantity to number, but TypeScript needs help with type inference
          const quantity = typeof size.quantity === 'number' 
            ? size.quantity 
            : parseInt(String(size.quantity), 10);
          const stock = isNaN(quantity) ? 0 : Math.max(0, quantity);
          
          return {
            size: size.size,
            stock,
            sku: size.sku || `${validatedData.sku || existing.sku || 'SKU'}-${size.size}`,
          };
        }),
      };
    }

    // Handle tags update
    if (validatedData.tags !== undefined && Array.isArray(validatedData.tags)) {
      updateData.tags = {
        deleteMany: {},
        create: validatedData.tags.map((tag: string) => ({ name: tag.trim() })).filter((tag: { name: string }) => tag.name),
      };
    }

    // Get existing product to check if category changed
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        images: true,
        variants: true,
        tags: true,
      },
    });

    // Revalidate cache to show updated product immediately
    try {
      const { revalidateProduct, revalidateCategoryChange, revalidateAllCollectionPages } = await import('@/lib/utils/cache-revalidation');
      // When slug changed: revalidate OLD slug so /products/old-slug shows notFound, not stale content
      if (existingProduct?.slug && existingProduct.slug !== product.slug) {
        revalidatePath(`/products/${existingProduct.slug}`, 'page');
        revalidateTag(CACHE_TAGS.product(existingProduct.slug));
      }
      revalidateProduct(product.slug, product.id);
      
      // CRITICAL FIX: Revalidate complete-looks cache when products are updated
      // This ensures "Complete The Look" sections update immediately
      revalidateTag(CACHE_TAGS.completeLooks);
      if (product.id) {
        revalidateTag(CACHE_TAGS.completeLookProduct(product.id));
      }
      // Also revalidate for old product ID if it changed
      if (existingProduct?.id && existingProduct.id !== product.id) {
        revalidateTag(CACHE_TAGS.completeLookProduct(existingProduct.id));
      }
      
      // Revalidate admin pages
      revalidatePath('/admin/products');
      revalidatePath('/api/products');
      
      // Revalidate collection pages (handles category changes automatically)
      await revalidateCategoryChange(
        existingProduct?.category?.slug,
        product.category?.slug
      );
      
      // Also ensure all collection pages are fresh
      await revalidateAllCollectionPages();
    } catch (revalidateError) {
      logger.error('Failed to revalidate cache:', revalidateError);
      // Don't fail the request if revalidation fails
    }

    triggerProductUpdatedWebhook({
      productId: product.id,
      productSlug: product.slug,
      action: "updated",
      categorySlug: product.category?.slug ?? undefined,
    });

    // Log activity
    await logActivity({
      adminUserId: auth.user!.id,
      action: ActivityActions.PRODUCT_UPDATED,
      resource: 'Product',
      resourceId: id,
      details: {
        name: product.name,
        changes: {
          name: validatedData.name || undefined,
          price: validatedData.price !== undefined ? validatedData.price : undefined,
          sku: validatedData.sku || undefined,
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
      // CRITICAL: Revalidate the deleted product's detail page so /products/[slug] shows notFound, not stale cache
      revalidatePath(`/products/${existing.slug}`, 'page');
      revalidateTag(CACHE_TAGS.product(existing.slug));
      // Revalidate tags so frontend and API caches show updated product list
      revalidateTag(CACHE_TAGS.products);
      revalidateTag(CACHE_TAGS.homepage);
      revalidateTag(CACHE_TAGS.collections);
      revalidateTag(CACHE_TAGS.categories);
      revalidateTag(CACHE_TAGS.completeLooks);
      revalidateTag(CACHE_TAGS.completeLookProduct(id));
      revalidatePath('/products');
      revalidatePath('/collections');
      revalidatePath('/');
      revalidatePath('/admin/products');
      revalidatePath('/api/products');
      await revalidateAllCollectionPages();
    } catch (revalidateError) {
      logger.error('Failed to revalidate cache:', revalidateError);
      // Don't fail the request if revalidation fails
    }

    triggerProductUpdatedWebhook({
      productId: id,
      productSlug: existing.slug,
      action: "deleted",
    });

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
