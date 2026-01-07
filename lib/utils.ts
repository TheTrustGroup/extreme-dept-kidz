import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx and tailwind-merge for optimal className handling
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format price in cents to dollar string
 * @param price - Price in cents (e.g., 12900 = $129.00)
 * @returns Formatted price string (e.g., "$129.00")
 */
export function formatPrice(price: number): string {
  return `$${(price / 100).toFixed(2)}`;
}
