/**
 * Products API Route
 * 
 * GET /api/products
 * - Query params: category, collection, search, inStock, sort, limit, offset
 * 
 * Returns a list of products with optional filtering and pagination.
 */

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getProducts, getProductsByCategory } from "@/lib/data/products";
import type { Product } from "@/types";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";
import { withCors, isWarehouseRequest } from "@/lib/utils/cors";

function generateETag(payload: unknown): string {
  const str = JSON.stringify(payload);
  const hash = createHash("md5").update(str).digest("hex");
  return `W/"${hash}"`;
}

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
export const revalidate = 0;

/** Return 405 with CORS so warehouse/cross-origin clients get a valid response (no CORS error). */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return withCors(
    request,
    new NextResponse(
      JSON.stringify({ error: "Method not allowed", message: "Use GET to list products" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    )
  );
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Query parameters
    const category = searchParams.get("category");
    const collection = searchParams.get("collection");
    const search = searchParams.get("search");
    const inStock = searchParams.get("inStock") === "true";
    const sort = searchParams.get("sort") || "newest";
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    const storefrontOnly = !isWarehouseRequest(request);

    const where: Prisma.ProductWhereInput = {};
    if (storefrontOnly) {
      where.visibleOnStore = true;
    }
    if (inStock) where.inStock = true;
    if (category) where.category = { slug: category };
    if (collection) where.collections = { some: { collection: { slug: collection } } };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { some: { name: { contains: search, mode: "insensitive" } } } },
      ];
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput[] = [];
    switch (sort) {
      case "price-low":
        orderBy.push({ price: "asc" });
        break;
      case "price-high":
        orderBy.push({ price: "desc" });
        break;
      case "name":
        orderBy.push({ name: "asc" });
        break;
      case "oldest":
        orderBy.push({ createdAt: "asc" });
        break;
      default:
        orderBy.push({ createdAt: "desc" });
        break;
    }
    orderBy.push({ id: "desc" });

    let products: Product[] = [];
    let total = 0;

    if (prisma) {
      const [rows, count] = await prisma.$transaction([
        prisma.product.findMany({
          where,
          orderBy,
          skip: offset,
          take: limit,
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            price: true,
            originalPrice: true,
            sku: true,
            inStock: true,
            category: {
              select: { id: true, name: true, slug: true },
            },
            images: {
              select: { url: true, alt: true, isPrimary: true },
              orderBy: { order: "asc" },
            },
            variants: {
              select: { id: true, size: true, stock: true },
            },
            tags: {
              select: { name: true },
            },
          },
        }),
        prisma.product.count({ where }),
      ]);
      products = rows.map(transformProduct);
      total = count;
    } else {
      // Fallback path (dev/mock): preserve existing behavior
      const allProducts = category
        ? await getProductsByCategory(category, { storefrontOnly })
        : await getProducts({ storefrontOnly });
      total = allProducts.length;
      products = allProducts.slice(offset, offset + limit);
    }

    // Warehouse expects a raw array for (response || []).map(...) compatibility
    if (isWarehouseRequest(request)) {
      const res = withCors(request, NextResponse.json(products));
      res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      return res;
    }

    const data = {
      products,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
    const etag = generateETag(data);
    if (request.headers.get("if-none-match") === etag) {
      return withCors(
        request,
        new NextResponse(null, { status: 304, headers: { ETag: etag } })
      );
    }

    const res = apiSuccess(
      data,
      "Products fetched successfully",
      undefined,
      { cache: "no-store" }
    );
    res.headers.set("ETag", etag);
    return withCors(request, res);
  } catch (error) {
    logger.error("❌ Error fetching products:", error);
    
    // On error, retry once (getProducts from lib/data/products)
    try {
      const storefrontOnly = !isWarehouseRequest(request);
      const fallbackProducts = await getProducts({ storefrontOnly });
      const fallbackSlice = fallbackProducts.slice(0, 20);
      if (isWarehouseRequest(request)) {
        return withCors(request, NextResponse.json(fallbackSlice));
      }
      return withCors(request, apiSuccess(
        {
          products: fallbackSlice,
          pagination: {
            total: fallbackProducts.length,
            limit: 20,
            offset: 0,
            hasMore: false,
          },
        },
        "Products fetched successfully (using fallback data)",
        { warning: "Using fallback data due to database error" }
      ));
    } catch (fallbackError) {
      return withCors(request, apiError(
        "Unable to fetch products. Please try again later.",
        500,
        error instanceof Error ? error.message : "Unknown error"
      ));
    }
  }
}

