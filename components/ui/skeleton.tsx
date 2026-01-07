import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Skeleton Component
 * 
 * Reusable skeleton loader with shimmer effect.
 * Matches the luxury aesthetic with smooth animations.
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "default" | "circular" | "rounded";
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseStyles = "animate-shimmer bg-gradient-to-r from-cream-200 via-cream-100 to-cream-200 bg-[length:200%_100%]";
    
    const variants = {
      default: "rounded-lg",
      circular: "rounded-full",
      rounded: "rounded-md",
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

export { Skeleton };


