"use client";

import * as React from "react";
import { m } from "framer-motion";
import type { Product } from "@/types";
import { LuxuryProductCard } from "./LuxuryProductCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { cn } from "@/lib/utils";
import { H3, Body } from "@/components/ui/typography";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  columns?: number;
  isLoading?: boolean;
  className?: string;
  onAddToCart?: (productId: string, variantId: string) => void;
}

/** Map Product (catalog type) to the shape LuxuryProductCard expects. */
function toLuxuryCardProduct(product: Product): Parameters<typeof LuxuryProductCard>[0]["product"] {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    images: (product.images ?? []).map((img) => ({ url: img.url, alt: img.alt })),
    variants: [
      {
        id: product.id,
        price: product.price,
        stock: product.inStock ? 999 : 0,
      },
    ],
  };
}

/**
 * ProductGrid Component
 *
 * Responsive grid layout for displaying products.
 * Supports loading states and empty states.
 * SSR-safe: Renders consistent skeleton during SSR to prevent hydration mismatches.
 */
export function ProductGrid({
  products,
  columns = 4,
  isLoading = false,
  className,
  onAddToCart,
}: ProductGridProps): JSX.Element {
  // Safety checks
  if (!products || !Array.isArray(products)) {
    return (
      <div className="py-16 text-center">
        <H3 className="text-charcoal-900 mb-4">Invalid product data</H3>
        <Body className="text-charcoal-600 max-w-md mx-auto">
          Please refresh the page or try again later.
        </Body>
      </div>
    );
  }

  // Empty state
  if (!isLoading && products.length === 0) {
    return (
      <div className="py-16 text-center">
        <H3 className="text-charcoal-900 mb-4">No Items Match Your Selection</H3>
        <Body className="text-charcoal-600 max-w-md mx-auto">
          Refine your filters to discover more pieces, or explore our complete collection of premium designs.
        </Body>
      </div>
    );
  }

  // Responsive grid: Mobile 1, Tablet 2, Desktop 3–4
  const gridCols =
    columns <= 1
      ? "grid-cols-1"
      : columns <= 2
        ? "grid-cols-1 md:grid-cols-2"
        : columns <= 3
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <m.div
      className={cn("w-full", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Filter / Sort bar (UI only, logic later) */}
      <div
        className={cn(
          "mb-6 flex flex-wrap items-center justify-between gap-3",
          "rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm",
          "border-luxury-navy-200/20 bg-luxury-cream-100/80"
        )}
      >
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 rounded-none border border-luxury-navy-200/40 bg-transparent px-4 py-2",
            "text-sm font-medium uppercase tracking-[0.2em] text-luxury-navy-700",
            "hover:border-luxury-gold hover:text-luxury-gold transition-colors duration-200"
          )}
          aria-label="Filter products"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Filter
        </button>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 rounded-none border border-luxury-navy-200/40 bg-transparent px-4 py-2",
            "text-sm font-medium uppercase tracking-[0.2em] text-luxury-navy-700",
            "hover:border-luxury-gold hover:text-luxury-gold transition-colors duration-200"
          )}
          aria-label="Sort products"
        >
          <ArrowUpDown className="h-4 w-4" aria-hidden />
          Sort
        </button>
      </div>

      {isLoading ? (
        <div
          className={cn(
            "grid gap-4 sm:gap-5 md:gap-6",
            gridCols,
            "items-stretch auto-rows-max"
          )}
          style={{ contain: "layout style paint", minHeight: "280px", isolation: "isolate" }}
        >
          {Array.from({ length: columns * 2 }).map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="col-span-full py-16 text-center">
          <H3 className="text-charcoal-900 dark:text-dark-text-primary mb-4">
            No Items Match Your Selection
          </H3>
          <Body className="text-charcoal-600 dark:text-dark-text-secondary max-w-md mx-auto">
            Refine your filters to discover more pieces, or explore our complete collection of premium designs.
          </Body>
        </div>
      ) : (
        <m.div
          className={cn(
            "grid gap-4 sm:gap-5 md:gap-6",
            gridCols,
            "items-stretch auto-rows-max"
          )}
          style={{
            contain: "layout style paint",
            minHeight: "280px",
            isolation: "isolate",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          {products.map((product, index) => {
            const isAboveFold = index < 2;
            const luxuryProduct = toLuxuryCardProduct(product);

            return (
              <m.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: isAboveFold ? 0.4 : 0.5,
                  delay: isAboveFold ? index * 0.05 : index * 0.03,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="w-full min-w-0 flex"
                style={{
                  opacity: 1,
                  visibility: "visible",
                  minHeight: "280px",
                  height: "auto",
                  isolation: "isolate",
                  pointerEvents: "auto",
                }}
              >
                <LuxuryProductCard
                  product={luxuryProduct}
                  onAddToCart={onAddToCart}
                />
              </m.div>
            );
          })}
        </m.div>
      )}
    </m.div>
  );
}
