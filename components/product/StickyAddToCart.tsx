"use client";

import * as React from "react";
import { m, AnimatePresence } from "framer-motion";
import { Check, Heart } from "lucide-react";
import type { Product } from "@/types";
import { useCartStore } from "@/lib/stores/cart-store";
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer";
import { useProductPurchase } from "@/lib/hooks/use-product-purchase";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StickyAddToCartProps {
  product: Product;
  className?: string;
  purchaseState?: ReturnType<typeof useProductPurchase>;
}

/**
 * StickyAddToCart — Polo Ralph Lauren–style: one primary CTA + wishlist heart only.
 * Mobile: Always visible. Desktop: Appears on scroll.
 */
export function StickyAddToCart({ product, className, purchaseState }: StickyAddToCartProps): JSX.Element {
  const [isVisible, setIsVisible] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const { open: openCart } = useCartDrawer();

  const localPurchaseState = useProductPurchase(product);
  const { selectedSize, quantity } = purchaseState || localPurchaseState;

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 1024) {
        setIsVisible(true);
        return;
      }
      setIsVisible(window.scrollY > 400);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll, { passive: true } as EventListenerOptions);
      window.removeEventListener("resize", handleScroll, { passive: true } as EventListenerOptions);
    };
  }, []);

  const handleAddToCart = async () => {
    const sizeToAdd = selectedSize?.size ?? (isOneSizeOrNoSizes ? "One Size" : null);
    if (!sizeToAdd || !product.inStock) return;
    setIsAddingToCart(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    const currentItems = useCartStore.getState().items;
    const existingItem = currentItems.find(
      (item) => item.product.id === product.id && item.selectedSize === sizeToAdd
    );

    if (existingItem?.id) {
      updateQuantity(existingItem.id, existingItem.quantity + quantity);
    } else {
      addItem(product, sizeToAdd);
      if (quantity > 1) {
        setTimeout(() => {
          const updatedItems = useCartStore.getState().items;
          const newItem = updatedItems.find(
            (item) => item.product.id === product.id && item.selectedSize === sizeToAdd
          );
          if (newItem?.id) updateQuantity(newItem.id, quantity);
        }, 10);
      }
    }

    setIsAddingToCart(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
    openCart();
  };

  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const isOneSizeOrNoSizes = sizes.length === 0;
  const canAddToCart = product.inStock && (selectedSize != null || isOneSizeOrNoSizes);

  return (
    <AnimatePresence>
      {isVisible && (
        <m.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "fixed bottom-0 left-0 right-0 z-[45] bg-white dark:bg-dark-bg-primary border-t border-cream-200 dark:border-dark-border-glass shadow-[0_-4px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.2)]",
            "pb-safe lg:pb-0",
            className
          )}
        >
          <div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          >
            {/* Polo: one row — primary button + heart */}
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                disabled={!canAddToCart || isAddingToCart}
                loading={isAddingToCart}
                loadingText="Adding..."
                className={cn(
                  "flex-1 min-h-[48px] font-semibold uppercase tracking-wide",
                  showSuccess && "bg-green-600 hover:bg-green-700"
                )}
              >
                {showSuccess ? (
                  <span className="flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    Added!
                  </span>
                ) : !product.inStock ? (
                  "Out of Stock"
                ) : !selectedSize && !isOneSizeOrNoSizes ? (
                  "Select Size"
                ) : (
                  "Add to Bag"
                )}
              </Button>
              <button
                type="button"
                className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg border-2 border-cream-300 dark:border-dark-border-glass bg-white dark:bg-dark-surface text-charcoal-900 dark:text-dark-text-primary hover:border-navy-900 dark:hover:border-accent-primary focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 shrink-0"
                aria-label="Add to wishlist"
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
