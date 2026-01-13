import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllProducts, createProduct, getDatabaseStatus } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const products = await getAllProducts();
    const dbStatus = getDatabaseStatus();

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
      dbStatus, // Include DB status for admin visibility
    });
  } catch (error) {
    console.error("❌ GET /api/admin/products error:", error);
    
    return NextResponse.json({
      success: false,
      error: "Failed to fetch products",
      details: error instanceof Error ? error.message : "Unknown error",
      dbStatus: getDatabaseStatus(),
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

    // Create product using DB layer (will fallback to mock if DB unavailable)
    const product = await createProduct({
      name: body.name,
      description: body.description || '',
      price: typeof body.price === 'number' ? body.price : Math.round(parseFloat(body.price) * 100),
      originalPrice: body.originalPrice ? (typeof body.originalPrice === 'number' ? body.originalPrice : Math.round(parseFloat(body.originalPrice) * 100)) : undefined,
      sku: body.sku || `SKU-${Date.now()}`,
      category: body.category || { id: body.categoryId || 'cat-boys', name: 'Boys', slug: 'boys' },
      images: body.images || [],
      sizes: body.sizes || body.variants || [],
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
      inStock: body.inStock !== undefined ? body.inStock : true,
      tags: body.tags || [],
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

    return NextResponse.json({
      success: true,
      product,
      message: 'Product created successfully',
      dbStatus: getDatabaseStatus(),
    }, { status: 201 });
  } catch (error) {
    console.error("❌ POST /api/admin/products error:", error);
    
    return NextResponse.json({
      success: false,
      error: "Failed to create product",
      details: error instanceof Error ? error.message : "Unknown error",
      dbStatus: getDatabaseStatus(),
    }, { status: 500 });
  }
}
