"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "@/types";

export interface SavedItem {
  id: string;
  product: Product;
  selectedSize: string;
  savedAt: string;
}

interface SavedItemsStore {
  items: SavedItem[];
  addItem: (product: Product, size: string) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
}

/**
 * Generate a unique saved item ID
 */
function generateSavedItemId(): string {
  return `saved-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useSavedItemsStore = create<SavedItemsStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (product: Product, size: string): void => {
        const newItem: SavedItem = {
          id: generateSavedItemId(),
          product,
          selectedSize: size,
          savedAt: new Date().toISOString(),
        };

        set((state) => ({
          items: [...state.items, newItem],
        }));
      },

      removeItem: (id: string): void => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      clearAll: (): void => {
        set({ items: [] });
      },
    }),
    {
      name: "extreme-dept-kidz-saved-items",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
    }
  )
);
