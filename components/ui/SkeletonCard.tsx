import * as React from "react";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

/**
 * SkeletonCard — Matches ProductCard layout (Polo-style: image 4:5, info name | wishlist slot, category, price).
 * No heavy border; transparent card for consistent loading experience.
 */
export interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps): JSX.Element {
  return (
    <div
      className={cn(
        "product-card w-full flex flex-col rounded-xl overflow-hidden",
        className
      )}
    >
      <div className="product-card-image-wrap relative w-full overflow-hidden rounded-t-xl bg-cream-100 dark:bg-dark-surface">
        <div className="relative w-full" style={{ aspectRatio: "4 / 5" }}>
          <Skeleton className="absolute inset-0 rounded-none skeleton-shimmer" />
        </div>
      </div>
      <div className="product-card-info flex flex-col gap-1 pt-3 pb-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <Skeleton className="h-4 w-full max-w-[90%]" variant="rounded" />
            <Skeleton className="h-4 w-4/5" variant="rounded" />
          </div>
          <Skeleton className="h-6 w-6 shrink-0 rounded-full" variant="rounded" />
        </div>
        <Skeleton className="h-3 w-1/2" variant="rounded" />
        <Skeleton className="h-4 w-1/3 mt-0.5" variant="rounded" />
      </div>
    </div>
  );
}
