/**
 * Styling Store
 * 
 * Zustand store for managing "Complete The Look" styling state.
 */

import { create } from "zustand";
import type { StyleLook } from "@/types/styling";
import { useCartStore } from "./cart-store";
import { getProductById } from "@/lib/utils/styling-utils";

interface StylingState {
  currentLook: StyleLook | null;
  customizedProducts: Record<string, string>; // category -> productId
  setCurrentLook: (look: StyleLook | null) => void;
  customizeProduct: (category: string, productId: string) => void;
  resetCustomization: () => void;
  addCompleteLookToCart: (
    look: StyleLook,
    sizes: Record<string, string>
  ) => { success: boolean; count: number };
}

export const useStylingStore = create<StylingState>((set, get) => ({
  currentLook: null,
  customizedProducts: {},
  
  setCurrentLook: (look) => set({ currentLook: look }),
  
  customizeProduct: (category, productId) => set((state) => ({
    customizedProducts: {
      ...state.customizedProducts,
      [category]: productId,
    },
  })),
  
  resetCustomization: () => set({ customizedProducts: {} }),
  
  addCompleteLookToCart: (look, sizes) => {
    const cartStore = useCartStore.getState();
    const { customizedProducts } = get();
    
    let addedCount = 0;
    
    // Handle both API format (products array) and mock format (products/items)
    const productsToAdd = look.products || (look as any).items || [];
    
    productsToAdd.forEach((item: any) => {
      const productId = item.productId || item.product?.id;
      const product = item.product || getProductById(productId);
      const size = sizes[productId];
      
      if (product && size) {
        // Check if size is available
        const sizeAvailable = product.sizes?.find(
          (s: any) => s.size === size && s.inStock
        ) || product.variants?.find(
          (v: any) => v.size === size && v.stock > 0
        );
        
        if (sizeAvailable) {
          cartStore.addItem(product, size);
          addedCount++;
        }
      }
    });
    
    // Reset customization after adding
    set({ customizedProducts: {} });
    
    // Return result for component to handle toast
    if (addedCount > 0) {
      return { success: true, count: addedCount };
    }
    
    return { success: false, count: 0 };
  },
}));
