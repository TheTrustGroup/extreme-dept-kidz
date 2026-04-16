/**
 * Product Size Constants
 *
 * Standard sizes used across the application for consistency.
 */

/**
 * Canonical age-first sizing for kids clothing.
 * This is the single source of truth for admin forms, filtering and PDP size selectors.
 *
 * Order requirement:
 * 3 months, 6 months, 9 months, then 1 year through 12 years.
 */
export const DEFAULT_PRODUCT_SIZES = [
  "3M",
  "6M",
  "9M",
  "1Y",
  "2Y",
  "3Y",
  "4Y",
  "5Y",
  "6Y",
  "7Y",
  "8Y",
  "9Y",
  "10Y",
  "11Y",
  "12Y",
] as const;

/**
 * All available product sizes
 * Used for filtering and size selection
 */
export const ALL_PRODUCT_SIZES = DEFAULT_PRODUCT_SIZES;

/**
 * Type for product size
 */
export type ProductSizeValue = typeof ALL_PRODUCT_SIZES[number];

/**
 * Legacy size aliases used by older catalog data.
 * Helps migration and filtering while records are being normalized.
 */
export const LEGACY_SIZE_TO_AGE_SIZE: Record<string, ProductSizeValue> = {
  "2T": "2Y",
  "3T": "3Y",
  "4T": "4Y",
  "5T": "5Y",
  "6": "6Y",
  "7": "7Y",
  "8": "8Y",
  "9": "9Y",
  "10": "10Y",
  "11": "11Y",
  "12": "12Y",
};

/**
 * Normalize incoming size labels to canonical age-first values.
 * Returns null when no reasonable mapping can be inferred.
 */
export function normalizeProductSizeLabel(rawSize: string): ProductSizeValue | null {
  const trimmed = rawSize.trim().toUpperCase();
  if (!trimmed) return null;
  if ((ALL_PRODUCT_SIZES as readonly string[]).includes(trimmed)) {
    return trimmed as ProductSizeValue;
  }
  if (trimmed in LEGACY_SIZE_TO_AGE_SIZE) {
    return LEGACY_SIZE_TO_AGE_SIZE[trimmed];
  }
  if (/^\d{1,2}Y$/.test(trimmed)) {
    const years = Number.parseInt(trimmed, 10);
    if (years >= 1 && years <= 12) return `${years}Y` as ProductSizeValue;
  }
  if (/^\d{1,2}M$/.test(trimmed)) {
    const months = Number.parseInt(trimmed, 10);
    if (months === 3 || months === 6 || months === 9) {
      return `${months}M` as ProductSizeValue;
    }
  }
  return null;
}

/**
 * Create default size structure with zero quantities
 */
export function createDefaultSizes() {
  return DEFAULT_PRODUCT_SIZES.map((size) => ({
    size,
    quantity: 0,
    inStock: false,
  }));
}
