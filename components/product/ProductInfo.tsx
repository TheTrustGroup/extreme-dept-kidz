"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Minus, Heart, Share2, Star, Truck, ChevronRight, Ruler, Tag } from "lucide-react";
import type { Product, ProductSize } from "@/types";
import { useCartStore } from "@/lib/stores/cart-store";
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer";
import { useProductPurchase } from "@/lib/hooks/use-product-purchase";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormattedPrice } from "@/components/ui/FormattedPrice";

interface ProductInfoProps {
  product: Product;
  className?: string;
  purchaseState?: ReturnType<typeof useProductPurchase>;
}

/**
 * ProductInfo — Polo Ralph Lauren–style: single card, clear order.
 * Category → Name → Price → Shipping → Size (Size Chart) → SELECT SIZE / ADD TO BAG + heart
 * → Dividers → REVIEWS, SHIPPING AND FREE RETURNS, SHARE ITEM → Description → VIEW PRODUCT DETAILS.
 */
export function ProductInfo({ product, className, purchaseState }: ProductInfoProps): JSX.Element {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const { open: openCart } = useCartDrawer();

  const localPurchaseState = useProductPurchase(product);
  const {
    selectedSize,
    quantity,
    handleSizeSelect,
    handleQuantityChange,
  } = purchaseState || localPurchaseState;

  const isOnSale = product.originalPrice != null && product.originalPrice > product.price;

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
    <div className={cn("space-y-0", className)}>
      {/* Polo order: Category → Name → Price → Shipping */}
      <p className="text-xs font-normal text-charcoal-500 dark:text-dark-text-secondary uppercase tracking-wide mb-1">
        {product.category?.name ?? "Product"}
      </p>
      <h1 className="font-sans text-xl sm:text-2xl lg:text-3xl font-bold text-charcoal-900 dark:text-dark-text-primary leading-tight mb-2">
        {product.name}
      </h1>
      <p className="text-xl sm:text-2xl font-bold text-charcoal-900 dark:text-dark-text-primary mb-1">
        <FormattedPrice
          value={product.price}
          originalValue={isOnSale ? product.originalPrice : undefined}
          showOriginal={isOnSale}
        />
      </p>
      <p className="text-xs font-normal text-charcoal-500 dark:text-dark-text-secondary uppercase tracking-wider mb-5">
        Free shipping on orders over ₵800
      </p>

      {/* SIZE: Size Chart link + size buttons */}
      {sizes.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm font-semibold text-charcoal-900 dark:text-dark-text-primary uppercase tracking-wide">
              Size
              {!selectedSize && (
                <span className="font-normal text-charcoal-500 dark:text-dark-text-muted normal-case ml-1">
                  — Select size
                </span>
              )}
            </span>
            <Link
              href="/size-guide"
              className="text-xs font-normal text-charcoal-500 dark:text-dark-text-secondary hover:text-charcoal-900 dark:hover:text-dark-text-primary flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 rounded"
            >
              <Ruler className="w-3.5 h-3.5" aria-hidden />
              Size Chart
              <ChevronRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size: ProductSize) => {
              const isSelected = selectedSize?.size === size.size;
              const isAvailable = size.inStock;
              return (
                <button
                  key={size.size}
                  type="button"
                  onClick={() => isAvailable && handleSizeSelect(size)}
                  disabled={!isAvailable}
                  className={cn(
                    "min-h-[44px] min-w-[44px] px-4 rounded-lg border-2 font-medium text-sm transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
                    isSelected
                      ? "bg-navy-900 text-cream-50 border-navy-900 dark:bg-accent-primary dark:border-accent-primary dark:text-dark-bg-primary"
                      : isAvailable
                        ? "bg-white dark:bg-dark-surface text-charcoal-900 dark:text-dark-text-primary border-cream-300 dark:border-dark-border-glass hover:border-navy-900 dark:hover:border-accent-primary"
                        : "bg-cream-100 dark:bg-dark-bg-secondary text-charcoal-400 dark:text-dark-text-muted border-cream-200 dark:border-dark-border-glass cursor-not-allowed opacity-60"
                  )}
                  aria-label={`Size ${size.size}${!isAvailable ? " — Out of stock" : ""}`}
                >
                  {size.size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity — compact row (Polo often hides on mobile; we keep for clarity) */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-charcoal-900 dark:text-dark-text-primary mb-2">
          Quantity
        </p>
        <div className={cn(
          "inline-flex items-center border-2 rounded-lg overflow-hidden",
          "border-cream-300 dark:border-dark-border-glass bg-white dark:bg-dark-surface"
        )}>
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center font-semibold text-lg text-charcoal-900 dark:text-dark-text-primary hover:bg-cream-100 dark:hover:bg-dark-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-inset focus:ring-navy-500"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="min-w-[2.5rem] text-center font-semibold text-charcoal-900 dark:text-dark-text-primary" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= 10}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center font-semibold text-lg text-charcoal-900 dark:text-dark-text-primary hover:bg-cream-100 dark:hover:bg-dark-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-inset focus:ring-navy-500"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Primary CTA + Wishlist — Polo: SELECT SIZE / ADD TO BAG + heart */}
      <div className="flex gap-3 mb-6">
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
          className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg border-2 border-cream-300 dark:border-dark-border-glass bg-white dark:bg-dark-surface text-charcoal-900 dark:text-dark-text-primary hover:border-navy-900 dark:hover:border-accent-primary focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
          aria-label="Add to wishlist"
        >
          <Heart className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-green-700 dark:text-green-400 font-medium mb-6"
          >
            Item added to your cart
          </motion.p>
        )}
      </AnimatePresence>

      {/* Dividers + tappable rows — Polo: REVIEWS, SHIPPING AND FREE RETURNS, SHARE ITEM */}
      <nav className="border-t border-cream-200 dark:border-dark-border-glass pt-4 space-y-0" aria-label="Product information links">
        <PoloRow icon={<Star className="w-4 h-4" />} label="Reviews (0)" href="#reviews" />
        <PoloRow icon={<Truck className="w-4 h-4" />} label="Shipping and Free Returns" href="#shipping" />
        <PoloRow
          icon={<Share2 className="w-4 h-4" />}
          label="Share Item"
          onClick={() => {
            if (typeof navigator !== "undefined" && navigator.share) {
              navigator.share({
                title: product.name,
                url: typeof window !== "undefined" ? window.location.href : "",
              }).catch(() => {});
            }
          }}
        />
      </nav>

      {/* Description — Polo: serif, justified */}
      {product.description && (
        <>
          <div className="border-t border-cream-200 dark:border-dark-border-glass pt-4 mt-4">
            <p className="font-serif text-sm sm:text-base text-charcoal-700 dark:text-dark-text-secondary leading-relaxed text-justify">
              {product.description}
            </p>
          </div>
        </>
      )}

      {/* VIEW PRODUCT DETAILS — Polo: link with tag icon + arrow */}
      <div className="border-t border-cream-200 dark:border-dark-border-glass pt-4 mt-4">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between py-2 text-left text-sm font-medium uppercase tracking-wider text-charcoal-900 dark:text-dark-text-primary hover:text-charcoal-600 dark:hover:text-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 rounded"
          aria-expanded={showDetails}
        >
          <span className="flex items-center gap-2">
            <Tag className="w-4 h-4" aria-hidden />
            View Product Details
          </span>
          <ChevronRight className={cn("w-4 h-4 transition-transform", showDetails && "rotate-90")} aria-hidden />
        </button>
        {showDetails && (
          <div className="pt-3 pb-2 text-sm text-charcoal-600 dark:text-dark-text-secondary space-y-2">
            <p>Premium materials, designed for comfort and style. Machine wash cold. Tumble dry low.</p>
            <p>Free shipping on orders over ₵800. Easy returns within 30 days.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PoloRow({
  icon,
  label,
  href,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
}): JSX.Element {
  const content = (
    <>
      <span className="flex items-center gap-3 text-charcoal-900 dark:text-dark-text-primary">
        {icon}
        <span className="text-sm font-medium uppercase tracking-wider">{label}</span>
      </span>
      <ChevronRight className="w-4 h-4 text-charcoal-500 dark:text-dark-text-muted shrink-0" aria-hidden />
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center justify-between py-4 border-b border-cream-100 dark:border-dark-border-glass last:border-b-0 hover:bg-cream-50/50 dark:hover:bg-dark-bg-secondary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 rounded-lg -mx-1 px-1"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between py-4 border-b border-cream-100 dark:border-dark-border-glass last:border-b-0 hover:bg-cream-50/50 dark:hover:bg-dark-bg-secondary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 rounded-lg -mx-1 px-1 text-left"
    >
      {content}
    </button>
  );
}
