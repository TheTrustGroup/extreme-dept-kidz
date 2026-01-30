"use client";

import * as React from "react";
import { m } from "framer-motion";
import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { ProductGridSkeleton } from "@/components/ui/ProductGridSkeleton";
import { cn } from "@/lib/utils";
import { H3, Body } from "@/components/ui/typography";

interface ProductGridProps {
  products: Product[];
  columns?: number;
  isLoading?: boolean;
  className?: string;
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

  // MOBILE-FIRST LAYOUT FIX: Consistent breakpoints
  // Mobile (375px+): 1 column
  // Tablet (768px+): 2 columns
  // Desktop (1024px+): 3 columns
  // Large Desktop (1280px+): 4 columns
  // Extra Large (1536px+): 5-6 columns
  // PHASE 7 — Mobile-first: 2-col grid on mobile
  const getGridCols = (cols: number): string => {
    const gridMap: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      5: "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
      6: "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6",
    };
    return gridMap[cols] || gridMap[4];
  };

  return (
    <div
      className={cn(
        "grid",
        getGridCols(columns),
        // Consistent spacing using 8px base scale
        "gap-2 sm:gap-3 md:gap-[var(--space-4)] lg:gap-[var(--space-6)]", // tight on mobile for 2-col
        // Performance: Grid optimization
        "items-stretch",
        // CRITICAL FIX: Ensure grid has proper layout flow
        "auto-rows-max",
        className
      )}
      style={{
        contain: "layout style paint",
        minHeight: "280px", // Lower on mobile 2-col so cards fit
        isolation: "isolate"
      }}
    >
      {isLoading ? (
        // Loading state - show skeleton cards with proper dimensions to prevent layout shift
        // SSR-safe: Same skeleton count on server and client
        Array.from({ length: columns * 2 }).map((_, index) => (
          <SkeletonCard key={`skeleton-${index}`} />
        ))
      ) : products.length === 0 ? (
        // Empty state
        <div className="col-span-full py-16 text-center">
          <H3 className="text-charcoal-900 dark:text-dark-text-primary mb-4">No Items Match Your Selection</H3>
          <Body className="text-charcoal-600 dark:text-dark-text-secondary max-w-md mx-auto">
            Refine your filters to discover more pieces, or explore our complete collection of premium designs.
          </Body>
        </div>
      ) : (
        // Product cards with stagger animation
        // SSR-safe: Deterministic rendering order based on products array
        // CRITICAL: Products start visible (opacity: 1) to prevent invisible but clickable bug
        // Animation only applies subtle fade-in for above-fold items, below-fold are instant
        products.map((product, index) => {
          // CRITICAL: Only first 1-2 items should have priority (LCP element only)
          // Too many priority images cause "preloaded but not used" warnings
          // Most viewports show 1-2 products above fold, so prioritize only those
          const isAboveFold = index < 2; // LCP-only priority
          
          return (
            <m.div
              key={product.id}
              // CRITICAL: Start with opacity: 1 to prevent invisible products
              // Only animate if above fold, otherwise instant render
              initial={isAboveFold ? { opacity: 0.8, y: 10 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: isAboveFold ? 0.2 : 0, 
                delay: isAboveFold ? index * 0.02 : 0,
                ease: "easeOut"
              }}
              // MOBILE-FIRST LAYOUT FIX: Prevent layout shift with min-height reservation
              className="w-full flex"
              style={{
                opacity: 1,
                visibility: "visible",
                minHeight: "280px",
                height: "auto",
                isolation: "isolate",
                pointerEvents: "auto"
              }}
            >
              <ProductCard 
                product={product} 
                priority={isAboveFold}
                fetchPriority={isAboveFold ? "auto" : "low"}
                className="w-full flex flex-col"
              />
            </m.div>
          );
        })
      )}
    </div>
  );
}

