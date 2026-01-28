"use client";

import * as React from "react";
import { m } from "framer-motion";
import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
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

  // Grid column classes based on columns prop
  // SSR-safe: Deterministic classes that match on server and client
  // Mobile (375px+): 1 column
  // Small mobile (428px+): 1 column
  // Tablet (768px+): 2 columns
  // Large tablet (1024px+): 3 columns
  // Desktop (1280px+): 4 columns
  // Large desktop (1920px+): 4-6 columns
  const getGridCols = (cols: number): string => {
    const gridMap: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
      6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6",
    };
    return gridMap[cols] || gridMap[4];
  };

  return (
    <div
      className={cn(
        "grid",
        getGridCols(columns),
        // Consistent spacing using 8px base scale
        "gap-[var(--space-5)]", // 20px mobile
        "sm:gap-[var(--space-6)]", // 24px small
        "md:gap-[var(--space-6)]", // 24px tablet
        "lg:gap-[var(--space-7)]", // 32px desktop
        "xl:gap-[var(--space-8)]", // 40px large desktop
        // Performance: Grid optimization
        "items-stretch",
        // CRITICAL FIX: Ensure grid has proper layout flow
        "auto-rows-max",
        className
      )}
      style={{
        // Performance: Prevent layout shift
        contain: "layout style paint",
        // CRITICAL FIX: Ensure grid container has proper height
        minHeight: 0,
        // Prevent stacking context issues
        isolation: "isolate"
      }}
    >
      {isLoading || products.length === 0 ? (
        // Loading state - show skeleton cards with proper dimensions to prevent layout shift
        // SSR-safe: Same skeleton count on server and client
        Array.from({ length: columns * 2 }).map((_, index) => (
          <SkeletonCard key={`skeleton-${index}`} />
        ))
      ) : (
        // Product cards with stagger animation
        // SSR-safe: Deterministic rendering order based on products array
        // CRITICAL FIX: Products start visible (opacity: 1) to prevent invisible but clickable bug
        // Animation only applies subtle fade-in for above-fold items, below-fold are instant
        products.map((product, index) => {
          // CRITICAL FIX: Only first 1-2 items should have priority (LCP element only)
          // Too many priority images cause "preloaded but not used" warnings
          // Most viewports show 1-2 products above fold, so prioritize only those
          const isAboveFold = index < 2; // Reduced from 4 to 2
          
          return (
            <m.div
              key={product.id}
              // CRITICAL FIX: Start with opacity: 1 to prevent invisible products
              // Only animate if above fold, otherwise instant render
              initial={isAboveFold ? { opacity: 0.8, y: 10 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: isAboveFold ? 0.2 : 0, 
                delay: isAboveFold ? index * 0.02 : 0,
                ease: "easeOut"
              }}
              // Prevent layout shift by maintaining consistent structure
              className="w-full h-full flex"
              style={{
                // Ensure products are always visible, even during animation
                minHeight: 0,
                // Prevent stacking context issues
                isolation: "isolate"
              }}
            >
              <ProductCard 
                product={product} 
                priority={isAboveFold}
                fetchPriority={isAboveFold ? "auto" : "low"}
                className="w-full h-full flex flex-col"
              />
            </m.div>
          );
        })
      )}
    </div>
  );
}

