"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag, CheckCircle } from "lucide-react";
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

  // Focus management
  const drawerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (isOpen && drawerRef.current) {
      const firstFocusable = drawerRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            className="fixed inset-0 bg-charcoal-900/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <m.div
            className="fixed top-0 right-0 bottom-0 w-full max-w-[100vw] xs:max-w-sm sm:max-w-md md:max-w-lg bg-cream-50 shadow-2xl z-50 flex flex-col"
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
            <div className="flex items-center justify-between p-4 xs:p-5 sm:p-6 border-b border-cream-200 flex-shrink-0 bg-cream-50">
              <div>
                <H3 className="text-charcoal-900 text-lg xs:text-xl font-serif font-bold">
                  Your Cart
                </H3>
                {items.length > 0 && (
                  <Body className="text-sm text-charcoal-600 mt-0.5">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </Body>
                )}
              </div>
              <m.button
                onClick={onClose}
                className="p-2 text-charcoal-700 hover:text-charcoal-900 transition-colors duration-200 rounded-lg hover:bg-cream-200 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
                aria-label="Close cart"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5" />
              </m.button>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <EmptyCartState />
              ) : (
                <div className="p-4 xs:p-5 sm:p-6 space-y-3 xs:space-y-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item, index) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onQuantityChange={(quantity) =>
                          handleQuantityChange(item.id!, quantity)
                        }
                        onRemove={() => handleRemoveClick(item.id!)}
                        isRemoving={removingItemId === item.id}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-cream-200 p-6 space-y-4 bg-cream-50">
                {/* Subtotal */}
                <div className="flex items-center justify-between pb-2">
                  <Body className="font-semibold text-charcoal-900">
                    Subtotal
                  </Body>
                  <Body className="font-serif text-xl font-semibold text-charcoal-900">
                    {formatPrice(subtotal)}
                  </Body>
                </div>
                <div className="flex items-center justify-between text-sm text-charcoal-600 pb-2">
                  <span>Shipping</span>
                  <span className="text-xs">Calculated at checkout</span>
                </div>
                <div className="border-t border-cream-200 pt-3 pb-4">
                  <div className="flex items-center justify-between">
                    <Body className="font-bold text-charcoal-900 text-lg">
                      Total
                    </Body>
                    <Body className="font-serif text-2xl font-bold text-charcoal-900">
                      {formatPrice(subtotal)}
                    </Body>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="space-y-2 pb-4">
                  <div className="flex items-center gap-2 text-xs text-charcoal-600">
                    <CheckCircle className="w-3.5 h-3.5 text-forest-600 flex-shrink-0" />
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-charcoal-600">
                    <CheckCircle className="w-3.5 h-3.5 text-forest-600 flex-shrink-0" />
                    <span>Easy Returns</span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full py-6 text-base font-semibold uppercase tracking-wide"
                    asChild
                  >
                    <Link href="/checkout" onClick={onClose}>
                      Checkout
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full text-charcoal-700 hover:text-charcoal-900"
                    asChild
                  >
                    <Link href="/cart" onClick={onClose}>
                      View Cart
                    </Link>
                  </Button>
                  <Link
                    href="/collections"
                    onClick={onClose}
                    className="block text-center text-sm text-charcoal-600 hover:text-charcoal-900 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            )}
          </m.div>
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
  index: number;
}

function CartItem({
  item,
  onQuantityChange,
  onRemove,
  isRemoving,
  index,
}: CartItemProps): JSX.Element {
  const primaryImage =
    item.product.images.find((img) => (img as ProductImage).isPrimary) ||
    item.product.images[0];

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      className={cn(
        "flex gap-4 p-4 rounded-lg border-2 transition-all duration-200",
        isRemoving 
          ? "border-navy-900 bg-navy-50/50" 
          : "border-cream-200 bg-cream-50 hover:border-cream-300 hover:shadow-sm"
      )}
    >
      {/* Product Image */}
      <Link
        href={`/products/${item.product.slug}`}
        className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-cream-100 border border-cream-200"
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
          sizes="(max-width: 640px) 80px, 96px"
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
          Size: <span className="font-medium">{item.selectedSize}</span>
        </Body>
        <div className="flex items-baseline gap-2 mb-2">
          <Body className="font-semibold text-charcoal-900 text-base">
            {formatPrice(item.product.price)}
          </Body>
          {item.quantity > 1 && (
            <Body className="text-xs text-charcoal-500">
              × {item.quantity} = {formatPrice(item.product.price * item.quantity)}
            </Body>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-2 border-2 border-cream-200 rounded-lg bg-cream-50">
            <m.button
              onClick={() => onQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className={cn(
                "p-1.5 hover:bg-cream-100 transition-colors duration-200 rounded-l",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              aria-label="Decrease quantity"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Minus className="w-3.5 h-3.5 text-charcoal-900" />
            </m.button>
            <span className="font-sans text-sm font-semibold text-charcoal-900 min-w-[2.5rem] text-center">
              {item.quantity}
            </span>
            <m.button
              onClick={() => onQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= 10}
              className={cn(
                "p-1.5 hover:bg-cream-100 transition-colors duration-200 rounded-r",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              aria-label="Increase quantity"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus className="w-3.5 h-3.5 text-charcoal-900" />
            </m.button>
          </div>

          {/* Remove Button */}
          <m.button
            onClick={onRemove}
            className={cn(
              "p-2 text-charcoal-600 hover:text-charcoal-900 transition-colors duration-200 rounded-lg hover:bg-cream-100",
              isRemoving && "text-navy-900 bg-navy-50"
            )}
            aria-label={isRemoving ? "Confirm remove" : "Remove item"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isRemoving ? (
              <span className="text-xs font-medium">Confirm?</span>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </m.button>
        </div>
      </div>
    </m.div>
  );
}

/**
 * EmptyCartState Component
 */
function EmptyCartState(): JSX.Element {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center h-full p-8 text-center"
    >
      <m.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-6"
      >
        <ShoppingBag className="w-20 h-20 text-charcoal-300" />
      </m.div>
      <H3 className="text-charcoal-900 mb-2 text-xl">Your cart is empty</H3>
      <Body className="text-charcoal-600 mb-6 max-w-sm">
        Let&apos;s change that. Discover our curated collection of premium pieces for the modern boy.
      </Body>
      <Button variant="primary" size="lg" className="w-full sm:w-auto" asChild>
        <Link href="/collections/boys">SHOP BOYS</Link>
      </Button>
    </m.div>
  );
}

