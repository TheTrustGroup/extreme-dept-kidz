"use client";

import * as React from "react";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Eye, ShoppingBag } from "lucide-react";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    variants: Array<{
      id: string;
      price: number;
      stock: number;
    }>;
    images: Array<{
      url: string;
      alt?: string;
    }>;
  };
  onAddToCart?: (productId: string, variantId: string) => void;
}

function getDisplayPrice(variants: ProductCardProps["product"]["variants"]): number {
  if (!variants?.length) return 0;
  return Math.min(...variants.map((v) => v.price));
}

function getFirstInStockVariant(
  variants: ProductCardProps["product"]["variants"]
): ProductCardProps["product"]["variants"][0] | undefined {
  return variants?.find((v) => v.stock > 0) ?? variants?.[0];
}

/**
 * Luxury product card: glassmorphism on hover, image zoom, Playfair name, gold price,
 * quick view + add to cart. Mobile full-width tap; desktop hover effects.
 */
export function LuxuryProductCard({
  product,
  onAddToCart,
}: ProductCardProps): JSX.Element {
  const [isHovered, setIsHovered] = React.useState(false);

  const primaryImage = product.images?.[0];
  const price = getDisplayPrice(product.variants);
  const firstVariant = getFirstInStockVariant(product.variants);
  const inStock = product.variants?.some((v) => v.stock > 0) ?? false;
  const productHref = product?.slug ? `/products/${product.slug}` : "#";
  const hasValidSlug = Boolean(product?.slug?.trim());

  const handleAddToCart = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart && firstVariant) {
      onAddToCart(product.id, firstVariant.id);
    }
  };

  const handleQuickView = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    // UI only: parent can wire quick view modal later
  };

  const cardContent = (
    <>
      {/* Image with smooth zoom on hover */}
      <div className="relative w-full overflow-hidden bg-luxury-cream-200/50 aspect-[4/5]">
        {primaryImage?.url ? (
          <div
            className={cn(
              "absolute inset-0 transition-transform duration-500 ease-out origin-center",
              "md:group-hover/card:scale-105",
              isHovered && "scale-105"
            )}
          >
            <OptimizedImage
              src={primaryImage.url}
              alt={primaryImage.alt ?? product.name}
              variant="product-card"
              isLCP={false}
              useIntersectionObserver={true}
              enablePrefetch={hasValidSlug}
              quality={80}
              className="absolute inset-0 w-full h-full object-cover"
              fill
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-luxury-navy-400 text-sm">
            No Image
          </div>
        )}

        {/* Overlay: quick view + add to cart (visible on hover desktop, always tappable mobile) */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-2 p-3",
            "bg-black/0 transition-all duration-300",
            "md:group-hover/card:bg-black/40 md:group-hover/card:backdrop-blur-[2px]",
            (isHovered || !primaryImage?.url) && "bg-black/40 backdrop-blur-[2px]"
          )}
        >
          <div
            className={cn(
              "flex flex-col gap-2 w-full max-w-[200px]",
              "opacity-0 translate-y-2 transition-all duration-300",
              "md:group-hover/card:opacity-100 md:group-hover/card:translate-y-0",
              isHovered && "opacity-100 translate-y-0"
            )}
          >
            <button
              type="button"
              onClick={handleQuickView}
              className={cn(
                "flex items-center justify-center gap-2 w-full rounded-none border border-white/80 bg-white/10 px-4 py-2.5",
                "text-sm font-medium uppercase tracking-[0.2em] text-white",
                "hover:bg-white/20 hover:border-white transition-colors duration-200",
                "touch-target-min"
              )}
              aria-label={`Quick view ${product.name}`}
            >
              <Eye className="h-4 w-4" aria-hidden />
              Quick view
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock}
              className={cn(
                "flex items-center justify-center gap-2 w-full rounded-none border-2 border-luxury-gold bg-luxury-gold px-4 py-2.5",
                "text-sm font-medium uppercase tracking-[0.2em] text-luxury-navy-900",
                "hover:bg-luxury-gold/90 hover:border-luxury-gold/90 transition-colors duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:border-luxury-navy-400 disabled:bg-luxury-navy-400",
                "touch-target-min"
              )}
              aria-label={inStock ? `Add ${product.name} to cart` : `${product.name} out of stock`}
            >
              <ShoppingBag className="h-4 w-4" aria-hidden />
              Add to cart
            </button>
          </div>
        </div>

        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
            <span className="text-sm font-medium uppercase tracking-wider text-white">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info: name (Playfair) + price (gold) */}
      <div className="flex flex-col gap-1.5 pt-3 pb-2 px-1 min-w-0">
        <h3
          className={cn(
            "font-serif text-sm sm:text-base font-medium leading-snug line-clamp-2 text-luxury-navy-900",
            "group-hover/card:text-luxury-navy-800"
          )}
        >
          {product.name}
        </h3>
        <p
          className="text-base sm:text-lg font-semibold text-luxury-gold tabular-nums"
          title={formatPrice(price)}
        >
          {formatPrice(price)}
        </p>
        {/* Mobile: full-width add to cart (always visible); desktop has overlay */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className={cn(
            "md:hidden flex items-center justify-center gap-2 w-full rounded-none border-2 border-luxury-gold bg-luxury-gold py-2.5 mt-1",
            "text-sm font-medium uppercase tracking-[0.2em] text-luxury-navy-900",
            "hover:bg-luxury-gold/90 active:bg-luxury-gold/80 transition-colors duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:border-luxury-navy-400 disabled:bg-luxury-navy-400",
            "touch-target-min"
          )}
          aria-label={inStock ? `Add ${product.name} to cart` : `${product.name} out of stock`}
        >
          <ShoppingBag className="h-4 w-4" aria-hidden />
          Add to cart
        </button>
      </div>
    </>
  );

  return (
    <div
      className="group/card w-full flex flex-col rounded-lg overflow-hidden isolate"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "flex flex-col flex-1 min-w-0 rounded-lg overflow-hidden transition-all duration-300",
          "bg-white border border-transparent shadow-sm",
          "md:hover:shadow-glass md:hover:border-white/20 md:hover:backdrop-blur-md",
          "md:hover:bg-white/95"
        )}
      >
        {hasValidSlug ? (
          <Link
            href={productHref}
            className="block w-full min-w-0 overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold focus-visible:ring-offset-2"
            aria-label={`View ${product.name} - ${formatPrice(price)}`}
          >
            {cardContent}
          </Link>
        ) : (
          <div
            className="block w-full min-w-0 overflow-hidden rounded-lg cursor-default"
            aria-label={`${product.name} - ${formatPrice(price)} (unavailable)`}
          >
            {cardContent}
          </div>
        )}
      </div>
    </div>
  );
}
