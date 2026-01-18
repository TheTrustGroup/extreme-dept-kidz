import * as React from "react";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

/**
 * SkeletonCard Component
 * 
 * Skeleton loader for product cards with shimmer effect.
 * Matches the ProductCard layout and dimensions.
 */
export interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps): JSX.Element {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-lg bg-cream-50 w-full flex flex-col",
        // Match ProductCard shadow
        // Design System: Shadow levels (Tier 2)
        "shadow-sm",
        className
      )}
    >
      {/* Image skeleton - Match ProductCard aspect-square */}
      <div className="relative aspect-square overflow-hidden bg-cream-100 rounded-t-lg">
        <Skeleton className="absolute inset-0" />
      </div>

      {/* Content skeleton - Match ProductCard padding (16px) */}
      <div className="p-4 space-y-2">
        {/* Product name skeleton - Match H4 height (2 lines) */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" variant="rounded" />
          <Skeleton className="h-5 w-3/4" variant="rounded" />
        </div>
        
        {/* Price skeleton - Match price height */}
        <Skeleton className="h-6 w-1/3" variant="rounded" />
        
        {/* Category skeleton - Match label height */}
        <Skeleton className="h-3 w-1/2" variant="rounded" />
      </div>
    </div>
  );
}

