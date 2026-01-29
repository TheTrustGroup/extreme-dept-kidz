/**
 * Product Recommendation Utilities
 * 
 * Smart product recommendation logic with priority-based filtering.
 */

import type { Product } from "@/types";

export interface RecommendationOptions {
  /** Maximum number of recommendations to return */
  limit?: number;
  /** Whether to exclude out-of-stock products */
  excludeOutOfStock?: boolean;
  /** Price range tolerance (percentage) for similar price matching */
  priceRangeTolerance?: number;
}

/**
 * Get recommended products based on multiple criteria (in priority order):
 * 1. Same category products
 * 2. Same collection products (based on category parent/group)
 * 3. Similar price range (±20% by default)
 * 4. Random selection from new arrivals
 */
export function getRecommendedProducts(
  currentProduct: Product,
  allProducts: Product[],
  options: RecommendationOptions = {}
): Product[] {
  const {
    limit = 4,
    excludeOutOfStock = false,
    priceRangeTolerance = 0.2, // 20% tolerance
  } = options;

  // Filter out current product
  let candidates = allProducts.filter((p) => p.id !== currentProduct.id);

  // Filter out out-of-stock products if requested
  if (excludeOutOfStock) {
    candidates = candidates.filter((p) => p.inStock);
  }

  if (candidates.length === 0) {
    return [];
  }

  // Priority 1: Same category products
  const sameCategory = candidates.filter(
    (p) => p.category.id === currentProduct.category.id
  );

  if (sameCategory.length >= limit) {
    return shuffleArray(sameCategory).slice(0, limit);
  }

  // Priority 2: Same collection (based on category slug patterns)
  // For example, if category is "boys-t-shirts", collection might be "boys"
  const currentCategorySlug = currentProduct.category.slug;
  const collectionMatch = extractCollectionFromSlug(currentCategorySlug);
  
  const sameCollection = candidates.filter((p) => {
    if (p.category.id === currentProduct.category.id) return false; // Already included
    const productCollection = extractCollectionFromSlug(p.category.slug);
    return productCollection === collectionMatch && collectionMatch !== null;
  });

  const combined = [...sameCategory, ...sameCollection];
  const uniqueCombined = removeDuplicates(combined);

  if (uniqueCombined.length >= limit) {
    return shuffleArray(uniqueCombined).slice(0, limit);
  }

  // Priority 3: Similar price range
  const currentPrice = currentProduct.price;
  const priceMin = currentPrice * (1 - priceRangeTolerance);
  const priceMax = currentPrice * (1 + priceRangeTolerance);

  const similarPrice = candidates.filter((p) => {
    if (uniqueCombined.some((up) => up.id === p.id)) return false; // Already included
    return p.price >= priceMin && p.price <= priceMax;
  });

  const combinedWithPrice = [...uniqueCombined, ...similarPrice];
  const uniqueWithPrice = removeDuplicates(combinedWithPrice);

  if (uniqueWithPrice.length >= limit) {
    return shuffleArray(uniqueWithPrice).slice(0, limit);
  }

  // Priority 4: New arrivals (products with "new" tag or created recently)
  const newArrivals = candidates.filter((p) => {
    if (uniqueWithPrice.some((up) => up.id === p.id)) return false; // Already included
    return (
      p.tags?.includes("new") ||
      (p.createdAt &&
        isRecentlyCreated(p.createdAt, 30)) // Within last 30 days
    );
  });

  const combinedWithNew = [...uniqueWithPrice, ...newArrivals];
  const uniqueWithNew = removeDuplicates(combinedWithNew);

  if (uniqueWithNew.length >= limit) {
    return shuffleArray(uniqueWithNew).slice(0, limit);
  }

  // Fallback: Random selection from remaining products
  const remaining = candidates.filter(
    (p) => !uniqueWithNew.some((up) => up.id === p.id)
  );
  const final = [...uniqueWithNew, ...remaining];
  return shuffleArray(final).slice(0, limit);
}

/**
 * Get products by category (for "Popular in [Category]" use case)
 */
export function getProductsByCategory(
  categoryId: string,
  allProducts: Product[],
  options: RecommendationOptions = {}
): Product[] {
  const { limit = 4, excludeOutOfStock = false } = options;

  let products = allProducts.filter((p) => p.category.id === categoryId);

  if (excludeOutOfStock) {
    products = products.filter((p) => p.inStock);
  }

  return shuffleArray(products).slice(0, limit);
}

/**
 * Get recently viewed products (for "Recently Viewed" use case)
 * This would typically use localStorage or a backend service
 */
export function getRecentlyViewedProducts(
  allProducts: Product[],
  limit: number = 4
): Product[] {
  // In a real implementation, this would read from localStorage or API
  // For now, return empty array - can be extended later
  return [];
}

/**
 * Extract collection name from category slug
 * Examples:
 * - "boys-t-shirts" -> "boys"
 * - "girls-dresses" -> "girls"
 * - "new-arrivals" -> "new-arrivals"
 */
function extractCollectionFromSlug(slug: string): string | null {
  // Common collection patterns
  const collections = ["boys", "girls", "new-arrivals", "accessories"];
  
  for (const collection of collections) {
    if (slug.startsWith(collection)) {
      return collection;
    }
  }
  
  return null;
}

/**
 * Check if a product was created recently
 */
function isRecentlyCreated(createdAt: Date | string, daysAgo: number): boolean {
  const created = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= daysAgo;
}

/**
 * Remove duplicate products from array
 */
function removeDuplicates(products: Product[]): Product[] {
  const seen = new Set<string>();
  return products.filter((p) => {
    if (seen.has(p.id)) {
      return false;
    }
    seen.add(p.id);
    return true;
  });
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
