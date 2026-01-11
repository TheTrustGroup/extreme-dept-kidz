/**
 * Complete Look Type Definitions
 */

import type { Product } from "./index";

/**
 * Complete Look Item
 * Represents a product within a complete look
 */
export interface CompleteLookItem {
  /** Product ID reference */
  productId: string;
  /** Full product details */
  product: Product;
  /** Whether this item is required for the complete look */
  required: boolean;
}

/**
 * Complete Look
 * Represents a curated outfit with multiple products
 */
export interface CompleteLook {
  /** Unique complete look identifier */
  id: string;
  /** Complete look name */
  name: string;
  /** Detailed description of the complete look */
  description: string;
  /** Main image showing the complete look */
  mainImage: string;
  /** Array of products in this complete look */
  items: CompleteLookItem[];
  /** Total price if buying all items individually */
  totalPrice: number;
  /** Bundle price for buying the complete look */
  bundlePrice: number;
  /** Savings amount (totalPrice - bundlePrice) */
  savings: number;
  /** Whether this look is featured */
  featured: boolean;
  /** Tags for filtering and categorization */
  tags: string[];
  /** Optional complete look slug for routing */
  slug?: string;
  /** Optional creation date */
  createdAt?: Date | string;
  /** Optional last update date */
  updatedAt?: Date | string;
}
