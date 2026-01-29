"use client";

import * as React from "react";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { useToast } from "@/components/ui/Toast";
import type { Product } from "@/types";

interface OptimisticWishlistOptions {
  /** Show toast notification */
  showToast?: boolean;
  /** Toast message for add */
  addToastMessage?: string;
  /** Toast message for remove */
  removeToastMessage?: string;
  /** On success callback */
  onSuccess?: () => void;
  /** On error callback */
  onError?: (error: Error) => void;
}

/**
 * useOptimisticWishlist Hook
 * 
 * Provides optimistic UI updates for wishlist operations.
 * Updates UI immediately, syncs in background.
 */
export function useOptimisticWishlist() {
  const { addToast } = useToast();
  const addItem = useWishlistStore((state) => state.addItem);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);

  const optimisticToggleWishlist = React.useCallback(
    async (
      product: Product,
      options: OptimisticWishlistOptions = {}
    ): Promise<void> => {
      const {
        showToast = true,
        addToastMessage = `${product.name} added to wishlist`,
        removeToastMessage = `${product.name} removed from wishlist`,
        onSuccess,
        onError,
      } = options;

      const wasInWishlist = isInWishlist(product.id);

      // Optimistic update: toggle immediately
      toggleItem(product);

      try {
        // Show toast immediately
        if (showToast) {
          addToast({
            type: wasInWishlist ? "info" : "success",
            title: wasInWishlist ? "Removed" : "Added to Wishlist",
            message: wasInWishlist ? removeToastMessage : addToastMessage,
            duration: 3000,
          });
        }

        // Simulate API call (sync in background)
        await new Promise((resolve) => setTimeout(resolve, 500));

        onSuccess?.();
      } catch (error) {
        // Rollback: toggle again to restore previous state
        toggleItem(product);

        addToast({
          type: "error",
          title: "Failed to Update Wishlist",
          message: "Something went wrong. Please try again.",
          duration: 5000,
        });

        onError?.(error instanceof Error ? error : new Error("Unknown error"));
      }
    },
    [toggleItem, isInWishlist, addToast]
  );

  const optimisticAddToWishlist = React.useCallback(
    async (
      product: Product,
      options: OptimisticWishlistOptions = {}
    ): Promise<void> => {
      const {
        showToast = true,
        addToastMessage = `${product.name} added to wishlist`,
        onSuccess,
        onError,
      } = options;

      // Optimistic update
      addItem(product);

      try {
        if (showToast) {
          addToast({
            type: "success",
            title: "Added to Wishlist",
            message: addToastMessage,
            duration: 3000,
          });
        }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        onSuccess?.();
      } catch (error) {
        // Rollback
        removeItem(product.id);

        addToast({
          type: "error",
          title: "Failed to Add to Wishlist",
          message: "Something went wrong. Please try again.",
          duration: 5000,
        });

        onError?.(error instanceof Error ? error : new Error("Unknown error"));
      }
    },
    [addItem, removeItem, addToast]
  );

  const optimisticRemoveFromWishlist = React.useCallback(
    async (
      productId: string,
      options: OptimisticWishlistOptions = {}
    ): Promise<void> => {
      const {
        showToast = true,
        removeToastMessage = "Item removed from wishlist",
        onSuccess,
        onError,
      } = options;

      // Optimistic update
      removeItem(productId);

      try {
        if (showToast) {
          addToast({
            type: "info",
            title: "Removed",
            message: removeToastMessage,
            duration: 3000,
          });
        }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        onSuccess?.();
      } catch (error) {
        // Note: Can't easily rollback without product object
        // In production, you'd want to store the product before removal

        addToast({
          type: "error",
          title: "Failed to Remove from Wishlist",
          message: "Something went wrong. Please try again.",
          duration: 5000,
        });

        onError?.(error instanceof Error ? error : new Error("Unknown error"));
      }
    },
    [removeItem, addToast]
  );

  return {
    optimisticToggleWishlist,
    optimisticAddToWishlist,
    optimisticRemoveFromWishlist,
    isInWishlist,
  };
}
