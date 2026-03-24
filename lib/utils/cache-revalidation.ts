/**
 * Cache Revalidation Utilities
 *
 * Centralized functions for revalidating Next.js cache paths and tags
 * to ensure products appear immediately after creation/update.
 *
 * Hardened: All path revalidations use explicit "page" or "layout" type.
 * TTLs align with lib/utils/cache-constants.ts.
 */

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/utils/logger";

// Cache revalidation tags for efficient invalidation
export const CACHE_TAGS = {
  products: "products",
  product: (slug: string) => `product-${slug}`,
  productId: (id: string) => `product-id-${id}`,
  categories: "categories",
  category: (slug: string) => `category-${slug}`,
  collections: "collections",
  collection: (slug: string) => `collection-${slug}`,
  homepage: "homepage",
  completeLooks: "complete-looks",
  completeLookProduct: (productId: string) => `complete-looks-product-${productId}`,
} as const;

/**
 * Revalidate all collection pages for active categories
 * Use this when products are created/updated to ensure they appear immediately
 * 
 * Performance: Uses both path and tag-based revalidation for maximum efficiency
 */
export async function revalidateAllCollectionPages(): Promise<void> {
  try {
    if (!prisma) {
      logger.warn("[Cache] Prisma not available, skipping collection page revalidation");
      return;
    }

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true },
    });

    // Revalidate tags (most efficient - invalidates all pages using these tags)
    revalidateTag(CACHE_TAGS.products);
    revalidateTag(CACHE_TAGS.collections);
    revalidateTag(CACHE_TAGS.categories);
    revalidateTag(CACHE_TAGS.homepage);

    // Revalidate each active category's collection page (path-based, explicit "page")
    for (const category of categories) {
      if (category.slug) {
        revalidatePath(`/collections/${category.slug}`, "page");
        revalidateTag(CACHE_TAGS.collection(category.slug));
        revalidateTag(CACHE_TAGS.category(category.slug));
      }
    }

    // Also revalidate common paths (explicit type for Full Route Cache)
    revalidatePath("/collections", "page");
    revalidatePath("/", "page");
    revalidatePath("/products", "page");
    revalidatePath("/api/products", "layout");

    logger.log(`[Cache] Revalidated ${categories.length} collection pages (tags + paths)`);
  } catch (error) {
    logger.error("[Cache] Failed to revalidate collection pages:", error);
    // Don't throw - cache revalidation failure shouldn't break the request
  }
}

/**
 * Revalidate a specific collection page by slug
 * 
 * Performance: Uses both tag and path-based revalidation
 */
export function revalidateCollectionPage(slug: string): void {
  try {
    // Tag-based revalidation (most efficient)
    revalidateTag(CACHE_TAGS.collection(slug));
    revalidateTag(CACHE_TAGS.category(slug));
    revalidateTag(CACHE_TAGS.products);
    
    // Path-based revalidation (explicit "page" for immediate CDN purge)
    revalidatePath(`/collections/${slug}`, "page");
    revalidatePath("/collections", "page");
    revalidatePath("/", "page");
    
    logger.log(`[Cache] Revalidated collection page: /collections/${slug} (tags + paths)`);
  } catch (error) {
    logger.error(`[Cache] Failed to revalidate /collections/${slug}:`, error);
  }
}

/**
 * Revalidate collection pages for both old and new category slugs
 * Use this when a product's category is changed
 * 
 * Performance: Efficient tag-based invalidation
 */
export async function revalidateCategoryChange(
  oldCategorySlug: string | null | undefined,
  newCategorySlug: string | null | undefined
): Promise<void> {
  try {
    // Revalidate tags first (most efficient)
    revalidateTag(CACHE_TAGS.products);
    revalidateTag(CACHE_TAGS.collections);
    revalidateTag(CACHE_TAGS.homepage);

    // Revalidate new category page
    if (newCategorySlug) {
      revalidateCollectionPage(newCategorySlug);
    }

    // Revalidate old category page if different
    if (oldCategorySlug && oldCategorySlug !== newCategorySlug) {
      revalidateCollectionPage(oldCategorySlug);
    }

    // Also revalidate all pages to ensure consistency
    await revalidateAllCollectionPages();
  } catch (error) {
    logger.error("[Cache] Failed to revalidate category change:", error);
  }
}

/**
 * Revalidate a specific product by slug
 * Use this when a product is created/updated/deleted.
 * SEV-1: Explicit 'page' type ensures Full Route Cache and CDN purge for /products/[slug].
 */
export function revalidateProduct(slug: string, id?: string): void {
  try {
    // Tag-based revalidation (invalidates unstable_cache entries)
    revalidateTag(CACHE_TAGS.product(slug));
    if (id) {
      revalidateTag(CACHE_TAGS.productId(id));
    }
    revalidateTag(CACHE_TAGS.products);
    revalidateTag(CACHE_TAGS.homepage);
    
    // Path-based revalidation — explicit 'page' for product detail and list
    revalidatePath(`/products/${slug}`, "page");
    revalidatePath("/products", "page");
    revalidatePath("/", "page");
    
    logger.log(`[Cache] Revalidated product: ${slug} (tags + paths)`);
  } catch (error) {
    logger.error(`[Cache] Failed to revalidate product ${slug}:`, error);
  }
}

/** Params for revalidateOnProductMutation — single contract for all product mutations */
export type RevalidateProductMutationParams = {
  type: "create" | "update" | "delete";
  slug: string;
  id?: string;
  categorySlug?: string;
  /** When type is "update" and slug changed */
  oldSlug?: string;
  /** When type is "update" and category changed */
  oldCategorySlug?: string;
};

/**
 * Single contract for product mutations.
 * Every product create/update/delete MUST call this (before returning success).
 * Ensures: products mutate frequently → we revalidate; users never see stale → tags + paths purged.
 */
export async function revalidateOnProductMutation(params: RevalidateProductMutationParams): Promise<void> {
  const { type, slug, id, categorySlug, oldSlug, oldCategorySlug } = params;
  try {
    // Old slug/category: purge so old URLs and old collection pages don’t serve stale data
    if (type === "update") {
      if (oldSlug && oldSlug !== slug) {
        revalidatePath(`/products/${oldSlug}`, "page");
        revalidateTag(CACHE_TAGS.product(oldSlug));
      }
      if (oldCategorySlug) {
        revalidateCollectionPage(oldCategorySlug);
      }
    }

    // This product + catalog tags and paths
    revalidateProduct(slug, id);
    revalidateTag(CACHE_TAGS.completeLooks);
    if (id) revalidateTag(CACHE_TAGS.completeLookProduct(id));

    // Category/collection for this product
    if (categorySlug) {
      revalidateCollectionPage(categorySlug);
      revalidatePath(`/collections/${categorySlug}`, "page");
    }

    // Admin + API layout: sync so the save response isn’t blocked by full-catalog work
    revalidatePath("/admin/products", "page");
    revalidatePath("/api/products", "layout");

    // Heavy: every category path + tags — defer so product PUT/POST returns quickly
    void revalidateAllCollectionPages().catch((err) => {
      logger.error("[Cache] revalidateAllCollectionPages (deferred):", err);
    });

    logger.log(`[Cache] revalidateOnProductMutation(${type}): ${slug}`);
  } catch (error) {
    logger.error(`[Cache] revalidateOnProductMutation failed:`, error);
    // Don’t throw — mutation already succeeded; log and continue
  }
}
