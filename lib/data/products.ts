/**
 * Single source of truth for product data.
 * Used ONLY in server components and server-side code (API routes, server actions).
 * No client-side product fetching — all product data is fetched on the server.
 *
 * PHASE 8 — Stability: No ISR, no client fetch, no duplicate calls.
 * Diagnostic logging below is TEMPORARY to detect missing DB records, cache poisoning, stale renders.
 */

import {
  getAllProducts,
  getProductBySlug as getProductBySlugFromDb,
  getProductsByCategory as getProductsByCategoryFromDb,
} from "@/lib/db";
import type { Product } from "@/types";

const DIAGNOSTIC_LOG = process.env.NEXT_PHASE8_DIAGNOSTIC === "1";

/** Get all products. Use in server components / API only. When storefrontOnly is true, only returns products visible on the website. */
export async function getProducts(options?: { storefrontOnly?: boolean }): Promise<Product[]> {
  const before = Date.now();
  const products = await getAllProducts({ storefrontOnly: options?.storefrontOnly });
  if (DIAGNOSTIC_LOG) {
    const elapsed = Date.now() - before;
    const count = products?.length ?? 0;
    const firstId = count > 0 ? products[0]?.id : null;
    const lastId = count > 1 ? products[count - 1]?.id : null;
    console.log(
      "[Phase8 getProducts]",
      JSON.stringify({
        ts: new Date().toISOString(),
        elapsedMs: elapsed,
        count,
        firstId: firstId ?? null,
        lastId: lastId ?? null,
        empty: count === 0,
      })
    );
    if (count === 0) {
      console.warn("[Phase8 getProducts] EMPTY RESULT — possible missing DB records or cache poisoning");
    }
  }
  return products;
}

/** Get a single product by slug. Use in server components / API only. When storefrontOnly is true, returns null for products hidden from the website. */
export async function getProductBySlug(slug: string, options?: { storefrontOnly?: boolean }): Promise<Product | null> {
  const before = Date.now();
  const product = await getProductBySlugFromDb(slug, { storefrontOnly: options?.storefrontOnly });
  if (DIAGNOSTIC_LOG) {
    const elapsed = Date.now() - before;
    console.log(
      "[Phase8 getProductBySlug]",
      JSON.stringify({
        ts: new Date().toISOString(),
        elapsedMs: elapsed,
        slug,
        found: !!product,
        productId: product?.id ?? null,
      })
    );
    if (!product && slug) {
      console.warn("[Phase8 getProductBySlug] NOT FOUND — possible missing DB record or stale slug:", slug);
    }
  }
  return product;
}

/** Get products by category slug. Use in server components / API only. When storefrontOnly is true, only returns products visible on the website. */
export async function getProductsByCategory(categorySlug: string, options?: { storefrontOnly?: boolean }): Promise<Product[]> {
  return getProductsByCategoryFromDb(categorySlug, { storefrontOnly: options?.storefrontOnly });
}

export interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  category: string;
}

/** Search products by query (name, description, tags, category). Min 2 chars. Server only. Pass storefrontOnly true to exclude warehouse-only products. */
export async function searchProducts(query: string, options?: { storefrontOnly?: boolean }): Promise<SearchResult[]> {
  const q = query?.toLowerCase().trim() || "";
  if (q.length < 2) return [];

  const products = await getAllProducts({ storefrontOnly: options?.storefrontOnly });
  return products
    .filter((product) => {
      const searchableText = [
        product.name,
        product.description,
        ...(product.tags || []),
        product.category.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchableText.includes(q);
    })
    .map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image:
        product.images?.find((img) => img.isPrimary)?.url ||
        product.images?.[0]?.url ||
        "/placeholder.jpg",
      category: product.category.name,
    }));
}
