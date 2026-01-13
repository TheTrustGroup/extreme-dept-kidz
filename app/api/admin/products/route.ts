import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllProducts, createProduct, getDatabaseStatus } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const products = await getAllProducts();
    const dbStatus = await getDatabaseStatus();

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
      dbStatus, // Include DB status for admin visibility
    });
  } catch (error) {
    console.error("❌ GET /api/admin/products error:", error);
    
    // Get status even on error
    const dbStatus = await getDatabaseStatus().catch(() => ({
      connected: false,
      type: 'unknown',
      error: 'Status check failed',
      mockMode: true,
      enabled: false,
    }));
    
    return NextResponse.json({
      success: false,
      error: "Failed to fetch products",
      details: error instanceof Error ? error.message : "Unknown error",
      dbStatus,
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'price', 'category'];
    const missingFields = requiredFields.filter(field => {
      if (field === 'category') {
        return !body.category && !body.categoryId;
      }
      return !body[field];
    });

    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
      }, { status: 400 });
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
      console.error('Failed to revalidate cache:', revalidateError);
      // Don't fail the request if revalidation fails
    }

    const dbStatus = await getDatabaseStatus();
    
    return NextResponse.json({
      success: true,
      product,
      message: 'Product created successfully',
      dbStatus,
    }, { status: 201 });
  } catch (error) {
    console.error("❌ POST /api/admin/products error:", error);
    
    const dbStatus = await getDatabaseStatus().catch(() => ({
      connected: false,
      type: 'unknown',
      error: 'Status check failed',
      mockMode: true,
      enabled: false,
    }));
    
    return NextResponse.json({
      success: false,
      error: "Failed to create product",
      details: error instanceof Error ? error.message : "Unknown error",
      dbStatus,
    }, { status: 500 });
  }
}
