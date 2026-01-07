"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { Button } from "@/components/ui/button";
import { H3, Body } from "@/components/ui/typography";
import type { ProductImage } from "@/types";
import { cn, formatPrice } from "@/lib/utils";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * CartDrawer Component
 * 
 * Premium cart drawer that slides in from the right.
 * Displays cart items with quantity controls and checkout options.
 */
export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getTotal = useCartStore((state) => state.getTotal);
  const [removingItemId, setRemovingItemId] = React.useState<string | null>(
    null
  );

  const subtotal = getTotal();

  // Handle quantity change
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    updateQuantity(itemId, newQuantity);
  };

  // Handle remove item with confirmation
  const handleRemoveClick = (itemId: string) => {
    if (removingItemId === itemId) {
      // Confirm removal
      removeItem(itemId);
      setRemovingItemId(null);
    } else {
      // Show confirmation state
      setRemovingItemId(itemId);
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => {
        setRemovingItemId((current) => (current === itemId ? null : current));
      }, 3000);
    }
  };

  // Prevent body scroll when drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setRemovingItemId(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-charcoal-900/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 w-full max-w-[100vw] xs:max-w-sm sm:max-w-md bg-cream-50 shadow-2xl z-50 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 35,
              stiffness: 400,
              mass: 0.8,
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 xs:p-5 sm:p-6 border-b border-cream-200 flex-shrink-0">
              <H3 className="text-charcoal-900 text-lg xs:text-xl">Shopping Cart</H3>
              <button
                onClick={onClose}
                className="p-2 text-charcoal-700 hover:text-charcoal-900 transition-colors duration-200 rounded-lg hover:bg-cream-200 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <EmptyCartState />
              ) : (
                <div className="p-4 xs:p-5 sm:p-6 space-y-3 xs:space-y-4">
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onQuantityChange={(quantity) =>
                        handleQuantityChange(item.id!, quantity)
                      }
                      onRemove={() => handleRemoveClick(item.id!)}
                      isRemoving={removingItemId === item.id}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-cream-200 p-6 space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <Body className="font-semibold text-charcoal-900">
                    Subtotal
                  </Body>
                  <Body className="font-serif text-xl font-semibold text-charcoal-900">
                    {formatPrice(subtotal)}
                  </Body>
                </div>

                {/* CTAs */}
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    asChild
                  >
                    <Link href="/checkout" onClick={onClose}>
                      Proceed to Checkout
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full"
                    asChild
                  >
                    <Link href="/cart" onClick={onClose}>
                      View Full Cart
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * CartItem Component
 */
interface CartItemProps {
  item: {
    id?: string;
    product: {
      id: string;
      name: string;
      slug: string;
      price: number;
      images: Array<{ url: string; alt?: string }>;
    };
    quantity: number;
    selectedSize: string;
  };
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  isRemoving: boolean;
}

function CartItem({
  item,
  onQuantityChange,
  onRemove,
  isRemoving,
}: CartItemProps) {
  const primaryImage =
    item.product.images.find((img) => (img as ProductImage).isPrimary) ||
    item.product.images[0];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "flex gap-4 p-4 rounded-lg border border-cream-200 bg-cream-50",
        isRemoving && "border-navy-900 bg-navy-50"
      )}
    >
      {/* Product Image */}
      <Link
        href={`/products/${item.product.slug}`}
        className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-cream-100"
        onClick={(e) => {
          // Prevent closing drawer when clicking image
          e.stopPropagation();
        }}
      >
        <Image
          src={primaryImage.url}
          alt={primaryImage.alt || item.product.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </Link>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.product.slug}`}
          className="block mb-1"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Body className="font-semibold text-charcoal-900 line-clamp-2 hover:text-navy-900 transition-colors duration-200">
            {item.product.name}
          </Body>
        </Link>
        <Body className="text-sm text-charcoal-600 mb-2">
          Size: {item.selectedSize}
        </Body>
        <Body className="font-semibold text-charcoal-900">
          {formatPrice(item.product.price)}
        </Body>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-2 border border-cream-200 rounded-lg">
            <button
              onClick={() => onQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className={cn(
                "p-1.5 hover:bg-cream-100 transition-colors duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5 text-charcoal-900" />
            </button>
            <span className="font-sans text-sm font-medium text-charcoal-900 min-w-[2rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= 10}
              className={cn(
                "p-1.5 hover:bg-cream-100 transition-colors duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5 text-charcoal-900" />
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={onRemove}
            className={cn(
              "p-1.5 text-charcoal-600 hover:text-charcoal-900 transition-colors duration-200",
              isRemoving && "text-navy-900"
            )}
            aria-label={isRemoving ? "Confirm remove" : "Remove item"}
          >
            {isRemoving ? (
              <span className="text-xs font-medium">Confirm?</span>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * EmptyCartState Component
 */
function EmptyCartState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="mb-6">
        <ShoppingBag className="w-16 h-16 text-charcoal-300" />
      </div>
      <H3 className="text-charcoal-900 mb-2">Your Cart Awaits</H3>
      <Body className="text-charcoal-600 mb-6 max-w-sm">
        Discover our curated collection of premium pieces. Each item is thoughtfully selected to elevate your child&apos;s wardrobe.
      </Body>
      <Button variant="primary" asChild>
        <Link href="/collections">Explore Collections</Link>
      </Button>
    </div>
  );
}

