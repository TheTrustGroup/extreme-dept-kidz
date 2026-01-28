import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError, apiValidationError } from "@/lib/utils/api-response";
import { createProductSchema, validate } from "@/lib/validation/schemas";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { logActivity, ActivityActions } from "@/lib/services/admin/activity.service";
import { revalidateAllCollectionPages, revalidateCollectionPage, revalidateProduct, CACHE_TAGS } from "@/lib/utils/cache-revalidation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
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

    const prismaProducts = await prisma.product.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform Prisma products to Product type format (variants -> sizes)
    const products = prismaProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice ?? undefined,
      sku: p.sku ?? undefined,
      inStock: p.inStock,
      images: p.images.map((img) => ({
        url: img.url,
        alt: img.alt ?? undefined,
        isPrimary: img.isPrimary,
      })),
      sizes: p.variants.map((v) => ({
        size: v.size,
        inStock: v.stock > 0,
        quantity: v.stock,
      })),
      category: {
        id: p.category.id,
        name: p.category.name,
        slug: p.category.slug,
      },
      tags: p.tags.map((t) => t.name),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return apiSuccess(
      {
        products,
        count: products.length,
      },
      'Products fetched successfully'
    );
  } catch (error) {
    logger.error("❌ GET /api/admin/products error:", error);
    return apiError(
      "Failed to fetch products",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // RBAC: Creating products requires admin role or higher
  const auth = await authenticateAndAuthorize(request, 'admin');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions. Admin role required to create products.' }, { status: 403 });
  }

  try {
    const body = await request.json();

    // Log request body in development for debugging
    if (process.env.NODE_ENV === 'development') {
      logger.log('Product creation request:', {
        hasName: !!body.name,
        hasDescription: !!body.description,
        hasPrice: !!body.price,
        hasCategoryId: !!body.categoryId,
        imagesCount: Array.isArray(body.images) ? body.images.length : 0,
        sizesCount: Array.isArray(body.sizes) ? body.sizes.length : 0,
        sizes: body.sizes,
      });
    }

    // Validate input using Zod schema
    const validation = validate(createProductSchema, body);
    if (!validation.success) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Product validation failed:', validation.errors);
      }
      return apiValidationError(validation.errors);
    }

    if (!prisma) {
      return apiError("Database not available", 500);
    }

    // Use validated data (after transforms)
    const validatedData = validation.data;

    // Get category ID from validated data
    const categoryId = validatedData.categoryId;
    if (!categoryId) {
      return apiError("Category is required", 400, "Please provide a valid category ID");
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return apiError("Category not found", 404, `Category with ID "${categoryId}" does not exist`);
    }

    // Normalize images - validated data already has array of URL strings (schema transforms both formats to strings)
    const imageUrls = Array.isArray(validatedData.images)
      ? validatedData.images.map((img: string | { url: string; alt?: string; isPrimary?: boolean }) => {
          return typeof img === 'string' ? img : img.url;
        })
      : [];
    
    const images = imageUrls.map((url: string, index: number) => ({
      url: String(url).trim(),
      alt: `${validatedData.name} - Image ${index + 1}`,
      isPrimary: index === 0,
    }));

    // Normalize sizes/variants - validated data already has correct format (schema transforms quantity to number)
    const sizes = Array.isArray(validatedData.sizes)
      ? validatedData.sizes.map((size: { size: string; quantity: string | number; sku?: string }) => {
          // Schema transforms quantity to number, but TypeScript needs help with type inference
          const quantity = typeof size.quantity === 'number' 
            ? size.quantity 
            : parseInt(String(size.quantity), 10);
          const stock = isNaN(quantity) ? 0 : Math.max(0, quantity);
          
          return {
            size: size.size,
            stock,
            sku: size.sku || (validatedData.sku ? `${validatedData.sku}-${size.size}` : `SKU-${Date.now()}-${size.size}`),
          };
        })
      : [];

    // Normalize price - convert to cents (validated data has price as number in dollars)
    const priceValue = typeof validatedData.price === 'number' 
      ? validatedData.price 
      : parseFloat(String(validatedData.price));
    
    if (isNaN(priceValue) || priceValue <= 0) {
      return apiError(
        "Invalid price",
        400,
        "Price must be a positive number"
      );
    }
    
    const price = Math.round(priceValue * 100);

    // Normalize originalPrice
    let originalPrice: number | null = null;
    if (validatedData.originalPrice !== undefined && validatedData.originalPrice !== null) {
      const originalPriceValue = typeof validatedData.originalPrice === 'number' 
        ? validatedData.originalPrice 
        : parseFloat(String(validatedData.originalPrice));
      if (!isNaN(originalPriceValue) && originalPriceValue > 0) {
        originalPrice = Math.round(originalPriceValue * 100);
      }
    }

    // Generate slug if not provided
    const slug = validatedData.slug || String(validatedData.name || 'product').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });
    if (existingProduct) {
      return apiError(
        "Product with this slug already exists",
        409,
        `A product with slug "${slug}" already exists. Please use a different slug.`
      );
    }

    // Create product using Prisma
    const product = await prisma.product.create({
      data: {
        name: String(validatedData.name || '').trim(),
        slug,
        description: String(validatedData.description || '').trim(),
        price,
        originalPrice,
        sku: String(validatedData.sku || `SKU-${Date.now()}`).trim(),
        categoryId,
        inStock: validatedData.inStock !== undefined ? Boolean(validatedData.inStock) : sizes.some((s) => s.stock > 0),
        images: {
          create: images.map((img: { url: string; alt?: string; isPrimary?: boolean }, index: number) => ({
            url: img.url,
            alt: img.alt || `${body.name} - Image ${index + 1}`,
            isPrimary: img.isPrimary ?? (index === 0),
            order: index,
          })),
        },
        variants: {
          create: sizes.map((size: { size: string; stock: number; sku: string }) => ({
            size: size.size,
            stock: size.stock,
            sku: size.sku,
          })),
        },
        tags: {
          create: Array.isArray(validatedData.tags)
            ? validatedData.tags.map((tag: string) => ({ name: tag.trim() })).filter((tag: { name: string }) => tag.name)
            : [],
        },
      },
      include: {
        category: true,
        images: true,
        variants: true,
        tags: true,
      },
    });

    // Revalidate cache to ensure product appears immediately
    try {
      // Get category slug for specific revalidation
      const categorySlug = product.category?.slug;
      
      // CRITICAL: Revalidate tags FIRST (before paths) to ensure cache invalidation
      // This must happen before path revalidation for proper cache clearing
      revalidateTag(CACHE_TAGS.products);
      revalidateTag(CACHE_TAGS.collections);
      revalidateTag(CACHE_TAGS.categories);
      revalidateTag(CACHE_TAGS.homepage);
      
      if (categorySlug) {
        revalidateTag(CACHE_TAGS.category(categorySlug));
        revalidateTag(CACHE_TAGS.collection(categorySlug));
      }
      
      // Revalidate product-specific tags
      revalidateProduct(product.slug, product.id);
      
      // CRITICAL: Revalidate the specific category's collection page
      if (categorySlug) {
        revalidateCollectionPage(categorySlug);
        // Also revalidate the cache key used by unstable_cache
        revalidatePath(`/collections/${categorySlug}`, 'page');
        logger.log(`[Cache] Revalidated category collection page: /collections/${categorySlug}`);
      }
      
      // Revalidate all collection pages to ensure product appears everywhere
      await revalidateAllCollectionPages();
      
      // Revalidate admin pages
      revalidatePath('/admin/products', 'page');
      revalidatePath('/api/products', 'layout');
      
      // Revalidate homepage and product listing pages
      revalidatePath('/', 'page');
      revalidatePath('/products', 'page');
      revalidatePath('/collections', 'page');
      
      logger.log(`[Cache] Product created: ${product.name} - Revalidated cache for category: ${categorySlug || 'unknown'}`);
      logger.log(`[Cache] Product ID: ${product.id}, Category ID: ${product.categoryId}`);
      
      // In development, log detailed cache revalidation info
      if (process.env.NODE_ENV === 'development') {
        console.log('[Product Creation] Cache revalidation complete:', {
          productSlug: product.slug,
          productId: product.id,
          categorySlug: categorySlug,
          categoryId: product.categoryId,
        });
      }
    } catch (revalidateError) {
      logger.error('Failed to revalidate cache:', revalidateError);
      // Don't fail the request if revalidation fails, but log it
      if (process.env.NODE_ENV === 'development') {
        console.error('[Product Creation] Cache revalidation error:', revalidateError);
        console.error('[Product Creation] Error stack:', revalidateError instanceof Error ? revalidateError.stack : 'No stack trace');
      }
    }

    // Log activity
    await logActivity({
      adminUserId: auth.user!.id,
      action: ActivityActions.PRODUCT_CREATED,
      resource: 'Product',
      resourceId: product.id,
      details: {
        name: product.name,
        price: product.price,
        sku: product.sku,
      },
    }, request);

    return apiSuccess(
      product,
      'Product created successfully',
      { statusCode: 201 }
    );
  } catch (error) {
    logger.error("❌ POST /api/admin/products error:", error);
    
    return apiError(
      "Failed to create product",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
