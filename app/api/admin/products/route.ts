import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllProducts, createProduct, getDatabaseStatus } from "@/lib/db";
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
    const products = await getAllProducts();
    const dbStatus = await getDatabaseStatus();

    return apiSuccess(
      {
        products,
        count: products.length,
        dbStatus, // Include DB status for admin visibility
      },
      'Products fetched successfully'
    );
  } catch (error) {
    logger.error("❌ GET /api/admin/products error:", error);
    
    // Get status even on error
    const dbStatus = await getDatabaseStatus().catch(() => ({
      connected: false,
      type: 'unknown',
      error: 'Status check failed',
      mockMode: true,
      enabled: false,
    }));
    
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

    // Normalize category - handle both object and ID formats
    let category;
    if (body.category && typeof body.category === 'object') {
      category = body.category;
    } else if (body.categoryId) {
      // Map category ID to category object
      const categoryMap: Record<string, { id: string; name: string; slug: string }> = {
        'cat-boys': { id: 'cat-boys', name: 'Boys', slug: 'boys' },
        'cat-girls': { id: 'cat-girls', name: 'Girls', slug: 'girls' },
        'cat-accessories': { id: 'cat-accessories', name: 'Accessories', slug: 'accessories' },
      };
      category = categoryMap[body.categoryId] || { id: body.categoryId, name: body.categoryId, slug: body.categoryId };
    } else {
      category = { id: 'cat-boys', name: 'Boys', slug: 'boys' };
    }

    // Normalize images - handle both array of strings and array of objects
    let images;
    if (Array.isArray(body.images)) {
      images = body.images.map((img: string | { url: string; alt?: string; isPrimary?: boolean }, index: number) => {
        if (typeof img === 'string') {
          return { url: img, alt: `${body.name} - Image ${index + 1}`, isPrimary: index === 0 };
        }
        return {
          url: img.url,
          alt: img.alt || `${body.name} - Image ${index + 1}`,
          isPrimary: img.isPrimary ?? (index === 0),
        };
      }).filter((img: { url: string }) => img.url && img.url.trim() !== '');
    } else {
      images = [];
    }

    // Normalize sizes - handle both variants and sizes formats
    let sizes;
    if (Array.isArray(body.sizes)) {
      sizes = body.sizes.map((size: { size: string; inStock?: boolean; quantity?: number }) => ({
        size: size.size,
        inStock: size.inStock ?? (size.quantity ? size.quantity > 0 : true),
        quantity: size.quantity || (size.inStock ? 1 : 0),
      }));
    } else if (Array.isArray(body.variants)) {
      sizes = body.variants.map((variant: { size: string; stock?: number; sku?: string }) => ({
        size: variant.size,
        inStock: (variant.stock ?? 0) > 0,
        quantity: variant.stock || 0,
      }));
    } else {
      sizes = [];
    }

    // Normalize price - handle both cents and decimal formats
    let price;
    if (typeof body.price === 'number') {
      // If price is less than 1000, assume it's in cents already
      price = body.price < 1000 ? body.price : Math.round(body.price * 100);
    } else {
      price = Math.round(parseFloat(String(body.price || 0)) * 100);
    }

    // Normalize originalPrice
    let originalPrice: number | undefined;
    if (body.originalPrice) {
      if (typeof body.originalPrice === 'number') {
        originalPrice = body.originalPrice < 1000 ? body.originalPrice : Math.round(body.originalPrice * 100);
      } else {
        originalPrice = Math.round(parseFloat(String(body.originalPrice)) * 100);
      }
    }

    // Create product using DB layer (will fallback to mock if DB unavailable)
    const product = await createProduct({
      name: String(body.name || '').trim(),
      description: String(body.description || '').trim(),
      price,
      originalPrice,
      sku: String(body.sku || `SKU-${Date.now()}`).trim(),
      category,
      images,
      sizes,
      slug: body.slug || String(body.name || 'product').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      inStock: body.inStock !== undefined ? Boolean(body.inStock) : sizes.some((s: { quantity: number }) => s.quantity > 0),
      tags: Array.isArray(body.tags) ? body.tags.map((t: unknown) => String(t).trim()).filter((t: string) => t) : [],
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
