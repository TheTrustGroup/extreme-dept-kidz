"use client";

import * as React from "react";
import dynamic from "next/dynamic";

/**
 * LazyFloatingCurrencySelector
 *
 * Renders the currency utility pill into #global-utility-layer (portal from root layout).
 * Do NOT move this component inside the footer or any other layout slot — it must stay
 * in the root layout and portal to #global-utility-layer so it appears above the footer
 * as a sticky pill when the footer is in view. Deferred hydration for FCP/LCP.
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
