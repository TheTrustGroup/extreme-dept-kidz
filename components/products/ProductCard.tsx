"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import type { Product, ProductImage } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { getProductCardBlurPlaceholder } from "@/lib/utils/image-utils";
import { PRODUCT_CARD_SIZES } from "@/lib/utils/responsive-image";
import { useCartStore } from "@/lib/stores/cart-store";
import { WishlistButton } from "@/components/WishlistButton";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
  fetchPriority?: "auto" | "high" | "low";
}

/**
 * ProductCard Component
 * 
 * Luxury product card with hover effects and quick view.
 * Displays product image, name, and price with smooth transitions.
 * Optimized with React.memo for performance.
 */
export const ProductCard = React.memo(function ProductCard({ 
  product, 
  className,
  priority = false,
  fetchPriority = "low"
}: ProductCardProps): JSX.Element {
  const [isHovered, setIsHovered] = React.useState(false);
  const addToCart = useCartStore((state) => state.addItem);

  // Get primary image
  const primaryImage = product.images.find((img) => (img as ProductImage).isPrimary) || product.images[0];
  const secondaryImage = product.images[1];

  // Check if product is on sale
  const isOnSale = product.originalPrice && product.originalPrice > product.price;
  
  // Check if product is new (created within last 30 days)
  const isNew = product.createdAt 
    ? new Date(product.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
    : false;

  const handleQuickAdd = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    if (product.inStock) {
      // Use default size or first available size
      const defaultSize = product.sizes && product.sizes.length > 0 
        ? product.sizes[0].size 
        : "One Size";
      addToCart(product, defaultSize);
    }
  };


  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group block focus:outline-none focus:ring-2 focus:ring-navy-900 focus:ring-offset-2",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      aria-label={`View ${product.name} - ${formatPrice(product.price)}`}
    >
      <m.article
        className={cn(
          "product-card w-full flex flex-col h-full",
          "group-hover:border-cream-300/80"
        )}
        aria-label={product.name}
        style={{
          // CRITICAL FIX: Ensure proper height to prevent collapse
          minHeight: 0, // Allow flex shrinking
          // Ensure visibility - prevent invisible but clickable bug
          opacity: 1,
          visibility: "visible",
          // Prevent stacking context issues
          isolation: "isolate"
        }}
      >
        {/* Image Container - Fixed aspect ratio prevents layout shift */}
        {/* CRITICAL FIX: Apply overflow: hidden here, not on parent card, and ensure proper isolation */}
        <div className="product-image relative aspect-square overflow-hidden flex-shrink-0" style={{ minHeight: 0, isolation: "isolate" }}>
          {/* Primary Image */}
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || `${product.name} - ${product.category.name}`}
            fill
            className={cn(
              "object-cover",
              // Design System: Animation timing (Tier 2)
              "transition-opacity duration-fast ease-in-out",
              isHovered && secondaryImage ? "opacity-0" : "opacity-100"
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 280px"
            loading={priority ? "eager" : "lazy"}
            quality={priority ? 90 : 75}
            fetchPriority={fetchPriority}
            // Performance: Add blur placeholder to prevent layout shift
            placeholder="blur"
            blurDataURL={getProductCardBlurPlaceholder()}
            // Performance: Decode images asynchronously
            decoding="async"
          />

          {/* Secondary Image (on hover) - Lazy load to prevent unnecessary preloads */}
          {secondaryImage && (
            <Image
              src={secondaryImage.url}
              alt={secondaryImage.alt || `${product.name} - alternate view - ${product.category.name}`}
              fill
              className={cn(
                "object-cover",
                // Design System: Animation timing (Tier 2)
                "transition-opacity duration-fast ease-in-out",
                isHovered ? "opacity-100" : "opacity-0"
              )}
              sizes={PRODUCT_CARD_SIZES}
              // CRITICAL FIX: Lazy load secondary images - only load when needed (hover)
              // Preloading all secondary images causes "preloaded but not used" warnings
              loading="lazy"
              quality={85}
              fetchPriority="low"
              decoding="async"
              // Hidden but loaded to reserve space
              style={{ position: "absolute" }}
            />
          )}

          {/* Badges (Design System: Top-left, 12px offset, 8px gap) */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {isNew && (
              <span
                className={cn(
                  "inline-flex items-center",
                  // Design System: 6px 12px padding, 24px height, 12px border radius
                  "px-3 py-1.5 h-6",
                  "bg-charcoal-900 text-cream-50",
                  "rounded-full",
                  // Typography (Design System: Inter, 11px, Semibold, Uppercase, 1px letter-spacing)
                  "font-sans text-[11px] font-semibold uppercase tracking-widest"
                )}
              >
                NEW
              </span>
            )}
            {isOnSale && (
              <span
                className={cn(
                  "inline-flex items-center",
                  // Design System: 6px 12px padding, 24px height, 12px border radius
                  "px-3 py-1.5 h-6",
                  "bg-navy-900 text-cream-50",
                  "rounded-full",
                  // Typography (Design System: Inter, 11px, Semibold, Uppercase, 1px letter-spacing)
                  "font-sans text-[11px] font-semibold uppercase tracking-widest"
                )}
              >
                SALE
              </span>
            )}
          </div>

          {/* Wishlist Icon (Design System: Top-right, 12px offset, 40×40px) */}
          <div className="absolute top-3 right-3 z-10">
            <WishlistButton product={product} size="md" />
          </div>

          {/* Out of Stock Overlay (Design System: Cream 50, 90% opacity) */}
          {!product.inStock && (
            <div className="absolute inset-0 z-[5] flex items-center justify-center bg-cream-50/90">
              <span
                className={cn(
                  // Typography (Design System: Playfair Display, 18px, Medium, Uppercase, 1px letter-spacing)
                  "font-serif text-lg font-medium text-charcoal-600 uppercase tracking-wide"
                )}
              >
                Out of Stock
              </span>
            </div>
          )}

          {/* Quick Add to Cart Button - Desktop hover overlay */}
          {product.inStock && (
            <div className="product-actions hidden lg:block">
              <m.button
                onClick={handleQuickAdd}
                className={cn(
                  "btn w-full flex items-center justify-center gap-2",
                  "h-12 min-h-[48px] px-4 py-3",
                  "bg-navy-900 text-cream-50 rounded-lg",
                  "font-sans text-sm font-semibold uppercase tracking-wide",
                  "hover:bg-navy-800 shadow-navy",
                  "focus:outline-none focus:ring-2 focus:ring-cream-50 focus:ring-offset-2"
                )}
                aria-label={`Quick add ${product.name} to cart`}
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                <span>Add to Cart</span>
              </m.button>
            </div>
          )}
        </div>

        {/* Quick Add to Cart Button - Mobile: Always visible below image */}
        {product.inStock && (
          <div className="px-[var(--space-5)] pb-[var(--space-3)] lg:hidden">
            <m.button
              onClick={handleQuickAdd}
              className={cn(
                "w-full flex items-center justify-center gap-2",
                "h-11 min-h-[44px] px-4 py-2.5",
                "bg-navy-900 text-cream-50 rounded-lg",
                "font-sans text-sm font-semibold uppercase tracking-wide",
                "hover:bg-navy-800 active:bg-navy-700",
                "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
                "transition-colors duration-200",
                "touch-manipulation"
              )}
              aria-label={`Quick add ${product.name} to cart`}
            >
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
              <span>Add to Cart</span>
            </m.button>
          </div>
        )}

        {/* Product Info - Using spacing scale - Flex grow to fill space for equal heights */}
        <div className="p-[var(--space-5)] space-y-[var(--space-3)] flex-grow flex flex-col justify-between">
          {/* Product Name */}
          <h3 className="product-title line-clamp-2">
            {product.name}
          </h3>

          {/* Price Section */}
          <div className="flex items-baseline gap-[var(--space-2)]">
            {/* Current Price */}
            <span className="product-price">
              {formatPrice(product.price)}
            </span>
            {/* Original Price */}
            {isOnSale && product.originalPrice && (
              <span className="font-sans text-sm font-normal text-charcoal-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Category Label (Design System: Inter, 11px, Medium, Uppercase, 1px letter-spacing, Charcoal 600) */}
          <p className="font-sans text-[11px] font-medium text-charcoal-600 uppercase tracking-widest">
            {product.category.name}
          </p>

          {/* Size Guide (Design System: Tier 2 - Reduce hesitation) */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="pt-[var(--space-2)] border-t border-cream-200">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs text-charcoal-600">Available Sizes:</span>
                <div className="flex items-center gap-[var(--space-2)] flex-wrap">
                  {product.sizes.slice(0, 4).map((sizeItem) => (
                    <span
                      key={sizeItem.size}
                      className={cn(
                        "font-sans text-[10px] font-medium px-1.5 py-0.5 rounded",
                        sizeItem.inStock
                          ? "bg-cream-100 text-charcoal-700 border border-cream-300"
                          : "bg-cream-50 text-charcoal-400 border border-cream-200 line-through"
                      )}
                      aria-label={sizeItem.inStock ? `Size ${sizeItem.size} available` : `Size ${sizeItem.size} out of stock`}
                    >
                      {sizeItem.size}
                    </span>
                  ))}
                  {product.sizes.length > 4 && (
                    <span className="font-sans text-[10px] text-charcoal-500">
                      +{product.sizes.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </m.article>
    </Link>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memoization
  return prevProps.product.id === nextProps.product.id &&
         prevProps.product.price === nextProps.product.price &&
         prevProps.product.inStock === nextProps.product.inStock &&
         prevProps.className === nextProps.className;
});

