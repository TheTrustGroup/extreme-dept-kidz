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
    <div className={cn("space-y-3", className)}>
      {/* Image skeleton */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-cream-100">
        <Skeleton className="absolute inset-0" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-2">
        {/* Product name skeleton */}
        <Skeleton className="h-5 w-3/4" variant="rounded" />
        
        {/* Price skeleton */}
        <Skeleton className="h-6 w-1/3" variant="rounded" />
      </div>
    </div>
  );
}

