"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { Plus, Minus, ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Body } from "@/components/ui/typography";
import type { ProductImage } from "@/types";
import { cn } from "@/lib/utils";
import { useFormattedPrice } from "@/components/providers/CurrencyProvider";
import { useTheme } from "@/components/providers/ThemeProvider";

interface CartPreviewDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const MAX_PREVIEW_ITEMS = 5;

/**
 * CartPreviewDropdown Component
 * 
 * Premium cart preview dropdown that appears when cart icon is clicked.
 * Shows mini cart items with quick actions and checkout options.
 */
export function CartPreviewDropdown({
  isOpen,
  onClose,
  triggerRef,
}: CartPreviewDropdownProps) {
  const { theme } = useTheme();
  const formatPrice = useFormattedPrice();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotal = useCartStore((state) => state.getTotal);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState<{ top: number; right: number }>({
    top: 0,
    right: 0,
  });

  const subtotal = getTotal();
  const previewItems = items.slice(0, MAX_PREVIEW_ITEMS);
  const hasMoreItems = items.length > MAX_PREVIEW_ITEMS;

  // Calculate dropdown position based on trigger button
  React.useEffect(() => {
    if (isOpen && triggerRef.current) {
      const updatePosition = () => {
        if (!triggerRef.current) return;
        
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        // On mobile, show as full-width panel from top
        if (viewportWidth < 768) {
          setPosition({
            top: triggerRect.bottom + 8,
            right: 0,
          });
        } else {
          // Desktop: position below and align to right edge of trigger
          setPosition({
            top: triggerRect.bottom + 12,
            right: viewportWidth - triggerRect.right,
          });
        }
      };

      updatePosition();
      
      // Update position on resize
      window.addEventListener("resize", updatePosition);
      return () => window.removeEventListener("resize", updatePosition);
    }
  }, [isOpen, triggerRef]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, triggerRef]);

  // Prevent body scroll on mobile when dropdown is open
  React.useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      useCartStore.getState().updateQuantity(itemId, newQuantity);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Only on mobile */}
          <m.div
            className="md:hidden fixed inset-0 bg-charcoal-900/40 backdrop-blur-sm z-[999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dropdown Panel */}
          <m.div
            ref={dropdownRef}
            className={cn(
              "fixed z-[1000]",
              "w-full md:w-[420px] lg:w-[480px]",
              "max-h-[85vh] md:max-h-[600px]",
              "flex flex-col",
              "rounded-lg md:rounded-xl",
              "shadow-2xl",
              "border",
              theme === "dark"
                ? "bg-dark-bg-primary border-dark-border-glass"
                : "bg-cream-50 border-cream-200"
            )}
            style={{
              top: `${position.top}px`,
              right: typeof window !== "undefined" && window.innerWidth < 768 ? 0 : `${position.right}px`,
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 400,
              mass: 0.5,
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Cart preview"
          >
            {/* Header */}
            <div
              className={cn(
                "flex items-center justify-between p-4 md:p-5 border-b flex-shrink-0",
                theme === "dark"
                  ? "border-dark-border-glass"
                  : "border-cream-200"
              )}
            >
              <div>
                <h3
                  className={cn(
                    "font-serif text-lg md:text-xl font-bold",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}
                >
                  Your Cart
                </h3>
                {items.length > 0 && (
                  <Body
                    className={cn(
                      "text-sm mt-0.5",
                      theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                    )}
                  >
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </Body>
                )}
              </div>
              <m.button
                onClick={onClose}
                className={cn(
                  "p-2 rounded-lg transition-colors duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2",
                  theme === "dark"
                    ? "text-dark-text-primary hover:text-accent-primary hover:bg-dark-surface focus:ring-accent-primary"
                    : "text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-200 focus:ring-navy-500"
                )}
                aria-label="Close cart preview"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5" />
              </m.button>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {items.length === 0 ? (
                <EmptyCartState theme={theme} />
              ) : (
                <div className="p-4 md:p-5 space-y-3">
                  <AnimatePresence mode="popLayout">
                    {previewItems.map((item, index) => (
                      <CartPreviewItem
                        key={item.id}
                        item={item}
                        onQuantityChange={(quantity) =>
                          handleQuantityChange(item.id!, quantity)
                        }
                        index={index}
                        theme={theme}
                      />
                    ))}
                  </AnimatePresence>

                  {hasMoreItems && (
                    <m.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn(
                        "text-center py-2 text-sm",
                        theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                      )}
                    >
                      + {items.length - MAX_PREVIEW_ITEMS} more item
                      {items.length - MAX_PREVIEW_ITEMS > 1 ? "s" : ""}
                    </m.div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div
                className={cn(
                  "border-t p-4 md:p-5 space-y-3 flex-shrink-0",
                  theme === "dark"
                    ? "border-dark-border-glass bg-dark-bg-secondary"
                    : "border-cream-200 bg-cream-50"
                )}
              >
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <Body
                    className={cn(
                      "font-semibold",
                      theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                    )}
                  >
                    Subtotal
                  </Body>
                  <Body
                    className={cn(
                      "font-serif text-lg font-semibold",
                      theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                    )}
                  >
                    {formatPrice(subtotal)}
                  </Body>
                </div>

                {/* CTAs */}
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full py-3 text-sm font-semibold uppercase tracking-wide"
                    asChild
                  >
                    <Link href="/checkout" onClick={onClose}>
                      Checkout
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className={cn(
                      "w-full",
                      theme === "dark"
                        ? "text-dark-text-primary hover:text-accent-primary hover:bg-dark-surface"
                        : "text-charcoal-700 hover:text-charcoal-900"
                    )}
                    asChild
                  >
                    <Link href="/cart" onClick={onClose}>
                      View Cart
                    </Link>
                  </Button>
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
 * CartPreviewItem Component
 */
interface CartPreviewItemProps {
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
  index: number;
  theme: "light" | "dark";
}

function CartPreviewItem({
  item,
  onQuantityChange,
  index,
  theme,
}: CartPreviewItemProps) {
  const formatPrice = useFormattedPrice();
  const primaryImage =
    item.product.images.find((img) => (img as ProductImage).isPrimary) ||
    item.product.images[0];

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ duration: 0.2, delay: index * 0.03, ease: "easeOut" }}
      className={cn(
        "flex gap-3 p-3 rounded-lg border transition-all duration-200",
        theme === "dark"
          ? "border-dark-border-glass bg-dark-surface hover:border-dark-border-glass/50"
          : "border-cream-200 bg-cream-50 hover:border-cream-300 hover:shadow-sm"
      )}
    >
      {/* Product Image */}
      <Link
        href={`/products/${item.product.slug}`}
        className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-cream-100 border border-cream-200"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={primaryImage.url}
          alt={primaryImage.alt || item.product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 64px, 80px"
          quality={75}
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
      </Link>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.product.slug}`}
          className="block mb-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Body
            className={cn(
              "font-semibold line-clamp-2 transition-colors duration-200 text-sm",
              theme === "dark"
                ? "text-dark-text-primary hover:text-accent-primary"
                : "text-charcoal-900 hover:text-navy-900"
            )}
          >
            {item.product.name}
          </Body>
        </Link>
        <Body
          className={cn(
            "text-xs mb-1.5",
            theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
          )}
        >
          Size: <span className="font-medium">{item.selectedSize}</span>
        </Body>
        <div className="flex items-center justify-between">
          <Body
            className={cn(
              "font-semibold text-sm",
              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
            )}
          >
            {formatPrice(item.product.price)}
          </Body>

          {/* Quantity Controls */}
          <div className="flex items-center gap-1.5 border rounded-lg bg-cream-50">
            <m.button
              onClick={() => onQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className={cn(
                "p-1 hover:bg-cream-100 transition-colors duration-200 rounded-l",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                theme === "dark" && "bg-dark-surface hover:bg-dark-bg-secondary"
              )}
              aria-label="Decrease quantity"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Minus
                className={cn(
                  "w-3 h-3",
                  theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                )}
              />
            </m.button>
            <span
              className={cn(
                "font-sans text-xs font-semibold min-w-[1.5rem] text-center",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}
            >
              {item.quantity}
            </span>
            <m.button
              onClick={() => onQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= 10}
              className={cn(
                "p-1 hover:bg-cream-100 transition-colors duration-200 rounded-r",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                theme === "dark" && "bg-dark-surface hover:bg-dark-bg-secondary"
              )}
              aria-label="Increase quantity"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus
                className={cn(
                  "w-3 h-3",
                  theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                )}
              />
            </m.button>
          </div>
        </div>
      </div>
    </m.div>
  );
}

/**
 * EmptyCartState Component
 */
interface EmptyCartStateProps {
  theme: "light" | "dark";
}

function EmptyCartState({ theme }: EmptyCartStateProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center p-8 md:p-12 text-center"
    >
      <m.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-4"
      >
        <ShoppingBag
          className={cn(
            "w-16 h-16 md:w-20 md:h-20",
            theme === "dark" ? "text-dark-text-muted" : "text-charcoal-300"
          )}
        />
      </m.div>
      <h3
        className={cn(
          "font-serif text-lg md:text-xl font-bold mb-2",
          theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
        )}
      >
        Your cart is empty
      </h3>
      <Body
        className={cn(
          "text-sm mb-6 max-w-sm",
          theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
        )}
      >
        Let&apos;s change that. Discover our curated collection of premium pieces for young legends.
      </Body>
      <Button variant="primary" size="lg" className="w-full sm:w-auto" asChild>
        <Link href="/collections/boys">SHOP BOYS</Link>
      </Button>
    </m.div>
  );
}
