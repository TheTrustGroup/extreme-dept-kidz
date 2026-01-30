"use client";

import * as React from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
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
 * ProductCard — Phase 5: Strict vertical stacking, zero overlap.
 * Structure: product-card > image-wrap (image + Quick View) > info (name, price).
 * No absolute elements outside image-wrap. No z-index stacking. Responsive.
 */
export const ProductCard = React.memo(function ProductCard({
  product,
  className,
  priority = false,
  fetchPriority = "low",
}: ProductCardProps): JSX.Element {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = React.useState(false);

  const primaryImage =
    product.images?.find((img) => (img as ProductImage).isPrimary) ||
    product.images?.[0];
  const secondaryImage = product.images?.[1];

  if (!primaryImage?.url) {
    console.warn(`Product ${product.id} has no valid image`);
  }

  const isOnSale =
    product.originalPrice && product.originalPrice > product.price;
  const isNew =
    product.tags?.includes("new") ||
    (product.createdAt
      ? new Date(product.createdAt).getTime() >
        Date.now() - 30 * 24 * 60 * 60 * 1000
      : false);

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
        className={cn("product-card w-full flex flex-col", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link
          href={`/products/${product.slug}`}
          className="block w-full focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 rounded-xl"
          aria-label={`View ${product.name} - ${formatPrice(product.price)}`}
        >
          {/* Image wrap: image + overlays only (badges, wishlist, quick view, out of stock) */}
          <div className="product-card-image-wrap relative w-full overflow-hidden rounded-t-xl bg-cream-100">
            <div className="relative w-full" style={{ aspectRatio: "4 / 5" }}>
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
                    "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                    isHovered && secondaryImage ? "opacity-0" : "opacity-100"
                  )}
                  fill
                />
              ) : (
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center text-sm",
                    theme === "dark" ? "text-dark-text-muted" : "text-charcoal-400"
                  )}
                >
                  No Image
                </div>
              )}

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
                    "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                    isHovered ? "opacity-100" : "opacity-0"
                  )}
                  fill
                />
              )}

              {/* Badges — inside image-wrap only */}
              <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                {isNew && (
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                      "bg-charcoal-900 text-cream-50"
                    )}
                  >
                    New
                  </span>
                )}
                {isOnSale && (
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                      "bg-navy-900 text-cream-50"
                    )}
                  >
                    Sale
                  </span>
                )}
              </div>

              {/* Wishlist — inside image-wrap only */}
              <div
                className="absolute top-2 right-2"
                onClick={handleWishlistClick}
                role="presentation"
              >
                <WishlistButton product={product} size="lg" />
              </div>

              {/* Quick View — inside image-wrap only, over image */}
              {product.inStock && (
                <div className="absolute bottom-2 left-2 right-2 flex justify-center">
                  <button
                    type="button"
                    onClick={handleQuickViewClick}
                    className={cn(
                      "flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] w-full max-w-[180px] touch-target-min",
                      "px-4 py-2.5 rounded-lg",
                      "bg-navy-900 text-cream-50",
                      "text-sm font-semibold uppercase tracking-wide",
                      "hover:bg-navy-800 transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
                      "shadow-md"
                    )}
                    aria-label={`Quick view ${product.name}`}
                  >
                    <Eye className="w-4 h-4 shrink-0" aria-hidden />
                    <span>Quick View</span>
                  </button>
                </div>
              )}

              {/* Out of stock — inside image-wrap only */}
              {!product.inStock && (
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
                  )}
                >
                  <span
                    className={cn(
                      "font-serif text-sm font-medium uppercase tracking-wide text-white"
                    )}
                  >
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info — World-class kids brand: category → name → price, clear hierarchy */}
          <div className="product-card-info flex flex-col gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-b-xl bg-cream-50 border border-t-0 border-cream-200/80 dark:bg-dark-surface dark:border-dark-border-glass">
            <p
              className={cn(
                "text-[10px] sm:text-[11px] font-medium uppercase tracking-widest",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
              )}
            >
              {product.category?.name ?? "Product"}
              {product.tags?.includes("new") && " · New"}
            </p>
            <h3
              className={cn(
                "product-card-title font-serif text-sm sm:text-base font-semibold line-clamp-2 leading-snug",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}
            >
              {product.name}
            </h3>
            <p
              className={cn(
                "product-card-price font-serif text-base sm:text-lg font-semibold mt-0.5",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}
            >
              {formatPrice(product.price)}
              {isOnSale && product.originalPrice && (
                <span
                  className={cn(
                    "ml-2 font-sans text-sm font-normal line-through",
                    theme === "dark" ? "text-dark-text-muted" : "text-charcoal-500"
                  )}
                >
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </p>
          </div>
        </Link>
      </div>

      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.inStock === nextProps.product.inStock &&
    prevProps.className === nextProps.className
  );
});
