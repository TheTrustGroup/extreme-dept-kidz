"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import type { Product, ProductImage } from "@/types";
import { cn, formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

/**
 * ProductCard Component
 * 
 * Luxury product card with hover effects and quick view.
 * Displays product image, name, and price with smooth transitions.
 */
export function ProductCard({ product, className }: ProductCardProps): JSX.Element {
  const [isHovered, setIsHovered] = React.useState(false);

  // Get primary image
  const primaryImage = product.images.find((img) => (img as ProductImage).isPrimary) || product.images[0];
  const secondaryImage = product.images[1];

  // Check if product is on sale
  const isOnSale = product.originalPrice && product.originalPrice > product.price;

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
      <motion.article
        className="relative overflow-hidden rounded-lg bg-cream-50"
        whileHover={{ scale: 1.02, y: -4 }}
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

          {/* Quick View Overlay */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-charcoal-900/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            aria-hidden="true"
          >
            <motion.div
              className="flex items-center gap-2 px-4 py-2 bg-cream-50 text-charcoal-900 rounded-full font-sans text-sm font-medium"
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: isHovered ? 0 : 8, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut", delay: 0.1 }}
            >
              <Eye className="w-4 h-4" />
              <span>Quick View</span>
            </motion.div>
          </motion.div>

          {/* Sale Badge */}
          {isOnSale && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-navy-900 text-cream-50 text-xs font-semibold uppercase tracking-wide">
                Sale
              </span>
            </div>
          )}

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
          <motion.h3
            className="font-serif text-base md:text-lg font-medium text-charcoal-900 line-clamp-2"
            whileHover={{ color: "#102a43" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {product.name}
          </motion.h3>

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
      </motion.article>
    </Link>
  );
}

