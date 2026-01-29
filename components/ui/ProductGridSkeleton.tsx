"use client";

import * as React from "react";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";

interface ProductGridSkeletonProps {
  /** Number of skeleton cards to show */
  count?: number;
  /** Number of columns (responsive) */
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  /** Custom className */
  className?: string;
}

/**
 * ProductGridSkeleton Component
 * 
 * Skeleton loader for product grids with shimmer animation.
 * Matches ProductCard layout for seamless loading experience.
 */
export function ProductGridSkeleton({
  count = 4,
  columns = { mobile: 2, tablet: 3, desktop: 4 },
  className,
}: ProductGridSkeletonProps): JSX.Element {
  const { theme } = useTheme();

  // Map columns to Tailwind classes - use string literal types for proper typing
  const getGridCols = (cols: number): string => {
    const gridMap: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    };
    return gridMap[cols] || "grid-cols-2";
  };

  const mobileCols = getGridCols(columns.mobile || 2);
  const tabletCols = getGridCols(columns.tablet || 3);
  const desktopCols = getGridCols(columns.desktop || 4);

  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-6",
        mobileCols,
        `md:${tabletCols}`,
        `lg:${desktopCols}`,
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} theme={theme} />
      ))}
    </div>
  );
}

/**
 * Individual Product Card Skeleton
 */
function ProductCardSkeleton({ theme }: { theme: "light" | "dark" }): JSX.Element {
  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden border transition-colors duration-300",
        theme === "dark"
          ? "bg-dark-surface border-dark-border-glass"
          : "bg-cream-50 border-cream-200"
      )}
    >
      {/* Image Skeleton */}
      <Skeleton
        variant="rounded"
        className={cn(
          "w-full aspect-square",
          theme === "dark" ? "bg-dark-bg-secondary" : "bg-cream-200"
        )}
      />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <Skeleton
          variant="rounded"
          className={cn(
            "h-5 w-3/4",
            theme === "dark" ? "bg-dark-bg-secondary" : "bg-cream-200"
          )}
        />

        {/* Category */}
        <Skeleton
          variant="rounded"
          className={cn(
            "h-4 w-1/2",
            theme === "dark" ? "bg-dark-bg-secondary" : "bg-cream-200"
          )}
        />

        {/* Price */}
        <Skeleton
          variant="rounded"
          className={cn(
            "h-6 w-1/3 mt-4",
            theme === "dark" ? "bg-dark-bg-secondary" : "bg-cream-200"
          )}
        />
      </div>
    </div>
  );
}
