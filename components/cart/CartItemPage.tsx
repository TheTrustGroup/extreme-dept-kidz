"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import type { CartItem, ProductImage } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { Body, H3 } from "@/components/ui/typography";

interface CartItemPageProps {
  item: CartItem;
}

/**
 * CartItemPage Component
 * 
 * Larger format cart item for the cart page.
 */
export function CartItemPage({ item }: CartItemPageProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const [removingItemId, setRemovingItemId] = React.useState<string | null>(
    null
  );

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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "flex flex-col sm:flex-row gap-6 p-6 rounded-lg border border-cream-200 bg-cream-50",
        removingItemId === item.id && "border-navy-900 bg-navy-50"
      )}
    >
      {/* Product Image */}
      <Link
        href={`/products/${item.product.slug}`}
        className="relative w-full sm:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-cream-100"
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
              <H3 className="font-serif text-xl font-semibold text-charcoal-900 mb-2 hover:text-navy-900 transition-colors duration-200">
                {item.product.name}
              </H3>
            </Link>
            <Body className="text-sm text-charcoal-600 mb-2">
              Size: {item.selectedSize}
            </Body>
            <Body className="font-semibold text-charcoal-900">
              {formatPrice(item.product.price)} each
            </Body>
          </div>

          {/* Price and Actions */}
          <div className="flex flex-col sm:items-end gap-4">
            <Body className="font-serif text-2xl font-semibold text-charcoal-900">
              {formatPrice(itemTotal)}
            </Body>

            {/* Quantity Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 border border-cream-200 rounded-lg">
                <button
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className={cn(
                    "p-2 hover:bg-cream-100 transition-colors duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4 text-charcoal-900" />
                </button>
                <span className="font-sans text-base font-medium text-charcoal-900 min-w-[3rem] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={item.quantity >= 10}
                  className={cn(
                    "p-2 hover:bg-cream-100 transition-colors duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4 text-charcoal-900" />
                </button>
              </div>

              {/* Remove Button */}
              <button
                onClick={handleRemove}
                className={cn(
                  "p-2 text-charcoal-600 hover:text-charcoal-900 transition-colors duration-200",
                  removingItemId === item.id && "text-navy-900"
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
    </motion.div>
  );
}

