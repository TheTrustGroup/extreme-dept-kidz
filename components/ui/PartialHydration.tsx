/**
 * PartialHydration Component
 * 
 * Enables partial hydration for non-critical components.
 * Components wrapped in this will only hydrate when they come into viewport
 * or after a delay, reducing initial JavaScript execution.
 */

"use client";

import * as React from "react";

interface PartialHydrationProps {
  children: React.ReactNode;
  /**
   * Delay before hydration (ms)
   * Default: 0 (hydrate immediately)
   */
  delay?: number;
  /**
   * Hydrate when component enters viewport
   * Default: false
   */
  hydrateOnViewport?: boolean;
  /**
   * Fallback content shown before hydration
   */
  fallback?: React.ReactNode;
  /**
   * Priority level: 'high' | 'low'
   * High priority hydrates immediately, low priority uses delay/viewport
   */
  priority?: 'high' | 'low';
}

export function PartialHydration({
  children,
  delay = 0,
  hydrateOnViewport = false,
  fallback = null,
  priority = 'low',
}: PartialHydrationProps): JSX.Element {
  const [shouldHydrate, setShouldHydrate] = React.useState(priority === 'high');
  const elementRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // High priority: hydrate immediately
    if (priority === 'high') {
      setShouldHydrate(true);
      return;
    }

    // Hydrate on viewport intersection
    if (hydrateOnViewport && typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setShouldHydrate(true);
            observer.disconnect();
          }
        },
        {
          rootMargin: '50px', // Start hydration 50px before entering viewport
          threshold: 0.1,
        }
      );

      if (elementRef.current) {
        observer.observe(elementRef.current);
      }

      return () => observer.disconnect();
    }

    // Hydrate after delay
    if (delay > 0) {
      const timer = setTimeout(() => {
        setShouldHydrate(true);
      }, delay);

      return () => clearTimeout(timer);
    }

    // Default: hydrate immediately
    setShouldHydrate(true);
  }, [delay, hydrateOnViewport, priority]);

  // Show fallback until hydration
  if (!shouldHydrate && fallback) {
    return (
      <div ref={elementRef} suppressHydrationWarning>
        {fallback}
      </div>
    );
  }

  // Hydrated content
  return (
    <div ref={elementRef} suppressHydrationWarning>
      {shouldHydrate ? children : fallback}
    </div>
  );
}
