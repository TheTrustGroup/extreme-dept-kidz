"use client";

import * as React from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { Eye, Heart } from "lucide-react";
import type { Product, ProductImage } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useTheme } from "@/components/providers/ThemeProvider";
import { WishlistButton } from "@/components/WishlistButton";
import { QuickViewModal } from "./QuickViewModal";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
  fetchPriority?: "auto" | "high" | "low";
}

/**
 * ProductCard Component
 * 
 * Improved product card with Quick View, wishlist, hover effects, and size availability.
 * Entire card is clickable except Quick View and Wishlist buttons.
 */
export const ProductCard = React.memo(function ProductCard({ 
  product, 
  className,
  priority = false,
  fetchPriority = "low"
}: ProductCardProps): JSX.Element {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = React.useState(false);

  // Get primary and secondary images
  const primaryImage = product.images?.find((img) => (img as ProductImage).isPrimary) || product.images?.[0];
  const secondaryImage = product.images?.[1];
  
  // Ensure we have a valid image URL
  if (!primaryImage?.url) {
    console.warn(`Product ${product.id} has no valid image`);
  }

  // Check if product is on sale
  const isOnSale = product.originalPrice && product.originalPrice > product.price;
  
  // Check if product is new (has "new" tag or created within last 30 days)
  const isNew = product.tags?.includes("new") || (product.createdAt 
    ? new Date(product.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
    : false);

  // Get available sizes for hover display
  const availableSizes = product.sizes?.filter(s => s.inStock) || [];
  const sizeLabels = availableSizes.map(s => s.size).slice(0, 5); // Show up to 5 sizes

  const handleQuickViewClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const handleWishlistClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <div
        className={cn(
          "group relative w-full",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Clickable Link Wrapper - Entire card except buttons */}
        <Link
          href={`/products/${product.slug}`}
          className={cn(
            "block focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 rounded-xl",
            "w-full h-full"
          )}
          aria-label={`View ${product.name} - ${formatPrice(product.price)}`}
        >
          <m.article
            className={cn(
              "product-card w-full flex flex-col relative overflow-hidden",
              "bg-cream-50 rounded-xl",
              theme === "dark" && "bg-dark-surface",
              "transition-all duration-300"
            )}
            aria-label={product.name}
            style={{
              aspectRatio: "4 / 5", // Changed to 4:5 aspect ratio
              minHeight: "400px",
            }}
            whileHover={{ 
              scale: 1.02,
              transition: { 
                duration: 0.3, 
                ease: [0.25, 0.46, 0.45, 0.94]
              }
            }}
            whileTap={{ 
              scale: 0.98,
              transition: { 
                duration: 0.1,
                ease: [0.4, 0, 1, 1]
              }
            }}
          >
            {/* Image Container */}
            <div 
              className="relative w-full flex-shrink-0 overflow-hidden"
              style={{ 
                aspectRatio: "4 / 5",
                borderRadius: "12px 12px 0 0",
              }}
            >
              {/* Primary Image */}
              {primaryImage?.url ? (
                <OptimizedImage
                  src={primaryImage.url}
                  alt={primaryImage.alt || `${product.name} - ${product.category.name}`}
                  variant="product-card"
                  isLCP={priority}
                  useIntersectionObserver={!priority}
                  enablePrefetch={true}
                  quality={80}
                  blurVariant="product-card"
                  className={cn(
                    "object-cover w-full h-full transition-opacity duration-500 ease-in-out",
                    isHovered && secondaryImage ? "opacity-0" : "opacity-100"
                  )}
                  fill
                />
              ) : (
                <div className="w-full h-full bg-cream-100 flex items-center justify-center">
                  <span className={cn(
                    "text-sm",
                    theme === "dark" ? "text-dark-text-muted" : "text-charcoal-400"
                  )}>No Image</span>
                </div>
              )}

              {/* Secondary Image (on hover) */}
              {secondaryImage?.url && (
                <OptimizedImage
                  src={secondaryImage.url}
                  alt={secondaryImage.alt || `${product.name} - alternate view`}
                  variant="product-card"
                  isLCP={false}
                  useIntersectionObserver={true}
                  enablePrefetch={false}
                  quality={80}
                  blurVariant="product-card"
                  className={cn(
                    "absolute inset-0 object-cover w-full h-full transition-opacity duration-500 ease-in-out",
                    isHovered ? "opacity-100" : "opacity-0"
                  )}
                  fill
                />
              )}

              {/* Badges - Top Left */}
              <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                {isNew && (
                  <m.span
                    className={cn(
                      "inline-flex items-center px-3 py-1 h-6",
                      "bg-charcoal-900 text-cream-50 rounded-full",
                      "font-sans text-[11px] font-semibold uppercase tracking-widest"
                    )}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    NEW
                  </m.span>
                )}
                {isOnSale && (
                  <m.span
                    className={cn(
                      "inline-flex items-center px-3 py-1 h-6",
                      "bg-navy-900 text-cream-50 rounded-full",
                      "font-sans text-[11px] font-semibold uppercase tracking-widest"
                    )}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    SALE
                  </m.span>
                )}
              </div>

              {/* Wishlist Button - Top Right */}
              <div 
                className="absolute top-3 right-3 z-10"
                onClick={handleWishlistClick}
              >
                <WishlistButton product={product} size="md" />
              </div>

              {/* Size Availability Overlay - Shows on hover */}
              {isHovered && availableSizes.length > 0 && (
                <m.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "absolute bottom-3 left-3 right-3",
                    "bg-white/95 backdrop-blur-sm rounded-lg p-2",
                    theme === "dark" && "bg-dark-surface/95"
                  )}
                >
                  <p className={cn(
                    "text-xs font-semibold uppercase tracking-wider mb-1",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Available Sizes
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {sizeLabels.map((size) => (
                      <span
                        key={size}
                        className={cn(
                          "px-2 py-0.5 text-[10px] font-medium rounded",
                          theme === "dark"
                            ? "bg-accent-primary/20 text-accent-primary"
                            : "bg-navy-900/10 text-navy-900"
                        )}
                      >
                        {size}
                      </span>
                    ))}
                    {availableSizes.length > 5 && (
                      <span className={cn(
                        "px-2 py-0.5 text-[10px] font-medium",
                        theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                      )}>
                        +{availableSizes.length - 5}
                      </span>
                    )}
                  </div>
                </m.div>
              )}

              {/* Out of Stock Overlay */}
              {!product.inStock && (
                <div className={cn(
                  "absolute inset-0 flex items-center justify-center",
                  "bg-cream-50/90 backdrop-blur-sm",
                  theme === "dark" && "bg-dark-bg-primary/90"
                )}>
                  <span className={cn(
                    "font-serif text-lg font-medium uppercase tracking-wide",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-600"
                  )}>
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 flex flex-col p-4 gap-2">
              {/* Category/Collection Tag */}
              <p className={cn(
                "font-sans text-[11px] font-medium uppercase tracking-widest",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
              )}>
                {product.category.name}
                {product.tags?.includes("new") && " • New"}
              </p>

              {/* Product Name */}
              <h3 className={cn(
                "font-serif text-lg font-semibold line-clamp-2",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                {product.name}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-2 mt-auto">
                <span className={cn(
                  "font-serif text-xl font-semibold",
                  theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                )}>
                  {formatPrice(product.price)}
                </span>
                {isOnSale && product.originalPrice && (
                  <span className={cn(
                    "font-sans text-sm line-through",
                    theme === "dark" ? "text-dark-text-muted" : "text-charcoal-500"
                  )}>
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Quick View Button - Shows on hover */}
            {isHovered && product.inStock && (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-20 left-4 right-4 z-10"
              >
                <button
                  onClick={handleQuickViewClick}
                  className={cn(
                    "w-full flex items-center justify-center gap-2",
                    "h-11 px-4 py-2.5 rounded-lg",
                    "bg-navy-900 text-cream-50",
                    "font-sans text-sm font-semibold uppercase tracking-wide",
                    "hover:bg-navy-800 transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
                    "shadow-lg"
                  )}
                  aria-label={`Quick view ${product.name}`}
                >
                  <Eye className="w-4 h-4" aria-hidden="true" />
                  <span>Quick View</span>
                </button>
              </m.div>
            )}
          </m.article>
        </Link>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memoization
  return prevProps.product.id === nextProps.product.id &&
         prevProps.product.price === nextProps.product.price &&
         prevProps.product.inStock === nextProps.product.inStock &&
         prevProps.className === nextProps.className;
});
