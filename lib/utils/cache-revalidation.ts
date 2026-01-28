/**
 * Cache Revalidation Utilities
 * 
 * Centralized functions for revalidating Next.js cache paths and tags
 * to ensure products appear immediately after creation/update.
 * 
 * Performance: Uses tag-based revalidation for efficient cache invalidation
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

    // Revalidate each active category's collection page (path-based)
    for (const category of categories) {
      if (category.slug) {
        revalidatePath(`/collections/${category.slug}`);
        revalidateTag(CACHE_TAGS.collection(category.slug));
        revalidateTag(CACHE_TAGS.category(category.slug));
      }
    }

    // Also revalidate common paths
    revalidatePath("/collections");
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/api/products");

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
    
    // Path-based revalidation (for immediate updates)
    revalidatePath(`/collections/${slug}`);
    revalidatePath("/collections");
    revalidatePath("/");
    
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
 * Use this when a product is updated
 */
export function revalidateProduct(slug: string, id?: string): void {
  try {
    // Tag-based revalidation
    revalidateTag(CACHE_TAGS.product(slug));
    if (id) {
      revalidateTag(CACHE_TAGS.productId(id));
    }
    revalidateTag(CACHE_TAGS.products);
    revalidateTag(CACHE_TAGS.homepage);
    
    // Path-based revalidation
    revalidatePath(`/products/${slug}`);
    revalidatePath("/products");
    revalidatePath("/");
    
    logger.log(`[Cache] Revalidated product: ${slug} (tags + paths)`);
  } catch (error) {
    logger.error(`[Cache] Failed to revalidate product ${slug}:`, error);
  }
}
