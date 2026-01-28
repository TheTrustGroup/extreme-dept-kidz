"use client";

import * as React from "react";
import dynamic from "next/dynamic";

/**
 * Lazy-loaded WebVitals
 * 
 * CRITICAL FIX: Defer WebVitals loading until after page is interactive
 * WebVitals tracking is non-critical and should not block initial render
 */
const WebVitals = dynamic(
  () => import("./web-vitals").then((mod) => ({ default: mod.WebVitals })),
  {
    ssr: false, // Don't SSR - analytics only
    loading: () => null, // No loading state
  }
);

export function LazyWebVitals(): JSX.Element {
  // Defer loading until after page is fully interactive
  const [shouldLoad, setShouldLoad] = React.useState(false);

  React.useEffect(() => {
    // Load after page is interactive to avoid blocking critical rendering
    // Use requestIdleCallback if available, otherwise setTimeout
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      requestIdleCallback(() => {
        setShouldLoad(true);
      }, { timeout: 2000 });
    } else {
      // Fallback: Load after 1 second
      const timer = setTimeout(() => {
        setShouldLoad(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  if (!shouldLoad) return <></>;

  return <WebVitals />;
}
