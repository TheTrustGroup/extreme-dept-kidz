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
  const addToCart = useCartStore((state) => state.addItem);
  const [selectedSize, setSelectedSize] = React.useState<string>("");
  const [quantity, setQuantity] = React.useState<number>(1);
  const [currentImageIndex, setCurrentImageIndex] = React.useState<number>(0);
  const modalRef = React.useRef<HTMLDivElement>(null);
  
  // Focus trap for accessibility
  useFocusTrap(modalRef, isOpen);

  // Get all product images, sorted with primary first
  const productImages = React.useMemo(() => {
    if (!product?.images) return [];
    const sorted = [...product.images].sort((a, b) => {
      const aIsPrimary = (a as ProductImage).isPrimary ? 0 : 1;
      const bIsPrimary = (b as ProductImage).isPrimary ? 0 : 1;
      return aIsPrimary - bIsPrimary;
    });
    return sorted;
  }, [product?.images]);

  React.useEffect(() => {
    if (product && product.sizes && product.sizes.length > 0) {
      // Set first available size as default
      const firstAvailable = product.sizes.find(s => s.inStock);
      setSelectedSize(firstAvailable?.size || product.sizes[0].size);
    }
    // Reset quantity and image index when product changes
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

  const currentImage = productImages[currentImageIndex] || productImages[0];
  const isOnSale = product.originalPrice && product.originalPrice > product.price;
  const availableSizes = product.sizes?.filter(s => s.inStock) || [];
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

          {/* Modal */}
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={cn(
              "fixed inset-0 z-[9999] flex items-center justify-center p-4",
              "pointer-events-none"
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-view-title"
          >
            <div
              ref={modalRef}
              className={cn(
                "relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl",
                "bg-cream-50 shadow-2xl pointer-events-auto",
                theme === "dark" && "bg-dark-bg-primary"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className={cn(
                  "absolute top-4 right-4 z-10",
                  "w-10 h-10 flex items-center justify-center rounded-full",
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[90vh]">
                {/* Image Carousel */}
                <div className="relative aspect-square rounded-lg overflow-hidden bg-cream-100 group">
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
                              "absolute left-2 top-1/2 -translate-y-1/2 z-10",
                              "w-10 h-10 flex items-center justify-center rounded-full",
                              "bg-white/90 backdrop-blur-sm shadow-lg",
                              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
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
                              "absolute right-2 top-1/2 -translate-y-1/2 z-10",
                              "w-10 h-10 flex items-center justify-center rounded-full",
                              "bg-white/90 backdrop-blur-sm shadow-lg",
                              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
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

                {/* Product Info */}
                <div className="flex flex-col gap-4">
                  <div>
                    <h2
                      id="quick-view-title"
                      className={cn(
                        "text-2xl font-serif font-bold mb-2",
                        theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                      )}
                    >
                      {product.name}
                    </h2>
                    <p className={cn(
                      "text-sm uppercase tracking-wider mb-4",
                      theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                    )}>
                      {product.category.name}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-3">
                    <span className={cn(
                      "text-2xl font-serif font-semibold",
                      theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                    )}>
                      {formatPrice(product.price)}
                    </span>
                    {isOnSale && product.originalPrice && (
                      <span className={cn(
                        "text-lg line-through",
                        theme === "dark" ? "text-dark-text-muted" : "text-charcoal-500"
                      )}>
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Short Description */}
                  {shortDescription && (
                    <div>
                      <p className={cn(
                        "text-sm leading-relaxed",
                        theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                      )}>
                        {shortDescription}
                      </p>
                    </div>
                  )}

                  {/* Size Selection */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div>
                      <label 
                        htmlFor="size-selection"
                        className={cn(
                          "block text-sm font-semibold mb-2",
                          theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                        )}
                      >
                        Size
                      </label>
                      <div 
                        id="size-selection"
                        role="radiogroup"
                        aria-label="Select size"
                        className="flex flex-wrap gap-2"
                      >
                        {product.sizes.map((size) => (
                          <button
                            key={size.size}
                            onClick={() => setSelectedSize(size.size)}
                            disabled={!size.inStock}
                            role="radio"
                            aria-checked={selectedSize === size.size}
                            aria-label={`Size ${size.size}${!size.inStock ? ' - Out of stock' : ''}`}
                            className={cn(
                              "px-4 py-2 rounded-lg border-2 transition-colors min-w-[44px] min-h-[44px]",
                              "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
                              selectedSize === size.size
                                ? "bg-navy-900 text-cream-50 border-navy-900"
                                : size.inStock
                                  ? theme === "dark"
                                    ? "bg-dark-surface text-dark-text-primary border-dark-border-glass hover:border-accent-primary"
                                    : "bg-white text-charcoal-900 border-cream-300 hover:border-navy-900"
                                  : "bg-cream-100 text-charcoal-400 border-cream-200 cursor-not-allowed opacity-50",
                              theme === "dark" && selectedSize !== size.size && size.inStock && "bg-dark-surface"
                            )}
                          >
                            {size.size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div>
                    <label 
                      htmlFor="quantity-display"
                      className={cn(
                        "block text-sm font-semibold mb-2",
                        theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                      )}
                    >
                      Quantity
                    </label>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex items-center gap-1 border-2 rounded-lg",
                        theme === "dark"
                          ? "border-dark-border-glass bg-dark-surface"
                          : "border-cream-300 bg-white"
                      )}>
                        <m.button
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={quantity <= 1}
                          className={cn(
                            "p-2 hover:bg-cream-100 transition-colors duration-200 rounded-l",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            "focus:outline-none focus:ring-2 focus:ring-navy-500",
                            theme === "dark" && "hover:bg-dark-bg-secondary"
                          )}
                          aria-label="Decrease quantity"
                          whileHover={{ scale: quantity > 1 ? 1.05 : 1 }}
                          whileTap={{ scale: quantity > 1 ? 0.95 : 1 }}
                        >
                          <span className={cn(
                            "text-lg font-semibold",
                            theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                          )}>−</span>
                        </m.button>
                        <span 
                          id="quantity-display"
                          className={cn(
                            "font-sans text-base font-semibold min-w-[3rem] text-center",
                            theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                          )}
                          aria-live="polite"
                          aria-atomic="true"
                        >
                          {quantity}
                        </span>
                        <m.button
                          onClick={() => handleQuantityChange(quantity + 1)}
                          disabled={quantity >= 10}
                          className={cn(
                            "p-2 hover:bg-cream-100 transition-colors duration-200 rounded-r",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            "focus:outline-none focus:ring-2 focus:ring-navy-500",
                            theme === "dark" && "hover:bg-dark-bg-secondary"
                          )}
                          aria-label="Increase quantity"
                          whileHover={{ scale: quantity < 10 ? 1.05 : 1 }}
                          whileTap={{ scale: quantity < 10 ? 0.95 : 1 }}
                        >
                          <span className={cn(
                            "text-lg font-semibold",
                            theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                          )}>+</span>
                        </m.button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      onClick={handleAddToCart}
                      disabled={!product.inStock || !selectedSize}
                      variant="primary"
                      size="lg"
                      className="w-full"
                    >
                      Add to Bag
                    </Button>
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={onClose}
                      className={cn(
                        "text-center py-3 px-4 rounded-lg border-2 transition-colors duration-200",
                        "font-sans font-semibold uppercase tracking-wide text-sm",
                        theme === "dark"
                          ? "border-dark-border-glass text-dark-text-primary hover:bg-dark-surface hover:border-accent-primary"
                          : "border-cream-300 text-charcoal-900 hover:bg-cream-100 hover:border-navy-900",
                        "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
                      )}
                    >
                      View Full Details
                    </Link>
                  </div>

                  {/* Stock Status */}
                  {!product.inStock && (
                    <p className={cn(
                      "text-sm font-medium",
                      theme === "dark" ? "text-red-400" : "text-red-600"
                    )}>
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
