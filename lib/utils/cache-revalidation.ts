/**
 * Cache Revalidation Utilities
 * 
 * Centralized functions for revalidating Next.js cache paths
 * to ensure products appear immediately after creation/update.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/utils/logger";

/**
 * Revalidate all collection pages for active categories
 * Use this when products are created/updated to ensure they appear immediately
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

    // Revalidate each active category's collection page
    for (const category of categories) {
      if (category.slug) {
        revalidatePath(`/collections/${category.slug}`);
      }
    }

    // Also revalidate common paths
    revalidatePath("/collections");
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/api/products");

    logger.log(`[Cache] Revalidated ${categories.length} collection pages`);
  } catch (error) {
    logger.error("[Cache] Failed to revalidate collection pages:", error);
    // Don't throw - cache revalidation failure shouldn't break the request
  }
}

/**
 * Revalidate a specific collection page by slug
 */
export function revalidateCollectionPage(slug: string): void {
  try {
    revalidatePath(`/collections/${slug}`);
    revalidatePath("/collections");
    revalidatePath("/");
    logger.log(`[Cache] Revalidated collection page: /collections/${slug}`);
  } catch (error) {
    logger.error(`[Cache] Failed to revalidate /collections/${slug}:`, error);
  }
}

/**
 * Revalidate collection pages for both old and new category slugs
 * Use this when a product's category is changed
 */
export async function revalidateCategoryChange(
  oldCategorySlug: string | null | undefined,
  newCategorySlug: string | null | undefined
): Promise<void> {
  try {
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
