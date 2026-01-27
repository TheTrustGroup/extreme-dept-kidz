import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError, apiValidationError } from "@/lib/utils/api-response";
import { createProductSchema, validate } from "@/lib/validation/schemas";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { logActivity, ActivityActions } from "@/lib/services/admin/activity.service";

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

    const products = await prisma.product.findMany({
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

    // Validate input using Zod schema
    const validation = validate(createProductSchema, body);
    if (!validation.success) {
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

    // Normalize images - validated data already has array of URL strings
    const images = Array.isArray(validatedData.images)
      ? validatedData.images.map((url: string, index: number) => ({
          url: url.trim(),
          alt: `${validatedData.name} - Image ${index + 1}`,
          isPrimary: index === 0,
        }))
      : [];

    // Normalize sizes/variants - validated data already has correct format
    const sizes = Array.isArray(validatedData.sizes)
      ? validatedData.sizes.map((size: { size: string; quantity: number; sku?: string }) => ({
          size: size.size,
          stock: size.quantity || 0,
          sku: size.sku || (validatedData.sku ? `${validatedData.sku}-${size.size}` : `SKU-${Date.now()}-${size.size}`),
        }))
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
    const originalPrice = validatedData.originalPrice
      ? Math.round(validatedData.originalPrice * 100)
      : null;

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

    // Revalidate cache
    try {
      revalidatePath('/products');
      revalidatePath('/collections');
      revalidatePath('/admin/products');
    } catch (revalidateError) {
      logger.error('Failed to revalidate cache:', revalidateError);
      // Don't fail the request if revalidation fails
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
