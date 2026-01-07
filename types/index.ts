/**
 * TypeScript Type Definitions
 * 
 * Comprehensive type definitions for Extreme Dept Kidz e-commerce platform.
 * All types are exported for use throughout the application.
 */

export * from "./checkout";

/**
 * Product Image
 * Represents a product image with URL and optional alt text
 */
export interface ProductImage {
  /** URL of the product image */
  url: string;
  /** Alt text for accessibility (optional) */
  alt?: string;
  /** Whether this is the primary/featured image */
  isPrimary?: boolean;
}

/**
 * Product Size
 * Represents available sizes for a product
 */
export interface ProductSize {
  /** Size identifier (e.g., "XS", "S", "M", "L", "XL", "2T", "3T", "4", "5", "6") */
  size: string;
  /** Whether this size is currently in stock */
  inStock: boolean;
  /** Optional size description or fit notes */
  description?: string;
}

/**
 * Product Category Reference
 * Basic category information for a product
 */
export interface ProductCategory {
  /** Unique category identifier */
  id: string;
  /** Category name */
  name: string;
  /** URL-friendly category slug */
  slug: string;
}

/**
 * Product
 * Core product entity representing an item in the catalog
 */
export interface Product {
  /** Unique product identifier */
  id: string;
  /** Product name/title */
  name: string;
  /** Detailed product description */
  description: string;
  /** Product price in the smallest currency unit (e.g., cents for USD) */
  price: number;
  /** Optional original price for sale items */
  originalPrice?: number;
  /** Array of product images */
  images: ProductImage[];
  /** Available sizes for this product */
  sizes: ProductSize[];
  /** Product category */
  category: ProductCategory;
  /** URL-friendly product slug for routing */
  slug: string;
  /** Whether the product is currently in stock (at least one size available) */
  inStock: boolean;
  /** Optional product tags (e.g., "new", "sale", "bestseller") */
  tags?: string[];
  /** Optional product SKU */
  sku?: string;
  /** Optional product weight for shipping calculations */
  weight?: number;
  /** Optional product dimensions for shipping */
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  /** Optional product metadata */
  metadata?: Record<string, unknown>;
  /** Product creation date */
  createdAt?: Date | string;
  /** Product last update date */
  updatedAt?: Date | string;
}

/**
 * Cart Item
 * Represents a product added to the shopping cart
 */
export interface CartItem {
  /** The product being added to cart */
  product: Product;
  /** Quantity of this product in the cart */
  quantity: number;
  /** Selected size for this cart item */
  selectedSize: string;
  /** Optional cart item ID (for cart management) */
  id?: string;
  /** Timestamp when item was added to cart */
  addedAt?: Date | string;
}

/**
 * Collection
 * Represents a product collection (e.g., "New Arrivals", "Street Essentials")
 */
export interface Collection {
  /** Unique collection identifier */
  id: string;
  /** Collection name */
  name: string;
  /** URL-friendly collection slug for routing */
  slug: string;
  /** Collection description */
  description?: string;
  /** Collection featured image */
  image: string;
  /** Optional collection banner image */
  bannerImage?: string;
  /** Whether the collection is currently active/visible */
  isActive?: boolean;
  /** Optional collection metadata */
  metadata?: Record<string, unknown>;
  /** Collection creation date */
  createdAt?: Date | string;
  /** Collection last update date */
  updatedAt?: Date | string;
}

/**
 * Category
 * Represents a product category (e.g., "Boys", "Girls", "Accessories")
 */
export interface Category {
  /** Unique category identifier */
  id: string;
  /** Category name */
  name: string;
  /** URL-friendly category slug for routing */
  slug: string;
  /** Optional category description */
  description?: string;
  /** Optional category image/icon */
  image?: string;
  /** Parent category ID for nested categories (optional) */
  parentId?: string;
  /** Whether the category is currently active/visible */
  isActive?: boolean;
  /** Optional category metadata */
  metadata?: Record<string, unknown>;
  /** Category creation date */
  createdAt?: Date | string;
  /** Category last update date */
  updatedAt?: Date | string;
}

/**
 * Utility Types
 */

/**
 * Product with minimal fields for list/card views
 */
export type ProductPreview = Pick<
  Product,
  | "id"
  | "name"
  | "price"
  | "originalPrice"
  | "images"
  | "slug"
  | "inStock"
  | "category"
>;

/**
 * Collection with product count
 */
export type CollectionWithCount = Collection & {
  /** Number of products in this collection */
  productCount: number;
};

/**
 * Category with product count
 */
export type CategoryWithCount = Category & {
  /** Number of products in this category */
  productCount: number;
};

/**
 * Cart summary for checkout
 */
export interface CartSummary {
  /** Array of items in the cart */
  items: CartItem[];
  /** Total number of items (sum of quantities) */
  totalItems: number;
  /** Subtotal before taxes and shipping */
  subtotal: number;
  /** Tax amount */
  tax: number;
  /** Shipping cost */
  shipping: number;
  /** Total amount including all fees */
  total: number;
}

