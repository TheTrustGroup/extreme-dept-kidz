/**
 * Single Product API Route
 * 
 * GET /api/products/[slug]
 * 
 * Returns a single product by slug with full details.
 */

import { NextRequest, NextResponse } from "next/server";
import type { Product } from "@/types";

/**
 * Transform Prisma product to application Product type
 */
function transformProduct(prismaProduct: {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number | null;
  sku: string | null;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  inStock: boolean;
  metadata: unknown;
  category: { id: string; name: string; slug: string };
  images: Array<{ url: string; alt: string | null; isPrimary: boolean }>;
  variants: Array<{
    id: string;
    size: string;
    color: string | null;
    stock: number;
  }>;
  tags: Array<{ name: string }>;
  createdAt: Date;
  updatedAt: Date;
}): Product {
  return {
    id: prismaProduct.id,
    name: prismaProduct.name,
    slug: prismaProduct.slug,
    description: prismaProduct.description,
    price: prismaProduct.price,
    originalPrice: prismaProduct.originalPrice ?? undefined,
    sku: prismaProduct.sku ?? undefined,
    weight: prismaProduct.weight ?? undefined,
    dimensions:
      prismaProduct.length && prismaProduct.width && prismaProduct.height
        ? {
            length: prismaProduct.length,
            width: prismaProduct.width,
            height: prismaProduct.height,
          }
        : undefined,
    metadata: prismaProduct.metadata as Record<string, unknown> | undefined,
    inStock: prismaProduct.inStock,
    category: {
      id: prismaProduct.category.id,
      name: prismaProduct.category.name,
      slug: prismaProduct.category.slug,
    },
    images: prismaProduct.images.map((img) => ({
      url: img.url,
      alt: img.alt ?? undefined,
      isPrimary: img.isPrimary,
    })),
    sizes: prismaProduct.variants.map((v) => ({
      size: v.size,
      inStock: v.stock > 0,
    })),
    tags: prismaProduct.tags.map((t) => t.name),
    createdAt: prismaProduct.createdAt.toISOString(),
    updatedAt: prismaProduct.updatedAt.toISOString(),
  };
}

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
): Promise<NextResponse> {
  // Lazy load prisma to avoid build-time initialization
  const { prisma } = await import("@/lib/db/prisma");
  
  if (!prisma) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
        images: {
          orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
        },
        variants: {
          where: { isActive: true },
          orderBy: { size: "asc" },
        },
        tags: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const transformedProduct = transformProduct(product);

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

