"use client";

import * as React from "react";
import { useCartStore } from "@/lib/stores/cart-store";
import { useToast } from "@/components/ui/Toast";
import type { Product } from "@/types";

interface OptimisticCartOptions {
  /** Show toast notification */
  showToast?: boolean;
  /** Toast message */
  toastMessage?: string;
  /** On success callback */
  onSuccess?: () => void;
  /** On error callback */
  onError?: (error: Error) => void;
}

/**
 * useOptimisticCart Hook
 * 
 * Provides optimistic UI updates for cart operations.
 * Updates UI immediately, rolls back on error.
 */
export function useOptimisticCart() {
  const { addToast } = useToast();
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const optimisticAddToCart = React.useCallback(
    async (
      product: Product,
      size: string,
      quantity: number = 1,
      options: OptimisticCartOptions = {}
    ): Promise<void> => {
      const {
        showToast = true,
        toastMessage = `${product.name} added to cart`,
        onSuccess,
        onError,
      } = options;

      // Optimistic update: add to cart immediately
      const previousItems = useCartStore.getState().items;
      const itemId = `temp-${Date.now()}`;

      try {
        // Add item optimistically
        for (let i = 0; i < quantity; i++) {
          addItem(product, size);
        }

        // Show success toast immediately
        if (showToast) {
          addToast({
            type: "success",
            title: "Added to Cart",
            message: toastMessage,
            duration: 3000,
          });
        }

        // Simulate API call (replace with actual API call)
        await new Promise((resolve) => setTimeout(resolve, 500));

        // If API call succeeds, call success callback
        onSuccess?.();
      } catch (error) {
        // Rollback: restore previous cart state
        useCartStore.setState({ items: previousItems });

        // Show error toast
        addToast({
          type: "error",
          title: "Failed to Add to Cart",
          message: "Something went wrong. Please try again.",
          duration: 5000,
        });

        // Call error callback
        onError?.(error instanceof Error ? error : new Error("Unknown error"));
      }
    },
    [addItem, addToast]
  );

  const optimisticRemoveFromCart = React.useCallback(
    async (
      itemId: string,
      options: OptimisticCartOptions = {}
    ): Promise<void> => {
      const {
        showToast = true,
        toastMessage = "Item removed from cart",
        onSuccess,
        onError,
      } = options;

      // Optimistic update: remove immediately
      const previousItems = useCartStore.getState().items;
      const itemToRemove = previousItems.find((item) => item.id === itemId);

      try {
        removeItem(itemId);

        if (showToast) {
          addToast({
            type: "info",
            title: "Removed",
            message: toastMessage,
            duration: 3000,
          });
        }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300));

        onSuccess?.();
      } catch (error) {
        // Rollback
        useCartStore.setState({ items: previousItems });

        addToast({
          type: "error",
          title: "Failed to Remove Item",
          message: "Something went wrong. Please try again.",
          duration: 5000,
        });

        onError?.(error instanceof Error ? error : new Error("Unknown error"));
      }
    },
    [removeItem, addToast]
  );

  const optimisticUpdateQuantity = React.useCallback(
    async (
      itemId: string,
      quantity: number,
      options: OptimisticCartOptions = {}
    ): Promise<void> => {
      const {
        showToast = false,
        onSuccess,
        onError,
      } = options;

      // Optimistic update
      const previousItems = useCartStore.getState().items;
      const previousItem = previousItems.find((item) => item.id === itemId);
      const previousQuantity = previousItem?.quantity || 0;

      try {
        updateQuantity(itemId, quantity);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300));

        onSuccess?.();
      } catch (error) {
        // Rollback
        if (previousItem) {
          updateQuantity(itemId, previousQuantity);
        }

        addToast({
          type: "error",
          title: "Failed to Update Quantity",
          message: "Something went wrong. Please try again.",
          duration: 5000,
        });

        onError?.(error instanceof Error ? error : new Error("Unknown error"));
      }
    },
    [updateQuantity, addToast]
  );

  return {
    optimisticAddToCart,
    optimisticRemoveFromCart,
    optimisticUpdateQuantity,
  };
}
