/**
 * Product Size Constants
 * 
 * Standard sizes used across the application for consistency.
 */

/**
 * Default product sizes for kids clothing
 * Used in product forms and inventory management
 */
export const DEFAULT_PRODUCT_SIZES = ["4T", "5T", "6", "8", "10", "12"] as const;

/**
 * All available product sizes
 * Used for filtering and size selection
 */
export const ALL_PRODUCT_SIZES = ["2T", "3T", "4T", "5T", "6", "8", "10", "12"] as const;

/**
 * Type for product size
 */
export type ProductSizeValue = typeof ALL_PRODUCT_SIZES[number];

/**
 * Create default size structure with zero quantities
 */
export function createDefaultSizes() {
  return DEFAULT_PRODUCT_SIZES.map(size => ({
    size,
    quantity: 0,
    inStock: false,
  }));
}
