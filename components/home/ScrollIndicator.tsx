"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollIndicatorProps {
  containerRef: React.RefObject<HTMLDivElement>;
  className?: string;
}

/**
 * ScrollIndicator Component
 * 
 * Shows scroll indicators (left/right arrows) for horizontal scrollable containers.
 * Design System: Tier 3 - UX clarity improvement
 */
export function ScrollIndicator({ containerRef, className }: ScrollIndicatorProps): JSX.Element | null {
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkScrollability = React.useCallback(() => {
    if (!containerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, [containerRef]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    checkScrollability();
    container.addEventListener("scroll", checkScrollability);
    window.addEventListener("resize", checkScrollability);

    return () => {
      container.removeEventListener("scroll", checkScrollability);
      window.removeEventListener("resize", checkScrollability);
    };
  }, [containerRef, checkScrollability]);

  const scrollLeft = () => {
    if (!containerRef.current) return;
    containerRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (!containerRef.current) return;
    containerRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  if (!canScrollLeft && !canScrollRight) return null;

  return (
    <div className={cn("absolute inset-y-0 flex items-center pointer-events-none", className)}>
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className={cn(
            "absolute left-0 z-10",
            "flex items-center justify-center",
            "w-10 h-10",
            "bg-cream-50/90 backdrop-blur-sm",
            "text-charcoal-900",
            "rounded-full",
            "shadow-md",
            "hover:bg-cream-50 hover:shadow-lg",
            "transition-all duration-normal ease-in-out",
            "pointer-events-auto",
            "touch-manipulation",
            "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </button>
      )}

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className={cn(
            "absolute right-0 z-10",
            "flex items-center justify-center",
            "w-10 h-10",
            "bg-cream-50/90 backdrop-blur-sm",
            "text-charcoal-900",
            "rounded-full",
            "shadow-md",
            "hover:bg-cream-50 hover:shadow-lg",
            "transition-all duration-normal ease-in-out",
            "pointer-events-auto",
            "touch-manipulation",
            "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
