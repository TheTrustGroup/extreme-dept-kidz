"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product, ProductImage } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/stores/cart-store";
import { WishlistButton } from "@/components/WishlistButton";

interface ProductCardProps {
  product: Product;
  className?: string;
}

/**
 * ProductCard Component
 * 
 * Luxury product card with hover effects and quick view.
 * Displays product image, name, and price with smooth transitions.
 * Optimized with React.memo for performance.
 */
export const ProductCard = React.memo(function ProductCard({ product, className }: ProductCardProps): JSX.Element {
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
        "group block focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 rounded-lg",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`View ${product.name} - ${formatPrice(product.price)}`}
    >
      <m.article
        className="relative overflow-hidden rounded-lg bg-cream-50 shadow-sm group-hover:shadow-xl transition-shadow duration-300"
        whileHover={{ scale: 1.02, y: -8 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        aria-label={product.name}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-cream-100">
          {/* Primary Image */}
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            fill
            className={cn(
              "object-cover transition-opacity duration-200",
              isHovered && secondaryImage ? "opacity-0" : "opacity-100"
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            quality={85}
          />

          {/* Secondary Image (on hover) */}
          {secondaryImage && (
            <Image
              src={secondaryImage.url}
              alt={secondaryImage.alt || `${product.name} - alternate view`}
              fill
              className={cn(
                "object-cover transition-opacity duration-200",
                isHovered ? "opacity-100" : "opacity-0"
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              quality={85}
            />
          )}

          {/* Quick Add to Cart Button (Bottom) */}
          {product.inStock && (
            <m.div
              className="absolute bottom-0 left-0 right-0 z-10 p-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <m.button
                onClick={handleQuickAdd}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-navy-900 text-cream-50 rounded-lg font-sans text-sm font-semibold uppercase tracking-wide hover:bg-navy-800 transition-colors duration-200 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label={`Quick add ${product.name} to cart`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </m.button>
            </m.div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {isNew && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-charcoal-900 text-cream-50 text-xs font-semibold uppercase tracking-wide">
                NEW
              </span>
            )}
            {isOnSale && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-navy-900 text-cream-50 text-xs font-semibold uppercase tracking-wide">
                Sale
              </span>
            )}
          </div>

          {/* Wishlist Icon */}
          <div className="absolute top-3 right-3 z-10">
            <WishlistButton product={product} size="md" />
          </div>

          {/* Out of Stock Overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-cream-50/90">
              <span className="font-serif text-lg font-medium text-charcoal-600 uppercase tracking-wide">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-2">
          {/* Product Name */}
          <m.h3
            className="font-serif text-base md:text-lg font-medium text-charcoal-900 line-clamp-2"
            whileHover={{ color: "#102a43" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {product.name}
          </m.h3>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-lg md:text-xl font-semibold text-charcoal-900">
              {formatPrice(product.price)}
            </span>
            {isOnSale && product.originalPrice && (
              <span className="font-sans text-sm text-charcoal-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Category (optional, subtle) */}
          <p className="font-sans text-xs text-charcoal-500 uppercase tracking-wider">
            {product.category.name}
          </p>
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

