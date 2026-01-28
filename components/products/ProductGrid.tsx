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
 * Includes hydration protection to prevent React hydration mismatches.
 */
export function ProductGrid({
  products,
  columns = 4,
  isLoading = false,
  className,
}: ProductGridProps): JSX.Element | null {
  const [mounted, setMounted] = React.useState(false);

  // Fix hydration by only rendering on client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR, return nothing to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

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
        className
      )}
      style={{
        // Performance: Prevent layout shift
        contain: "layout style paint",
      }}
    >
      {isLoading ? (
        // Loading state - show skeleton cards with proper dimensions to prevent layout shift
        Array.from({ length: columns * 2 }).map((_, index) => (
          <SkeletonCard key={`skeleton-${index}`} />
        ))
      ) : (
        // Product cards with stagger animation
        products.map((product, index) => {
          // Performance: First 4 cards are above fold - prioritize loading
          const isAboveFold = index < 4;
          
          return (
            <m.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              // Prevent layout shift by maintaining consistent structure
              className="w-full h-full flex"
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

