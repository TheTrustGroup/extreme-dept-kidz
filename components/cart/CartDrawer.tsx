"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import type { CartItem as CartItemType } from "@/types";
import { cn } from "@/lib/utils";
import { useFormattedPrice } from "@/components/providers/CurrencyProvider";

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItemType[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

/**
 * Luxury cart drawer: slide-in from right, glassmorphism overlay,
 * product list with thumbnails, quantity controls, subtotal, checkout, empty state.
 * Pure UI — all behavior via props.
 */
export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemove,
}: CartDrawerProps): JSX.Element {
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const formatPrice = useFormattedPrice();

  const subtotal = React.useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  React.useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Glassmorphism overlay */}
          <m.div
            className="fixed inset-0 z-50 bg-luxury-navy-950/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-hidden
          />

          {/* Drawer panel — slide-in from right */}
          <m.div
            ref={drawerRef}
            className={cn(
              "fixed top-0 right-0 bottom-0 z-50 w-full max-w-[100vw] xs:max-w-sm sm:max-w-md",
              "flex flex-col bg-luxury-cream/95 backdrop-blur-md border-l border-white/20 shadow-2xl"
            )}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0 px-4 py-5 sm:px-6 border-b border-luxury-navy-200/30 bg-luxury-cream">
              <div>
                <h2
                  className={cn(
                    "text-lg sm:text-xl font-semibold text-luxury-navy tracking-tight",
                    "font-[family-name:var(--font-playfair),'Playfair_Display',Georgia,serif]"
                  )}
                >
                  Your Cart
                </h2>
                {items.length > 0 && (
                  <p className="text-sm text-luxury-navy-600 mt-0.5" aria-live="polite">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </p>
                )}
              </div>
              <m.button
                type="button"
                onClick={onClose}
                className="p-2 text-luxury-navy-600 hover:text-luxury-navy rounded-lg hover:bg-luxury-navy-100/50 focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:ring-offset-2"
                aria-label="Close cart"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5" />
              </m.button>
            </div>

            {/* Scrollable content */}
            <div
              className="flex-1 overflow-y-auto min-h-0"
              style={{
                WebkitOverflowScrolling: "touch",
                contain: "layout style paint",
              }}
            >
              {items.length === 0 ? (
                <EmptyState onClose={onClose} />
              ) : (
                <ul className="p-4 sm:p-6 space-y-4" role="list">
                  {items.map((item, index) => (
                    <DrawerCartItem
                      key={item.id ?? `${item.product.id}-${item.selectedSize}`}
                      item={item}
                      index={index}
                      onUpdateQuantity={onUpdateQuantity}
                      onRemove={onRemove}
                    />
                  ))}
                </ul>
              )}
            </div>

            {/* Footer: subtotal + checkout (only when not empty) */}
            {items.length > 0 && (
              <div className="flex-shrink-0 p-4 sm:p-6 border-t border-luxury-navy-200/30 bg-luxury-cream space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-luxury-navy">Subtotal</span>
                  <span
                    className={cn(
                      "text-lg font-semibold text-luxury-navy",
                      "font-[family-name:var(--font-playfair),'Playfair_Display',Georgia,serif]"
                    )}
                  >
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className={cn(
                    "block w-full py-3.5 text-center text-sm font-medium tracking-wider uppercase",
                    "bg-luxury-navy text-white rounded-none",
                    "hover:bg-luxury-navy/90 transition-colors",
                    "font-[family-name:var(--font-playfair),'Playfair_Display',Georgia,serif]"
                  )}
                >
                  Checkout
                </Link>
              </div>
            )}
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}

function getItemId(item: CartItemType): string {
  if (item.id) return item.id;
  return `${item.product.id}-${item.selectedSize}`;
}

interface DrawerCartItemProps {
  item: CartItemType;
  index: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

function DrawerCartItem({
  item,
  index,
  onUpdateQuantity,
  onRemove,
}: DrawerCartItemProps): JSX.Element {
  const id = getItemId(item);
  const formatPrice = useFormattedPrice();
  const thumb = item.product.images?.[0];
  const thumbUrl = thumb?.url;
  const thumbAlt = thumb?.alt ?? item.product.name;

  return (
    <m.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className={cn(
        "flex gap-4 p-4 rounded-lg border border-luxury-navy-200/30",
        "bg-white/60 backdrop-blur-sm hover:border-luxury-gold/30 transition-colors"
      )}
    >
      {/* Thumbnail */}
      <Link
        href={`/products/${item.product.slug}`}
        onClick={(e) => e.stopPropagation()}
        className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-luxury-navy-100/50 border border-luxury-navy-200/20"
      >
        {thumbUrl ? (
          <Image
            src={thumbUrl}
            alt={thumbAlt}
            fill
            className="object-cover"
            sizes="96px"
            quality={80}
          />
        ) : (
          <div className="w-full h-full bg-luxury-navy-200/30 flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-luxury-navy-400" />
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.product.slug}`}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "block font-medium text-luxury-navy line-clamp-2 hover:text-luxury-gold-700 transition-colors",
            "font-[family-name:var(--font-playfair),'Playfair_Display',Georgia,serif]"
          )}
        >
          {item.product.name}
        </Link>
        <p className="text-xs text-luxury-navy-600 mt-0.5">
          Size: <span className="font-medium">{item.selectedSize}</span>
        </p>
        <p className="text-sm font-semibold text-luxury-gold-700 mt-1">
          {formatPrice(item.product.price)}
          {item.quantity > 1 && (
            <span className="text-luxury-navy-600 font-normal ml-1">
              × {item.quantity} = {formatPrice(item.product.price * item.quantity)}
            </span>
          )}
        </p>

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-3">
          <div className="inline-flex items-center border border-luxury-navy-200/40 rounded-md bg-luxury-cream">
            <button
              type="button"
              onClick={() => onUpdateQuantity(id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="p-2 text-luxury-navy-700 hover:text-luxury-navy disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="min-w-[2rem] text-center text-sm font-medium text-luxury-navy" aria-live="polite">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(id, item.quantity + 1)}
              disabled={item.quantity >= 99}
              className="p-2 text-luxury-navy-700 hover:text-luxury-navy disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => onRemove(id)}
            className="p-2 text-luxury-navy-500 hover:text-luxury-navy rounded-md hover:bg-luxury-navy-100/50"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </m.li>
  );
}

function EmptyState({ onClose }: { onClose: () => void }): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[280px]">
      <m.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-5"
      >
        <ShoppingBag className="w-16 h-16 text-luxury-navy-300" aria-hidden />
      </m.div>
      <h3
        className={cn(
          "text-lg font-semibold text-luxury-navy mb-2",
          "font-[family-name:var(--font-playfair),'Playfair_Display',Georgia,serif]"
        )}
      >
        Your cart is empty
      </h3>
      <p className="text-sm text-luxury-navy-600 mb-6 max-w-xs">
        Discover our curated collection of premium pieces for young legends.
      </p>
      <Link
        href="/collections"
        onClick={onClose}
        className={cn(
          "inline-block px-6 py-3 text-sm font-medium tracking-wider uppercase",
          "bg-luxury-navy text-white rounded-none hover:bg-luxury-navy/90 transition-colors",
          "font-[family-name:var(--font-playfair),'Playfair_Display',Georgia,serif]"
        )}
      >
        Shop Collections
      </Link>
    </div>
  );
}
