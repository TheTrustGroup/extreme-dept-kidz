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

    // Age Range filter (check metadata or infer from product name/description)
    if (filters.ageRanges.length > 0) {
      const productAgeRange = getProductAgeRange(product);
      if (!productAgeRange || !filters.ageRanges.includes(productAgeRange)) {
        return false;
      }
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
 * Get product age range from metadata or infer from product data
 */
function getProductAgeRange(product: Product): string | null {
  // Check metadata first
  if (product.metadata && typeof product.metadata.ageRange === "string") {
    return product.metadata.ageRange;
  }

  // Infer from sizes (e.g., 2T-4T = 2-4 years, sizes 6-12 = 6-12 years)
  const sizes = product.sizes.map((s) => s.size);
  if (sizes.some((s) => s.includes("T"))) {
    const toddlerSizes = sizes.filter((s) => s.includes("T"));
    if (toddlerSizes.some((s) => ["2T", "3T"].includes(s))) {
      return "2-4";
    }
    if (toddlerSizes.some((s) => ["4T", "5T"].includes(s))) {
      return "4-6";
    }
  }
  if (sizes.some((s) => ["6", "8"].includes(s))) {
    return "6-8";
  }
  if (sizes.some((s) => ["10", "12"].includes(s))) {
    return "8-10";
  }
  if (sizes.some((s) => ["12", "14"].includes(s))) {
    return "10-12";
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

