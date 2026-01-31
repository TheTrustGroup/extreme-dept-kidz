"use client";

import * as React from "react";
import Link from "next/link";
import type { Product, ProductImage, ProductSize } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useTheme } from "@/components/providers/ThemeProvider";
import { WishlistButton } from "@/components/WishlistButton";
import { ALL_PRODUCT_SIZES } from "@/lib/constants/product-sizes";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
  fetchPriority?: "auto" | "high" | "low";
}

/** Polo-style size range: "8-12", "2T-8", or "8-20" from product sizes. */
function formatSizeRange(sizes: ProductSize[]): string {
  if (!sizes?.length) return "";
  const order = ALL_PRODUCT_SIZES as unknown as string[];
  const sizeStrings = sizes.map((s) => s.size);
  const inOrder = sizeStrings.filter((size) => order.includes(size));
  const sorted =
    inOrder.length > 0
      ? [...inOrder].sort((a, b) => order.indexOf(a) - order.indexOf(b))
      : [...sizeStrings].sort((a, b) => {
          const na = parseInt(a, 10);
          const nb = parseInt(b, 10);
          if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
          return String(a).localeCompare(String(b));
        });
  if (sorted.length === 0) return "";
  if (sorted.length === 1) return sorted[0];
  return `${sorted[0]}-${sorted[sorted.length - 1]}`;
}

/** Polo-style subtitle: "Boys Sizes 8-12" or "Girls Sizes 4-10" (category + Sizes + range). */
function productCardSubtitle(product: Product): string {
  const categoryName = product.category?.name ?? "";
  const sizeRange = formatSizeRange(Array.isArray(product.sizes) ? product.sizes : []);
  if (!sizeRange) return categoryName || "Product";
  return `${categoryName} Sizes ${sizeRange}`.trim();
}

/**
 * ProductCard — Polo Ralph Lauren–style: clean image, vertical info stack, wishlist on right.
 * Under card: product name, then "Boys/Girls" + size range (e.g. "Boys 8-12"), then price. Tap card = PDP.
 */
export const ProductCard = React.memo(function ProductCard({
  product,
  className,
  priority = false,
  fetchPriority: _fetchPriority = "low",
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

  // CRITICAL: Use /products/{slug} (not /product/{id}) — matches app/products/[slug] route and Boys section
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

      {/* Info block — Polo: name + wishlist right | category (small) | price; contained, no bleed */}
      <div className="product-card-info flex flex-col gap-1 pt-2 sm:pt-3 pb-2 sm:pb-1 px-2 sm:px-0 min-w-0 overflow-hidden bg-white dark:bg-dark-surface rounded-b-xl">
        <div className="flex items-start justify-between gap-1.5 min-w-0">
          <h3
            className={cn(
              "product-card-title font-sans text-xs sm:text-base font-medium leading-snug line-clamp-2 flex-1 min-w-0 break-words",
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
            "text-[11px] sm:text-xs font-normal truncate",
            theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-500"
          )}
          title={productCardSubtitle(product)}
        >
          {productCardSubtitle(product)}
          {isNew && " · New"}
          {isOnSale && " · Sale"}
        </p>
        <p
          className={cn(
            "product-card-price font-sans text-xs sm:text-base font-semibold mt-0.5 truncate",
            theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
          )}
          title={formatPrice(product.price)}
        >
          {formatPrice(product.price)}
          {isOnSale && product.originalPrice != null && (
            <span
              className={cn(
                "ml-1.5 sm:ml-2 font-normal text-[10px] sm:text-xs line-through",
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
    <div
      className={cn(
        "product-card w-full flex flex-col rounded-xl overflow-hidden isolate",
        "bg-white dark:bg-dark-surface",
        "shadow-sm md:shadow-none",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {hasValidSlug ? (
        <Link
          href={productHref}
          className="block w-full min-w-0 overflow-hidden focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 rounded-xl"
          aria-label={`View ${product.name} - ${formatPrice(product.price)}`}
        >
          {cardContent}
        </Link>
      ) : (
        <div
          className="block w-full min-w-0 overflow-hidden rounded-xl cursor-default"
          aria-label={`${product.name} - ${formatPrice(product.price)} (unavailable)`}
        >
          {cardContent}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.inStock === nextProps.product.inStock &&
    prevProps.className === nextProps.className
  );
});
