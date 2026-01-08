/**
 * Cart Store
 * 
 * Zustand store for managing shopping cart state with localStorage persistence.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product, CartItem } from "@/types";

interface CartStore {
  // State
  items: CartItem[];
  isHydrated: boolean;

  // Actions
  addItem: (product: Product, size: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  setHydrated: () => void;
}

/**
 * Generate a unique cart item ID
 */
function generateCartItemId(): string {
  return `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if a cart item already exists (same product + size)
 */
function findExistingItem(
  items: CartItem[],
  productId: string,
  size: string
): CartItem | undefined {
  return items.find(
    (item) => item.product.id === productId && item.selectedSize === size
  );
}

// Safe localStorage wrapper with error handling
const safeLocalStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window === "undefined") {
        return null;
      }
      const value = localStorage.getItem(name);
      // Validate JSON if it exists
      if (value !== null) {
        try {
          JSON.parse(value);
        } catch {
          // Invalid JSON, remove it
          localStorage.removeItem(name);
          return null;
        }
      }
      return value;
    } catch (error) {
      console.warn("Failed to read from localStorage:", error);
      // Try to clear corrupted data
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem(name);
        }
      } catch {
        // Ignore cleanup errors
      }
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      if (typeof window === "undefined") {
        return;
      }
      // Validate JSON before storing
      JSON.parse(value);
      localStorage.setItem(name, value);
    } catch (error) {
      console.warn("Failed to write to localStorage:", error);
    }
  },
  removeItem: (name: string): void => {
    try {
      if (typeof window === "undefined") {
        return;
      }
      localStorage.removeItem(name);
    } catch (error) {
      console.warn("Failed to remove from localStorage:", error);
    }
  },
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isHydrated: false,

      /**
       * Add item to cart
       * If item with same product and size exists, increment quantity instead
       */
      addItem: (product: Product, size: string): void => {
        const { items } = get();

        // Check if item already exists
        const existingItem = findExistingItem(items, product.id, size);

        if (existingItem && existingItem.id) {
          // Increment quantity of existing item
          get().updateQuantity(existingItem.id, existingItem.quantity + 1);
        } else {
          // Create new cart item
          const newItem: CartItem = {
            id: generateCartItemId(),
            product,
            quantity: 1,
            selectedSize: size,
            addedAt: new Date().toISOString(),
          };

          set((state) => ({
            items: [...state.items, newItem],
          }));
        }
      },

      /**
       * Remove item from cart by ID
       */
      removeItem: (id: string): void => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      /**
       * Update quantity of a cart item
       * If quantity is 0 or less, remove the item
       */
      updateQuantity: (id: string, quantity: number): void => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      /**
       * Clear all items from cart
       */
      clearCart: (): void => {
        set({ items: [] });
      },

      /**
       * Calculate total price of all items in cart
       * Returns price in cents
       */
      getTotal: (): number => {
        const { items } = get();
        return items.reduce((total, item) => {
          return total + item.product.price * item.quantity;
        }, 0);
      },

      /**
       * Get total number of items in cart (sum of quantities)
       */
      getItemCount: (): number => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      /**
       * Set hydration status (used by CartProvider)
       */
      setHydrated: (): void => {
        set({ isHydrated: true });
      },
    }),
    {
      name: "extreme-dept-kidz-cart", // localStorage key
      storage: createJSONStorage(() => safeLocalStorage),
      // Only persist items, not hydration status
      partialize: (state) => ({ items: state.items }),
      // Handle hydration with error handling
      onRehydrateStorage: () => {
        return (state, error): void => {
          if (error) {
            console.warn("Failed to rehydrate cart from localStorage:", error);
            // Clear corrupted data
            try {
              if (typeof window !== "undefined") {
                localStorage.removeItem("extreme-dept-kidz-cart");
              }
            } catch (e) {
              // Ignore cleanup errors
            }
            // Reset to initial state
            if (state) {
              state.items = [];
              state.setHydrated();
            }
            return;
          }
          if (state) {
            // Validate items structure
            if (Array.isArray(state.items)) {
              // Filter out any invalid items
              state.items = state.items.filter(
                (item) =>
                  item &&
                  typeof item === "object" &&
                  item.product &&
                  item.id &&
                  typeof item.quantity === "number" &&
                  item.quantity > 0
              );
            } else {
              state.items = [];
            }
            state.setHydrated();
          }
        };
      },
    }
  )
);

