/**
 * Products API Route
 * 
 * GET /api/products
 * - Query params: category, collection, search, inStock, sort, limit, offset
 * 
 * Returns a list of products with optional filtering and pagination.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAllProducts, getProductsByCategory, getDatabaseStatus } from "@/lib/db";
import type { Product } from "@/types";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";
import { CACHE_TAGS } from "@/lib/utils/cache-revalidation";
import { unstable_cache } from "next/cache";

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

// Dynamic route: Uses searchParams for filtering, cache with headers
export const dynamic = 'force-dynamic'; // Required because we use searchParams

export async function GET(request: NextRequest): Promise<NextResponse> {
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

    // Get products using DB abstraction layer (with automatic fallback to mock)
    let products = category 
      ? await getProductsByCategory(category)
      : await getAllProducts();

    // Apply filters (client-side filtering for mock data compatibility)
    if (inStock) {
      products = products.filter(p => p.inStock);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(
        p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    switch (sort) {
      case "price-low":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        products.sort((a, b) => b.price - a.price);
        break;
      case "name":
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "oldest":
        // Mock data doesn't have createdAt, so we'll use default order
        break;
      default: // "newest"
        // Default order (already sorted)
        break;
    }

    // Apply pagination
    const total = products.length;
    const paginatedProducts = products.slice(offset, offset + limit);

    return apiSuccess(
      {
        products: paginatedProducts,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      "Products fetched successfully",
      undefined,
      {
        cache: 60, // Cache for 60 seconds
        tags: [CACHE_TAGS.products, category ? CACHE_TAGS.category(category) : CACHE_TAGS.collections],
      }
    );
  } catch (error) {
    logger.error("❌ Error fetching products:", error);
    
    // Even on error, try to return mock data as fallback
    try {
      const fallbackProducts = await getAllProducts();
      return apiSuccess(
        {
          products: fallbackProducts.slice(0, 20),
          pagination: {
            total: fallbackProducts.length,
            limit: 20,
            offset: 0,
            hasMore: false,
          },
        },
        "Products fetched successfully (using fallback data)",
        { warning: "Using fallback data due to database error" }
      );
    } catch (fallbackError) {
      return apiError(
        "Unable to fetch products. Please try again later.",
        500,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
}

