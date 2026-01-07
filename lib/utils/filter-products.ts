/**
 * Product Filtering Utilities
 * 
 * Client-side filtering and sorting logic for products.
 */

import type { Product } from "@/types";
import type { FilterState } from "@/components/products/FilterSidebar";
import type { SortOption } from "@/components/products/ProductToolbar";

/**
 * Filter products based on filter state
 */
export function filterProducts(
  products: Product[],
  filters: FilterState
): Product[] {
  return products.filter((product) => {
    // Category filter
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(product.category.name)
    ) {
      return false;
    }

    // Size filter
    if (filters.sizes.length > 0) {
      const hasSize = product.sizes.some(
        (size) =>
          filters.sizes.includes(size.size) && size.inStock
      );
      if (!hasSize) {
        return false;
      }
    }

    // Price range filter
    if (
      product.price < filters.priceRange.min ||
      product.price > filters.priceRange.max
    ) {
      return false;
    }

    // In stock filter
    if (filters.inStockOnly && !product.inStock) {
      return false;
    }

    return true;
  });
}

/**
 * Sort products based on sort option
 */
export function sortProducts(
  products: Product[],
  sortBy: SortOption
): Product[] {
  const sorted = [...products];

  switch (sortBy) {
    case "price-low":
      return sorted.sort((a, b) => a.price - b.price);

    case "price-high":
      return sorted.sort((a, b) => b.price - a.price);

    case "newest":
      // Sort by tags containing "new" first, then by name
      return sorted.sort((a, b) => {
        const aIsNew = a.tags?.includes("new") ? 1 : 0;
        const bIsNew = b.tags?.includes("new") ? 1 : 0;
        if (aIsNew !== bIsNew) {
          return bIsNew - aIsNew;
        }
        return a.name.localeCompare(b.name);
      });

    case "featured":
    default:
      // Sort by tags (bestseller > new > others), then by name
      return sorted.sort((a, b) => {
        const getPriority = (product: Product): number => {
          if (product.tags?.includes("bestseller")) return 3;
          if (product.tags?.includes("new")) return 2;
          return 1;
        };
        const aPriority = getPriority(a);
        const bPriority = getPriority(b);
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        return a.name.localeCompare(b.name);
      });
  }
}

/**
 * Get products by collection slug
 */
export function getProductsByCollection(
  products: Product[],
  collectionSlug: string
): Product[] {
  // Map collection slugs to filtering logic
  // In a real app, products would have a collection relationship
  const collectionMap: Record<string, (product: Product) => boolean> = {
    "new-arrivals": (product) => product.tags?.includes("new") === true,
    "boys": (product) => product.category.slug === "boys",
    "girls": (product) => product.category.slug === "girls",
    "street-essentials": (product) => 
      product.tags?.includes("street") === true || 
      (product.category.slug === "boys" || product.category.slug === "girls"),
    "premium-basics": (product) => 
      product.tags?.includes("bestseller") === true ||
      product.category.slug === "accessories",
  };

  const filterFn = collectionMap[collectionSlug];

  if (!filterFn) {
    // If collection not found, return all products
    return products;
  }

  return products.filter(filterFn);
}

