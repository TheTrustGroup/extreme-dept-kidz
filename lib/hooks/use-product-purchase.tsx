"use client";

import * as React from "react";
import type { Product, ProductSize } from "@/types";

/**
 * Shared purchase state hook for product pages
 * 
 * Synchronizes size and quantity selection between ProductInfo
 * and StickyAddToCart components to prevent duplication.
 */
export function useProductPurchase(product: Product) {
  const [selectedSize, setSelectedSize] = React.useState<ProductSize | null>(null);
  const [quantity, setQuantity] = React.useState(1);

  const availableSizes = React.useMemo(
    () => (Array.isArray(product.sizes) ? product.sizes : []).filter((size) => size.inStock),
    [product.sizes]
  );

  // Set initial selected size to first available
  React.useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);

  const handleSizeSelect = React.useCallback((size: ProductSize) => {
    setSelectedSize(size);
  }, []);

  const handleQuantityChange = React.useCallback((delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, 10)));
  }, []);

  const resetQuantity = React.useCallback(() => {
    setQuantity(1);
  }, []);

  return {
    selectedSize,
    quantity,
    availableSizes,
    handleSizeSelect,
    handleQuantityChange,
    resetQuantity,
    setSelectedSize,
    setQuantity,
  };
}
