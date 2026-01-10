import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
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
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      slug,
      description,
      price,
      originalPrice,
      sku,
      categoryId,
      images,
      variants,
      tags,
      collections,
    } = body;

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        price: Math.round(price * 100),
        originalPrice: originalPrice ? Math.round(originalPrice * 100) : null,
        sku,
        categoryId,
        // Note: For simplicity, we're replacing all related data
        // In production, you'd want to handle updates more carefully
        images: {
          deleteMany: {},
          create: images || [],
        },
        variants: {
          deleteMany: {},
          create: variants || [],
        },
        tags: {
          deleteMany: {},
          create: tags?.map((tag: string) => ({ name: tag })) || [],
        },
        collections: {
          deleteMany: {},
          create: collections?.map((collectionId: string, index: number) => ({
            collectionId,
            order: index,
          })) || [],
        },
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
      console.error('Failed to revalidate cache:', revalidateError);
      // Don't fail the request if revalidation fails
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    const { id } = await params;
    await prisma.product.delete({
      where: { id },
    });

    // Revalidate cache after deletion
    try {
      revalidatePath('/products');
      revalidatePath('/collections');
      revalidatePath('/');
    } catch (revalidateError) {
      console.error('Failed to revalidate cache:', revalidateError);
      // Don't fail the request if revalidation fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
