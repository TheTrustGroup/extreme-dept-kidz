"use client";

import * as React from "react";
import { m, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product, ProductImage } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cart-store";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useFocusTrap } from "@/lib/hooks/use-keyboard-navigation";
import { useIsMobile } from "@/lib/hooks/use-media-query";
import Link from "next/link";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * QuickView Modal Component
 * 
 * Modal for quick product preview without leaving the page.
 */
export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps): JSX.Element {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const addToCart = useCartStore((state) => state.addItem);
  const [selectedSize, setSelectedSize] = React.useState<string>("");
  const [quantity, setQuantity] = React.useState<number>(1);
  const [currentImageIndex, setCurrentImageIndex] = React.useState<number>(0);
  const modalRef = React.useRef<HTMLDivElement>(null);
  
  // Focus trap for accessibility
  useFocusTrap(modalRef, isOpen);

  // Get all product images, sorted with primary first (defensive: never assume product.images is array)
  const productImages = React.useMemo(() => {
    const images = Array.isArray(product?.images) ? product.images : [];
    if (images.length === 0) return [];
    const sorted = [...images].sort((a, b) => {
      const aIsPrimary = (a as ProductImage).isPrimary ? 0 : 1;
      const bIsPrimary = (b as ProductImage).isPrimary ? 0 : 1;
      return aIsPrimary - bIsPrimary;
    });
    return sorted;
  }, [product?.images]);

  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];

  React.useEffect(() => {
    const s = Array.isArray(product?.sizes) ? product.sizes : [];
    if (s.length > 0) {
      const firstAvailable = s.find((el) => el.inStock);
      setSelectedSize(firstAvailable?.size ?? s[0]?.size ?? "");
    } else {
      setSelectedSize("");
    }
    setQuantity(1);
    setCurrentImageIndex(0);
  }, [product]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!product) return <></>;

  const currentImage = productImages[currentImageIndex] ?? productImages[0];
  const isOnSale = product.originalPrice != null && product.originalPrice > product.price;
  const availableSizes = sizes.filter((s) => s.inStock);
  const hasMultipleImages = productImages.length > 1;

  // Truncate description to 150 characters
  const shortDescription = product.description
    ? product.description.length > 150
      ? `${product.description.substring(0, 150)}...`
      : product.description
    : "";

  const handleAddToCart = (): void => {
    if (selectedSize && product.inStock) {
      // Add item multiple times based on quantity
      for (let i = 0; i < quantity; i++) {
        addToCart(product, selectedSize);
      }
      // Announce to screen readers
      const announcement = `${quantity} ${quantity === 1 ? 'item' : 'items'} of ${product.name} added to cart`;
      announceToScreenReader(announcement);
      onClose();
    }
  };

  // Screen reader announcement helper
  const announceToScreenReader = React.useCallback((message: string): void => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  const handlePreviousImage = (): void => {
    setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImage = (): void => {
    setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  const handleQuantityChange = (newQuantity: number): void => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-[9998]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal — PHASE 7: bottom-sheet on mobile, centered on desktop */}
          <m.div
            initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95, y: 20 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={cn(
              "fixed z-[9999] pointer-events-none",
              isMobile
                ? "inset-x-0 bottom-0 top-auto flex flex-col justify-end"
                : "inset-0 flex items-center justify-center p-4"
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-view-title"
          >
            <div
              ref={modalRef}
              className={cn(
                "relative w-full max-h-[90vh] overflow-hidden glass shadow-2xl pointer-events-auto",
                isMobile ? "max-w-none rounded-t-2xl rounded-b-none" : "max-w-4xl rounded-xl"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button — 44px touch target on mobile */}
              <button
                onClick={onClose}
                className={cn(
                  "absolute top-4 right-4 z-10 min-h-[44px] min-w-[44px] touch-target-min flex items-center justify-center rounded-full",
                  "bg-white/90 backdrop-blur-sm",
                  "hover:bg-white transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-navy-500",
                  theme === "dark" && "bg-dark-surface hover:bg-dark-bg-secondary"
                )}
                aria-label="Close quick view"
              >
                <X className={cn(
                  "w-5 h-5",
                  theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                )} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
                {/* Image Carousel */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-cream-100 dark:bg-dark-surface group">
                  {currentImage?.url ? (
                    <>
                      <OptimizedImage
                        key={currentImageIndex}
                        src={currentImage.url}
                        alt={currentImage.alt || product.name}
                        variant="product-detail"
                        isLCP={currentImageIndex === 0}
                        className="object-cover w-full h-full"
                        fill
                      />
                      
                      {/* Image Navigation - Show if multiple images */}
                      {hasMultipleImages && (
                        <>
                          {/* Previous Button */}
                          <button
                            onClick={handlePreviousImage}
                            className={cn(
                              "absolute left-2 top-1/2 -translate-y-1/2 z-10 min-h-[44px] min-w-[44px] touch-target-min flex items-center justify-center rounded-full",
                              "bg-white/90 backdrop-blur-sm shadow-lg",
                              "opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200",
                              "hover:bg-white focus:outline-none focus:ring-2 focus:ring-navy-500",
                              theme === "dark" && "bg-dark-surface/90 hover:bg-dark-bg-secondary"
                            )}
                            aria-label="Previous image"
                          >
                            <ChevronLeft className={cn(
                              "w-5 h-5",
                              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                            )} />
                          </button>

                          {/* Next Button */}
                          <button
                            onClick={handleNextImage}
                            className={cn(
                              "absolute right-2 top-1/2 -translate-y-1/2 z-10 min-h-[44px] min-w-[44px] touch-target-min flex items-center justify-center rounded-full",
                              "bg-white/90 backdrop-blur-sm shadow-lg",
                              "opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200",
                              "hover:bg-white focus:outline-none focus:ring-2 focus:ring-navy-500",
                              theme === "dark" && "bg-dark-surface/90 hover:bg-dark-bg-secondary"
                            )}
                            aria-label="Next image"
                          >
                            <ChevronRight className={cn(
                              "w-5 h-5",
                              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                            )} />
                          </button>

                          {/* Image Indicators */}
                          <div 
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2"
                            role="tablist"
                            aria-label="Product images"
                          >
                            {productImages.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={cn(
                                  "w-2 h-2 rounded-full transition-all duration-200",
                                  "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
                                  currentImageIndex === index
                                    ? "bg-navy-900 w-6"
                                    : theme === "dark"
                                      ? "bg-white/50 hover:bg-white/75"
                                      : "bg-white/50 hover:bg-white/75"
                                )}
                                role="tab"
                                aria-selected={currentImageIndex === index}
                                aria-label={`Go to image ${index + 1} of ${productImages.length}`}
                                tabIndex={currentImageIndex === index ? 0 : -1}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className={cn(
                        "text-sm",
                        theme === "dark" ? "text-dark-text-muted" : "text-charcoal-400"
                      )}>No Image</span>
                    </div>
                  )}
                </div>

                {/* Product Info — World-class kids brand: clear hierarchy, size → qty → Add to Bag → View full details */}
                <div className="flex flex-col gap-6 min-h-0">
                  {/* Title + Category + Price */}
                  <div>
                    <p className={cn(
                      "text-xs font-medium uppercase tracking-widest mb-1",
                      theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                    )}>
                      {product.category?.name ?? "Product"}
                    </p>
                    <h2
                      id="quick-view-title"
                      className={cn(
                        "text-xl sm:text-2xl font-serif font-bold mb-2",
                        theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                      )}
                    >
                      {product.name}
                    </h2>
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className={cn(
                        "text-xl font-serif font-semibold",
                        theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                      )}>
                        {formatPrice(product.price)}
                      </span>
                      {isOnSale && product.originalPrice && (
                        <span className={cn(
                          "text-base line-through",
                          theme === "dark" ? "text-dark-text-muted" : "text-charcoal-500"
                        )}>
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Short Description — optional, compact */}
                  {shortDescription && (
                    <p className={cn(
                      "text-sm leading-relaxed line-clamp-3",
                      theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                    )}>
                      {shortDescription}
                    </p>
                  )}

                  {/* Size — prominent, required for Add to Bag */}
                  {sizes.length > 0 && (
                    <div>
                      <p className={cn(
                        "text-sm font-semibold mb-2",
                        theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                      )}>
                        Size {!selectedSize && <span className="font-normal text-charcoal-500 dark:text-dark-text-muted">— Select size</span>}
                      </p>
                      <div
                        id="size-selection"
                        role="radiogroup"
                        aria-label="Select size"
                        className="flex flex-wrap gap-2"
                      >
                        {sizes.map((size) => (
                          <button
                            key={size.size}
                            onClick={() => setSelectedSize(size.size)}
                            disabled={!size.inStock}
                            role="radio"
                            aria-checked={selectedSize === size.size}
                            aria-label={`Size ${size.size}${!size.inStock ? " — Out of stock" : ""}`}
                            className={cn(
                              "min-w-[44px] min-h-[44px] px-4 rounded-lg border-2 font-medium transition-colors",
                              "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
                              selectedSize === size.size
                                ? "bg-navy-900 text-cream-50 border-navy-900 dark:bg-accent-primary dark:border-accent-primary dark:text-dark-bg-primary"
                                : size.inStock
                                  ? "bg-white dark:bg-dark-surface text-charcoal-900 dark:text-dark-text-primary border-cream-300 dark:border-dark-border-glass hover:border-navy-900 dark:hover:border-accent-primary"
                                  : "bg-cream-100 dark:bg-dark-bg-secondary text-charcoal-400 dark:text-dark-text-muted border-cream-200 dark:border-dark-border-glass cursor-not-allowed opacity-60"
                            )}
                          >
                            {size.size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity — compact row */}
                  <div>
                    <p className={cn(
                      "text-sm font-semibold mb-2",
                      theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                    )}>
                      Quantity
                    </p>
                    <div className={cn(
                      "inline-flex items-center border-2 rounded-lg overflow-hidden",
                      theme === "dark" ? "border-dark-border-glass bg-dark-surface" : "border-cream-300 bg-white"
                    )}>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className={cn(
                          "min-h-[44px] min-w-[44px] flex items-center justify-center font-semibold text-lg",
                          "hover:bg-cream-100 dark:hover:bg-dark-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed",
                          "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-navy-500",
                          theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                        )}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span
                        id="quantity-display"
                        className="min-w-[2.5rem] text-center font-semibold text-charcoal-900 dark:text-dark-text-primary"
                        aria-live="polite"
                      >
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= 10}
                        className={cn(
                          "min-h-[44px] min-w-[44px] flex items-center justify-center font-semibold text-lg",
                          "hover:bg-cream-100 dark:hover:bg-dark-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed",
                          "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-navy-500",
                          theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                        )}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Add to Bag — primary CTA, full width, prominent */}
                  <div className="flex flex-col gap-3 pt-2">
                    <Button
                      onClick={handleAddToCart}
                      disabled={!product.inStock || !selectedSize}
                      variant="primary"
                      size="lg"
                      className="w-full min-h-[48px] font-semibold uppercase tracking-wide"
                    >
                      Add to Bag
                    </Button>
                    <Link
                      href={product?.slug ? `/products/${product.slug}` : "/collections"}
                      onClick={onClose}
                      className={cn(
                        "text-center text-sm font-medium underline underline-offset-2 py-2",
                        theme === "dark" ? "text-dark-text-secondary hover:text-dark-text-primary" : "text-charcoal-600 hover:text-charcoal-900",
                        "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 rounded"
                      )}
                    >
                      View full details
                    </Link>
                  </div>

                  {!product.inStock && (
                    <p className={cn("text-sm font-medium", theme === "dark" ? "text-red-400" : "text-red-600")}>
                      Out of Stock
                    </p>
                  )}
                </div>
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
