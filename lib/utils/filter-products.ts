/**
 * Product Filtering Utilities
 * 
 * Client-side filtering and sorting logic for products.
 */

import type { Product } from "@/types";
import type { FilterState } from "../../components/products/FilterSidebar";
import type { SortOption } from "../../components/products/ProductToolbar";
import { normalizeProductSizeLabel } from "@/lib/constants/product-sizes";

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

    // Age Range filter (check metadata or infer from product name/description)
    if (filters.ageRanges.length > 0) {
      const productAgeRange = getProductAgeRange(product);
      if (!productAgeRange || !filters.ageRanges.includes(productAgeRange)) {
        return false;
      }
    }

    // Size filter
    if (filters.sizes.length > 0) {
      const normalizedFilterSizes = filters.sizes
        .map((s) => normalizeProductSizeLabel(s))
        .filter((s): s is NonNullable<typeof s> => s != null);
      const hasSize = product.sizes.some(
        (size) => {
          const normalized = normalizeProductSizeLabel(size.size);
          return normalized != null && normalizedFilterSizes.includes(normalized) && size.inStock;
        }
      );
      if (!hasSize) {
        return false;
      }
    }

    // Color filter (check metadata)
    if (filters.colors.length > 0) {
      const productColors = getProductColors(product);
      const hasColor = filters.colors.some((color) =>
        productColors.includes(color)
      );
      if (!hasColor) {
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
 * Get product age range from metadata or infer from product data.
 * Exported for collection toolbar filter (e.g. 0-2, 2-4, 4-6, 6-8, 8-10, 10-12).
 */
export function getProductAgeRange(product: Product): string | null {
  // Check metadata first
  if (product.metadata && typeof product.metadata.ageRange === "string") {
    return product.metadata.ageRange;
  }

  // Infer from canonical age sizes (3M/6M/9M + 1Y...12Y) and legacy aliases.
  const normalizedSizes = product.sizes
    .map((s) => normalizeProductSizeLabel(s.size))
    .filter((s): s is NonNullable<typeof s> => s != null);

  if (normalizedSizes.length === 0) {
    return null;
  }

  const hasInfant = normalizedSizes.some((s) => s.endsWith("M"));
  if (hasInfant || normalizedSizes.some((s) => ["1Y"].includes(s))) {
    return "0-1";
  }
  if (normalizedSizes.some((s) => ["2Y", "3Y"].includes(s))) {
    return "1-3";
  }
  if (normalizedSizes.some((s) => ["4Y", "5Y", "6Y"].includes(s))) {
    return "3-6";
  }
  if (normalizedSizes.some((s) => ["7Y", "8Y", "9Y"].includes(s))) {
    return "6-9";
  }
  if (normalizedSizes.some((s) => ["10Y", "11Y", "12Y"].includes(s))) {
    return "9-12";
  }

  return null;
}

/**
 * Get product colors from metadata or infer from product name/description
 */
function getProductColors(product: Product): string[] {
  const colors: string[] = [];

  // Check metadata first
  if (product.metadata && Array.isArray(product.metadata.colors)) {
    return product.metadata.colors as string[];
  }

  // Infer from product name/description (basic color detection)
  const text = `${product.name} ${product.description}`.toLowerCase();
  const colorMap: Record<string, string> = {
    black: "black",
    white: "white",
    navy: "navy",
    gray: "gray",
    grey: "gray",
    beige: "beige",
    red: "red",
    blue: "blue",
    green: "green",
  };

  Object.entries(colorMap).forEach(([keyword, color]) => {
    if (text.includes(keyword) && !colors.includes(color)) {
      colors.push(color);
    }
  });

  return colors;
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
      // Sort by creation date (newest first), then by tags containing "new"
      return sorted.sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (aDate !== bDate) {
          return bDate - aDate; // Newest first
        }
        const aIsNew = a.tags?.includes("new") ? 1 : 0;
        const bIsNew = b.tags?.includes("new") ? 1 : 0;
        if (aIsNew !== bIsNew) {
          return bIsNew - aIsNew;
        }
        return a.name.localeCompare(b.name);
      });

    case "bestselling":
      // Sort by tags containing "bestseller" first, then by name
      return sorted.sort((a, b) => {
        const aIsBestseller = a.tags?.includes("bestseller") ? 1 : 0;
        const bIsBestseller = b.tags?.includes("bestseller") ? 1 : 0;
        if (aIsBestseller !== bIsBestseller) {
          return bIsBestseller - aIsBestseller;
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

