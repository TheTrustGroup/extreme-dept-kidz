"use client";

import * as React from "react";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

/**
 * PageLoader Component
 * 
 * Full-page loading indicator with elegant skeleton placeholders.
 * Used for page-level loading states.
 */
export interface PageLoaderProps {
  className?: string;
  variant?: "default" | "minimal";
}

export function PageLoader({ className, variant = "default" }: PageLoaderProps): JSX.Element {
  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-navy-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-charcoal-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("py-16 md:py-24", className)}>
      <div className="space-y-8">
        {/* Header skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Spinner Component
 * 
 * Simple loading spinner for inline use.
 */
export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps): JSX.Element {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={cn(
        "border-4 border-navy-900 border-t-transparent rounded-full animate-spin",
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

