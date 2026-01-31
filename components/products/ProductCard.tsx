"use client";

import * as React from "react";
import Link from "next/link";
import type { Product, ProductImage } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useTheme } from "@/components/providers/ThemeProvider";
import { WishlistButton } from "@/components/WishlistButton";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
  fetchPriority?: "auto" | "high" | "low";
}

/**
 * ProductCard — Polo Ralph Lauren–style: clean image, vertical info stack, wishlist on right.
 * Structure: product-card > image-wrap (image only) > info (name + wishlist | category | price).
 * No overlays on image except out-of-stock. Tap card = PDP.
 */
export const ProductCard = React.memo(function ProductCard({
  product,
  className,
  priority = false,
  fetchPriority = "low",
}: ProductCardProps): JSX.Element {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);

  const primaryImage =
    product.images?.find((img) => (img as ProductImage).isPrimary) ||
    product.images?.[0];
  const secondaryImage = product.images?.[1];

  if (!primaryImage?.url) {
    console.warn(`Product ${product.id} has no valid image`);
  }

  const isOnSale =
    product.originalPrice != null && product.originalPrice > product.price;
  const isNew =
    product.tags?.includes("new") ||
    (product.createdAt
      ? new Date(product.createdAt).getTime() >
        Date.now() - 30 * 24 * 60 * 60 * 1000
      : false);

  const hasValidSlug = Boolean(product?.slug && String(product.slug).trim());
  const productHref = hasValidSlug ? `/products/${product.slug}` : "#";

  const handleWishlistClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const cardContent = (
    <>
      {/* Image only — no badges, no quick view, no wishlist overlay (Polo-style) */}
      <div className="product-card-image-wrap relative w-full overflow-hidden rounded-t-xl bg-cream-100 dark:bg-dark-surface">
        <div className="relative w-full" style={{ aspectRatio: "4 / 5" }}>
          {primaryImage?.url ? (
            <OptimizedImage
              src={primaryImage.url}
              alt={primaryImage.alt || `${product.name} - ${product.category?.name ?? "Product"}`}
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

          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <span className="font-sans text-sm font-medium uppercase tracking-wide text-white">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Info block — Polo: name + wishlist right | category (small) | price */}
      <div className="product-card-info flex flex-col gap-1 pt-3 pb-1">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              "product-card-title font-sans text-sm sm:text-base font-medium leading-snug line-clamp-2 flex-1 min-w-0",
              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
            )}
          >
            {product.name}
          </h3>
          <div
            onClick={handleWishlistClick}
            role="presentation"
            className="flex-shrink-0 mt-0.5"
          >
            <WishlistButton product={product} size="lg" />
          </div>
        </div>
        <p
          className={cn(
            "text-xs font-normal",
            theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-500"
          )}
        >
          {product.category?.name ?? "Product"}
          {isNew && " · New"}
          {isOnSale && " · Sale"}
        </p>
        <p
          className={cn(
            "product-card-price font-sans text-sm sm:text-base font-semibold mt-0.5",
            theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
          )}
        >
          {formatPrice(product.price)}
          {isOnSale && product.originalPrice != null && (
            <span
              className={cn(
                "ml-2 font-normal text-xs line-through",
                theme === "dark" ? "text-dark-text-muted" : "text-charcoal-500"
              )}
            >
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </p>
      </div>
    </>
  );

  return (
    <>
      <div
        className={cn("product-card w-full flex flex-col", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {hasValidSlug ? (
          <Link
            href={productHref}
            className="block w-full focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 rounded-xl"
            aria-label={`View ${product.name} - ${formatPrice(product.price)}`}
          >
            {cardContent}
          </Link>
        ) : (
          <div
            className="block w-full rounded-xl cursor-default"
            aria-label={`${product.name} - ${formatPrice(product.price)} (unavailable)`}
          >
            {cardContent}
          </div>
        )}
      </div>
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
