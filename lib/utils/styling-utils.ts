/**
 * Styling Utility Functions
 * 
 * Helper functions for "Complete The Look" feature.
 */

import type { StyleLook } from "@/types/styling";
import type { Product, CartItem } from "@/types";
import { styleLooks } from "@/lib/mock-data/styling-data";
import { productStylingData } from "@/lib/mock-data/styling-data";
import { mockProducts } from "@/lib/mock-data";

/**
 * Get complete looks for a specific product
 */
export function getCompleteLooksForProduct(productId: string): StyleLook[] {
  const styling = productStylingData[productId];
  if (!styling) return [];
  
  return styling.completeTheLook
    .map(({ lookId }) => styleLooks.find(look => look.id === lookId))
    .filter((look): look is StyleLook => look !== undefined);
}

/**
 * Get product by ID
 */
export function getProductById(productId: string): Product | undefined {
  return mockProducts.find(product => product.id === productId);
}

/**
 * Get missing items from a look based on cart contents
 */
export function getMissingItemsFromLook(
  look: StyleLook,
  cartItems: CartItem[]
): Product[] {
  const cartProductIds = cartItems.map(item => item.product.id);
  const missingProductIds = look.products
    .filter(({ productId, isOptional }) => {
      // Don't include optional items in missing items
      if (isOptional) return false;
      return !cartProductIds.includes(productId);
    })
    .map(({ productId }) => productId);
  
  return missingProductIds
    .map(id => getProductById(id))
    .filter((product): product is Product => product !== undefined);
}

/**
 * Check if cart items are part of any complete look
 */
export function getLooksForCartItems(cartItems: CartItem[]): StyleLook[] {
  const cartProductIds = cartItems.map(item => item.product.id);
  const matchingLooks: StyleLook[] = [];
  
  styleLooks.forEach(look => {
    const lookProductIds = look.products
      .filter(p => !p.isOptional)
      .map(p => p.productId);
    
    // Check if at least 2 products from the look are in cart
    const matchingCount = lookProductIds.filter(id => 
      cartProductIds.includes(id)
    ).length;
    
    if (matchingCount >= 2) {
      matchingLooks.push(look);
    }
  });
  
  return matchingLooks;
}

/**
 * Get cart recommendations based on cart contents
 */
export function getCartRecommendations(cartItems: CartItem[]): Product[] {
  const recommendations: Product[] = [];
  const cartProductIds = cartItems.map(item => item.product.id);
  
  // Find looks that match cart items
  const matchingLooks = getLooksForCartItems(cartItems);
  
  // Get missing items from matching looks
  matchingLooks.forEach(look => {
    const missing = getMissingItemsFromLook(look, cartItems);
    recommendations.push(...missing);
  });
  
  // Also add frequently bought with items
  cartItems.forEach(item => {
    const styling = productStylingData[item.product.id];
    if (styling?.frequentlyBoughtWith) {
      styling.frequentlyBoughtWith.forEach(productId => {
        if (!cartProductIds.includes(productId)) {
          const product = getProductById(productId);
          if (product && !recommendations.find(r => r.id === product.id)) {
            recommendations.push(product);
          }
        }
      });
    }
  });
  
  // Remove duplicates and limit to 6
  const uniqueRecommendations = Array.from(
    new Map(recommendations.map(p => [p.id, p])).values()
  );
  
  return uniqueRecommendations.slice(0, 6);
}

/**
 * Calculate bundle discount for a complete look
 */
export function calculateBundleDiscount(
  products: Product[],
  look: StyleLook
): {
  subtotal: number;
  discount: number;
  total: number;
  savings: number;
} {
  const subtotal = products.reduce((sum, p) => sum + p.price, 0);
  const discountPercent = look.bundleDiscount || 0;
  const discount = Math.round(subtotal * (discountPercent / 100));
  const total = subtotal - discount;
  
  return { 
    subtotal, 
    discount, 
    total, 
    savings: discount 
  };
}

/**
 * Recommend sizes for a complete look
 */
export function recommendSizesForLook(
  products: Product[],
  customerPreference?: { topSize?: string; bottomSize?: string }
): Record<string, string> {
  const recommendations: Record<string, string> = {};
  
  products.forEach(product => {
    const category = product.category.slug;
    
    // Use customer preference if available
    if (category === "boys" || category === "girls") {
      // Determine if it's a top or bottom based on product name/category
      const isTop = product.name.toLowerCase().includes("tee") ||
                   product.name.toLowerCase().includes("shirt") ||
                   product.name.toLowerCase().includes("polo") ||
                   product.name.toLowerCase().includes("hoodie") ||
                   product.name.toLowerCase().includes("sweater") ||
                   product.name.toLowerCase().includes("cardigan");
      
      const isBottom = product.name.toLowerCase().includes("pants") ||
                      product.name.toLowerCase().includes("jeans") ||
                      product.name.toLowerCase().includes("shorts") ||
                      product.name.toLowerCase().includes("joggers") ||
                      product.name.toLowerCase().includes("chino");
      
      if (isTop && customerPreference?.topSize) {
        recommendations[product.id] = customerPreference.topSize;
      } else if (isBottom && customerPreference?.bottomSize) {
        recommendations[product.id] = customerPreference.bottomSize;
      } else {
        // Default: use first available size
        const availableSize = product.sizes.find(s => s.inStock);
        if (availableSize) {
          recommendations[product.id] = availableSize.size;
        }
      }
    } else {
      // For shoes/accessories, use first available size
      const availableSize = product.sizes.find(s => s.inStock);
      if (availableSize) {
        recommendations[product.id] = availableSize.size;
      }
    }
  });
  
  return recommendations;
}
