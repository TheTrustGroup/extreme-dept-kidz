"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Skip Links Component
 * 
 * Provides keyboard navigation shortcuts to main content areas.
 * WCAG 2.1 AA compliant skip links.
 */
export function SkipLinks() {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show skip links when Tab is pressed
      if (e.key === "Tab" && !isVisible) {
        setIsVisible(true);
      }
    };

    const handleMouseDown = () => {
      // Hide skip links when mouse is used
      setIsVisible(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:z-[100] focus-within:top-4 focus-within:left-4">
      <nav aria-label="Skip navigation links">
        <ul className="flex flex-col gap-2">
          <li>
            <Link
              href="#main-content"
              className={cn(
                "inline-block px-6 py-3 bg-navy-900 text-cream-50",
                "rounded-lg font-medium text-sm",
                "focus:outline-none focus:ring-4 focus:ring-navy-500 focus:ring-offset-2",
                "transition-all duration-200",
                "hover:bg-navy-800"
              )}
            >
              Skip to main content
            </Link>
          </li>
          <li>
            <Link
              href="#main-navigation"
              className={cn(
                "inline-block px-6 py-3 bg-navy-900 text-cream-50",
                "rounded-lg font-medium text-sm",
                "focus:outline-none focus:ring-4 focus:ring-navy-500 focus:ring-offset-2",
                "transition-all duration-200",
                "hover:bg-navy-800"
              )}
            >
              Skip to navigation
            </Link>
          </li>
          <li>
            <Link
              href="#footer"
              className={cn(
                "inline-block px-6 py-3 bg-navy-900 text-cream-50",
                "rounded-lg font-medium text-sm",
                "focus:outline-none focus:ring-4 focus:ring-navy-500 focus:ring-offset-2",
                "transition-all duration-200",
                "hover:bg-navy-800"
              )}
            >
              Skip to footer
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

