/**
 * Products API Route
 * 
 * GET /api/products
 * - Query params: category, collection, search, inStock, sort, limit, offset
 * 
 * Returns a list of products with optional filtering and pagination.
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
  inStock: boolean;
  category: { id: string; name: string; slug: string };
  images: Array<{ url: string; alt: string | null; isPrimary: boolean }>;
  variants: Array<{
    id: string;
    size: string;
    stock: number;
  }>;
  tags: Array<{ name: string }>;
}): Product {
  return {
    id: prismaProduct.id,
    name: prismaProduct.name,
    slug: prismaProduct.slug,
    description: prismaProduct.description,
    price: prismaProduct.price,
    originalPrice: prismaProduct.originalPrice ?? undefined,
    sku: prismaProduct.sku ?? undefined,
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
  };
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Lazy load prisma to avoid build-time initialization
  const { prisma } = await import("@/lib/db/prisma");
  
  if (!prisma) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;

    // Query parameters
    const category = searchParams.get("category");
    const collection = searchParams.get("collection");
    const search = searchParams.get("search");
    const inStock = searchParams.get("inStock") === "true";
    const sort = searchParams.get("sort") || "newest";
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Build where clause
    const where: {
      categoryId?: string;
      collections?: { some: { collection: { slug: string } } };
      inStock?: boolean;
      OR?: Array<{ name: { contains: string; mode: "insensitive" } } | { description: { contains: string; mode: "insensitive" } }>;
    } = {};

    if (category) {
      where.categoryId = category;
    }

    if (collection) {
      where.collections = {
        some: {
          collection: {
            slug: collection,
          },
        },
      };
    }

    if (inStock) {
      where.inStock = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy clause
    let orderBy:
      | { createdAt: "desc" | "asc" }
      | { price: "desc" | "asc" }
      | { name: "asc" } = { createdAt: "desc" };

    switch (sort) {
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "price-low":
        orderBy = { price: "asc" };
        break;
      case "price-high":
        orderBy = { price: "desc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
    }

    // Fetch products
    const products = await prisma.product.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: {
        category: true,
        images: {
          orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
        },
        variants: {
          where: { isActive: true },
        },
        tags: true,
      },
    });

    // Get total count for pagination
    const total = await prisma.product.count({ where });

    // Transform products
    const transformedProducts = products.map(transformProduct);

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

