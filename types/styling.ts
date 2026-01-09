/**
 * Styling Types
 * 
 * Type definitions for "Complete The Look" styling feature.
 */

export interface StyleLook {
  id: string;
  name: string; // "Urban Explorer", "Playground Ready", "Weekend Casual"
  description: string;
  occasion?: string; // "Everyday", "Special Occasion", "Active"
  season?: "spring" | "summer" | "fall" | "winter" | "all-season";
  ageRange?: string; // "4-6", "7-9", "10-12"
  mainImage: string; // Lifestyle shot of complete outfit
  products: {
    productId: string;
    category: "top" | "bottom" | "outerwear" | "shoes" | "accessories";
    isOptional?: boolean;
  }[];
  totalPrice: number;
  bundleDiscount?: number; // Percentage off when buying complete look
  createdAt: Date;
  featured?: boolean;
}

export interface ProductStyling {
  productId: string;
  completeTheLook: {
    lookId: string;
    alternativeProducts?: {
      // For each category, show 2-3 alternatives
      category: string;
      productIds: string[];
    }[];
  }[];
  frequentlyBoughtWith?: string[]; // Simple product IDs
  styleNotes?: string; // "Pairs perfectly with denim or joggers"
}
