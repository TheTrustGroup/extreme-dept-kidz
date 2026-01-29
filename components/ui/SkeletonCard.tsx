import * as React from "react";
import { Skeleton } from "./Skeleton";
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
        "product-card skeleton-card relative overflow-hidden w-full flex flex-col",
        "shadow-sm",
        className
      )}
      style={{
        // MOBILE-FIRST LAYOUT FIX: Skeleton size parity - match ProductCard exactly
        aspectRatio: "4 / 5",
        minHeight: "400px", // Match ProductCard min-height reservation
        height: "auto",
        maxHeight: "500px", // Match ProductCard max-height
        borderRadius: "30px", // Match ProductCard border-radius
      }}
    >
      {/* Image skeleton - MOBILE-FIRST LAYOUT FIX: Match ProductCard image ratio exactly */}
      <div 
        className="relative overflow-hidden bg-cream-100"
        style={{
          width: "100%",
          aspectRatio: "4 / 5", // Match ProductCard image ratio
          borderRadius: "12px", // Match ProductCard image border-radius
          marginBottom: 0, // Uniform vertical rhythm
        }}
      >
        <Skeleton className="absolute inset-0 skeleton-shimmer" />
      </div>

      {/* Content skeleton - MOBILE-FIRST LAYOUT FIX: Match ProductCard padding exactly */}
      <div 
        className="product-card-content"
        style={{
          padding: "16px", // Match ProductCard consistent padding
          gap: "12px", // Match ProductCard uniform vertical rhythm
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Product name skeleton - MOBILE-FIRST LAYOUT FIX: Match 2-line title height */}
        <div style={{
          minHeight: "2.8em", // Match ProductCard title min-height (2 lines)
          maxHeight: "2.8em",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}>
          <Skeleton className="h-4 w-full" variant="rounded" />
          <Skeleton className="h-4 w-3/4" variant="rounded" />
        </div>
        
        {/* Price skeleton - MOBILE-FIRST LAYOUT FIX: Match price height */}
        <Skeleton className="h-5 w-1/3" variant="rounded" style={{ marginTop: 0 }} />
        
        {/* Category skeleton - MOBILE-FIRST LAYOUT FIX: Match category label height */}
        <Skeleton className="h-3 w-1/2" variant="rounded" style={{ marginTop: 0 }} />
      </div>
    </div>
  );
}

