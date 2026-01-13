import { NextRequest, NextResponse } from "next/server";
import { getAllCategories, createCategory, getDatabaseStatus } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const categories = await getAllCategories();
    
    return NextResponse.json({
      success: true,
      categories,
      count: categories.length,
      dbStatus: getDatabaseStatus(),
    });
  } catch (error) {
    console.error("❌ GET /api/admin/categories error:", error);
    
    return NextResponse.json({
      success: false,
      error: "Failed to fetch categories",
      details: error instanceof Error ? error.message : "Unknown error",
      dbStatus: getDatabaseStatus(),
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({
        success: false,
        error: "Category name is required",
      }, { status: 400 });
    }

    // Generate slug
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const category = await createCategory({
      name,
      slug,
      description: description || '',
      image: body.image || '',
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    // Revalidate cache
    try {
      revalidatePath('/admin/categories');
      revalidatePath('/collections');
    } catch (revalidateError) {
      console.error('Failed to revalidate cache:', revalidateError);
    }

    return NextResponse.json({
      success: true,
      category,
      message: "Category created successfully",
      dbStatus: getDatabaseStatus(),
    }, { status: 201 });
  } catch (error) {
    console.error("❌ POST /api/admin/categories error:", error);
    
    return NextResponse.json({
      success: false,
      error: "Failed to create category",
      details: error instanceof Error ? error.message : "Unknown error",
      dbStatus: getDatabaseStatus(),
    }, { status: 500 });
  }
}
