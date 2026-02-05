"use client";

import * as React from "react";
import dynamic from "next/dynamic";

/**
 * LazyFloatingCurrencySelector
 * 
 * CRITICAL FIX: Defer hydration until after page is interactive
 * This prevents blocking FCP/LCP and improves initial render performance
 */
const FloatingCurrencySelector = dynamic(
  () => import("@/components/ui/FloatingCurrencySelector").then((mod) => ({ default: mod.FloatingCurrencySelector })),
  {
    ssr: false, // Don't SSR - not critical for initial render
    loading: () => null, // No loading state - component appears when ready
  }
);

export function LazyFloatingCurrencySelector(): JSX.Element {
  // Defer loading until after page is interactive
  const [shouldLoad, setShouldLoad] = React.useState(false);

  React.useEffect(() => {
    // Load after a short delay to ensure page is interactive
    // This prevents blocking critical rendering path
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 100); // 100ms delay - fast enough for UX, slow enough to not block FCP

    return () => clearTimeout(timer);
  }, []);

  if (!shouldLoad) return <></>;

  return <FloatingCurrencySelector />;
}
