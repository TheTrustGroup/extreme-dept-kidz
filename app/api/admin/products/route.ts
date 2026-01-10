import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            name: true,
          },
        },
        variants: {
          select: {
            id: true,
            size: true,
            stock: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

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

    // Create product with related data
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: Math.round(price * 100), // Convert to pesewas
        originalPrice: originalPrice ? Math.round(originalPrice * 100) : null,
        sku,
        categoryId,
        images: {
          create: images || [],
        },
        variants: {
          create: variants || [],
        },
        tags: {
          create: tags?.map((tag: string) => ({ name: tag })) || [],
        },
        collections: {
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

    // Revalidate cache to show new product immediately
    try {
      revalidatePath('/products');
      revalidatePath('/collections');
      revalidatePath('/');
    } catch (revalidateError) {
      console.error('Failed to revalidate cache:', revalidateError);
      // Don't fail the request if revalidation fails
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
