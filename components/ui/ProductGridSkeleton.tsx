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
 * ProductGridSkeleton — Matches ProductCard layout (Polo-style: image 4:5, info name | slot, category, price).
 */
export function ProductGridSkeleton({
  count = 4,
  columns = { mobile: 2, tablet: 3, desktop: 4 },
  className,
}: ProductGridSkeletonProps): JSX.Element {
  const { theme } = useTheme();

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

/** Single card skeleton — matches ProductCard: image 4:5, then name row (left + right slot), category, price. */
function ProductCardSkeleton({ theme }: { theme: "light" | "dark" }): JSX.Element {
  return (
    <div className="product-card w-full flex flex-col rounded-xl overflow-hidden">
      <div className="product-card-image-wrap relative w-full overflow-hidden rounded-t-xl bg-cream-100 dark:bg-dark-surface">
        <div className="relative w-full" style={{ aspectRatio: "4 / 5" }}>
          <Skeleton
            variant="rounded"
            className={cn(
              "absolute inset-0 w-full h-full rounded-none",
              theme === "dark" ? "bg-dark-bg-secondary" : "bg-cream-200"
            )}
          />
        </div>
      </div>
      <div className="product-card-info flex flex-col gap-1 pt-3 pb-1">
        <div className="flex items-start justify-between gap-2">
          <Skeleton
            variant="rounded"
            className={cn(
              "h-4 flex-1 min-w-0 max-w-[85%]",
              theme === "dark" ? "bg-dark-bg-secondary" : "bg-cream-200"
            )}
          />
          <Skeleton
            variant="rounded"
            className={cn(
              "h-6 w-6 shrink-0 rounded-full",
              theme === "dark" ? "bg-dark-bg-secondary" : "bg-cream-200"
            )}
          />
        </div>
        <Skeleton
          variant="rounded"
          className={cn(
            "h-3 w-1/2",
            theme === "dark" ? "bg-dark-bg-secondary" : "bg-cream-200"
          )}
        />
        <Skeleton
          variant="rounded"
          className={cn(
            "h-4 w-1/3 mt-0.5",
            theme === "dark" ? "bg-dark-bg-secondary" : "bg-cream-200"
          )}
        />
      </div>
    </div>
  );
}
