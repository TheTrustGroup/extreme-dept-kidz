"use client";

import * as React from "react";
import { m, AnimatePresence } from "framer-motion";
import { Check, Plus, Minus, ShoppingBag } from "lucide-react";
import type { Product, ProductSize } from "@/types";
import { useCartStore } from "@/lib/stores/cart-store";
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";

interface StickyAddToCartProps {
  product: Product;
  className?: string;
}

/**
 * StickyAddToCart Component
 * 
 * Premium sticky add-to-cart bar with glassmorphism, price display,
 * size selector, and quantity controls. Appears on scroll.
 */
export function StickyAddToCart({ product, className }: StickyAddToCartProps) {
  const [selectedSize, setSelectedSize] = React.useState<ProductSize | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [isVisible, setIsVisible] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const { open: openCart } = useCartDrawer();

  const availableSizes = product.sizes.filter((size) => size.inStock);
  const isOnSale = product.originalPrice && product.originalPrice > product.price;

  // Set initial selected size
  React.useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);

  // Show/hide sticky bar on scroll
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = 400; // Show after scrolling 400px
      setIsVisible(scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSizeSelect = (size: ProductSize) => {
    setSelectedSize(size);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, 10)));
  };

  const handleAddToCart = async () => {
    if (!selectedSize || !product.inStock) return;

    setIsAddingToCart(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const currentItems = useCartStore.getState().items;
    const existingItem = currentItems.find(
      (item) => item.product.id === product.id && item.selectedSize === selectedSize.size
    );

    if (existingItem && existingItem.id) {
      updateQuantity(existingItem.id, existingItem.quantity + quantity);
    } else {
      addItem(product, selectedSize.size);
      if (quantity > 1) {
        setTimeout(() => {
          const updatedItems = useCartStore.getState().items;
          const newItem = updatedItems.find(
            (item) => item.product.id === product.id && item.selectedSize === selectedSize.size
          );
          if (newItem && newItem.id) {
            updateQuantity(newItem.id, quantity);
          }
        }, 10);
      }
    }

    setIsAddingToCart(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    openCart();
  };

  const canAddToCart = selectedSize && product.inStock;

  return (
    <AnimatePresence>
      {isVisible && (
        <m.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "fixed bottom-0 left-0 right-0 z-40",
            "glass-panel-strong border-t border-cream-200/60",
            "shadow-glass-xl",
            className
          )}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Product Info & Price */}
              <div className="flex-1 flex items-center gap-4 sm:gap-6 min-w-0">
                <div className="flex-shrink-0 hidden sm:block">
                  <h3 className="font-serif text-lg font-semibold text-charcoal-900 line-clamp-1">
                    {product.name}
                  </h3>
                </div>
                <div className="flex items-baseline gap-2 sm:gap-3 flex-shrink-0">
                  <span className="font-serif text-xl sm:text-2xl font-semibold text-charcoal-900">
                    {formatPrice(product.price)}
                  </span>
                  {isOnSale && product.originalPrice && (
                    <span className="font-sans text-sm text-charcoal-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Size Selector */}
              <div className="flex items-center gap-3 flex-wrap">
                {availableSizes.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-charcoal-600 uppercase tracking-wider hidden sm:inline">
                      Size:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {availableSizes.slice(0, 5).map((size) => {
                        const isSelected = selectedSize?.size === size.size;
                        return (
                          <m.button
                            key={size.size}
                            onClick={() => handleSizeSelect(size)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                              "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
                              isSelected
                                ? "bg-navy-900 text-cream-50 shadow-glass"
                                : "bg-cream-100 text-charcoal-900 hover:bg-cream-200 border border-cream-200"
                            )}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label={`Select size ${size.size}`}
                          >
                            {size.size}
                          </m.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="flex items-center gap-2 border border-cream-200 rounded-lg p-1 bg-cream-50/50">
                  <m.button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className={cn(
                      "p-1.5 rounded transition-colors duration-200",
                      "hover:bg-cream-200 disabled:opacity-50 disabled:cursor-not-allowed",
                      "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-1"
                    )}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4 text-charcoal-900" />
                  </m.button>
                  <span className="font-sans text-sm font-semibold text-charcoal-900 min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <m.button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                    className={cn(
                      "p-1.5 rounded transition-colors duration-200",
                      "hover:bg-cream-200 disabled:opacity-50 disabled:cursor-not-allowed",
                      "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-1"
                    )}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4 text-charcoal-900" />
                  </m.button>
                </div>

                {/* Add to Cart Button */}
                <m.div
                  initial={false}
                  animate={{ scale: showSuccess ? 0.95 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={!canAddToCart || isAddingToCart}
                    loading={isAddingToCart}
                    loadingText="Adding..."
                    className={cn(
                      "min-w-[140px] sm:min-w-[160px]",
                      "transition-all duration-300",
                      showSuccess && "bg-sage-600 hover:bg-sage-700"
                    )}
                  >
                    {showSuccess ? (
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Added!
                      </span>
                    ) : !product.inStock ? (
                      "Unavailable"
                    ) : !selectedSize ? (
                      "Select Size"
                    ) : (
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        Add to Cart
                      </span>
                    )}
                  </Button>
                </m.div>
              </div>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
