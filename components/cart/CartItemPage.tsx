"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { Plus, Minus, Trash2, Bookmark, BookmarkCheck } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { useSavedItemsStore } from "@/lib/stores/saved-items-store";
import type { CartItem, ProductImage } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { Body, H3 } from "@/components/ui/typography";
import { useTheme } from "@/components/providers/ThemeProvider";

interface CartItemPageProps {
  item: CartItem;
}

/**
 * CartItemPage Component
 * 
 * Larger format cart item for the cart page.
 */
export function CartItemPage({ item }: CartItemPageProps) {
  const { theme } = useTheme();
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const addSavedItem = useSavedItemsStore((state) => state.addItem);
  const [removingItemId, setRemovingItemId] = React.useState<string | null>(
    null
  );
  const [isSaving, setIsSaving] = React.useState(false);

  const primaryImage =
    item.product.images.find((img) => (img as ProductImage).isPrimary) ||
    item.product.images[0];

  const itemTotal = item.product.price * item.quantity;

  const handleQuantityChange = (newQuantity: number) => {
    if (item.id) {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handleRemove = () => {
    if (removingItemId === item.id) {
      // Confirm removal
      if (item.id) {
        removeItem(item.id);
      }
      setRemovingItemId(null);
    } else {
      // Show confirmation
      setRemovingItemId(item.id || null);
      setTimeout(() => {
        setRemovingItemId((current) => (current === item.id ? null : current));
      }, 3000);
    }
  };

  const handleSaveForLater = () => {
    if (!item.id) return;
    
    setIsSaving(true);
    addSavedItem(item.product, item.selectedSize);
    removeItem(item.id);
    
    // Show success feedback
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 rounded-xl border transition-colors duration-200",
        theme === "dark"
          ? removingItemId === item.id
            ? "border-navy-900 bg-navy-50/50"
            : "border-dark-border-glass bg-dark-surface"
          : removingItemId === item.id
            ? "border-navy-900 bg-navy-50"
            : "border-cream-200 bg-cream-50 glass-panel"
      )}
    >
      {/* Product Image */}
      <Link
        href={`/products/${item.product.slug}`}
        className="relative w-full sm:w-32 h-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-cream-100"
      >
        <Image
          src={primaryImage.url}
          alt={primaryImage.alt || item.product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 128px"
        />
      </Link>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <Link href={`/products/${item.product.slug}`}>
              <H3 className={cn(
                "font-serif text-xl font-semibold mb-2 hover:text-navy-900 transition-colors duration-200",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                {item.product.name}
              </H3>
            </Link>
            <Body className={cn(
              "text-sm mb-2",
              theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
            )}>
              Size: <span className="font-medium">{item.selectedSize}</span>
            </Body>
            <Body className={cn(
              "font-semibold",
              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
            )}>
              {formatPrice(item.product.price)} each
            </Body>
          </div>

          {/* Price and Actions */}
          <div className="flex flex-col sm:items-end gap-4">
            <Body className={cn(
              "font-serif text-2xl font-semibold",
              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
            )}>
              {formatPrice(itemTotal)}
            </Body>

            {/* Quantity Controls and Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              {/* Quantity Controls */}
              <div className={cn(
                "flex items-center gap-2 border rounded-lg",
                theme === "dark" ? "border-dark-border-glass bg-dark-bg-secondary" : "border-cream-200 bg-cream-50"
              )}>
                <button
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className={cn(
                    "p-2 sm:p-2.5 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center",
                    theme === "dark" 
                      ? "hover:bg-dark-bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      : "hover:bg-cream-100 disabled:opacity-50 disabled:cursor-not-allowed",
                    "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
                  )}
                  aria-label="Decrease quantity"
                >
                  <Minus className={cn(
                    "w-4 h-4",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )} />
                </button>
                <span className={cn(
                  "font-sans text-base font-medium min-w-[3rem] text-center",
                  theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                )}>
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={item.quantity >= 10}
                  className={cn(
                    "p-2 sm:p-2.5 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center",
                    theme === "dark"
                      ? "hover:bg-dark-bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      : "hover:bg-cream-100 disabled:opacity-50 disabled:cursor-not-allowed",
                    "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
                  )}
                  aria-label="Increase quantity"
                >
                  <Plus className={cn(
                    "w-4 h-4",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Save for Later */}
                <button
                  onClick={handleSaveForLater}
                  className={cn(
                    "p-2 sm:p-2.5 rounded-lg transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center",
                    theme === "dark"
                      ? "text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-secondary"
                      : "text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100",
                    "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
                  )}
                  aria-label="Save for later"
                  title="Save for later"
                >
                  {isSaving ? (
                    <BookmarkCheck className="w-5 h-5 text-green-600" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>

                {/* Remove Button */}
                <button
                  onClick={handleRemove}
                  className={cn(
                    "p-2 sm:p-2.5 rounded-lg transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center",
                    theme === "dark"
                      ? removingItemId === item.id
                        ? "text-navy-900 bg-navy-50"
                        : "text-dark-text-secondary hover:text-red-400 hover:bg-dark-bg-secondary"
                      : removingItemId === item.id
                        ? "text-navy-900 bg-navy-50"
                        : "text-charcoal-600 hover:text-red-600 hover:bg-cream-100",
                    "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  )}
                  aria-label={removingItemId === item.id ? "Confirm remove" : "Remove item"}
                >
                  {removingItemId === item.id ? (
                    <span className="text-sm font-medium">Confirm?</span>
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </m.div>
  );
}

