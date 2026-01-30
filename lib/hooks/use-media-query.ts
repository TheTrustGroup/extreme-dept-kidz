"use client";

import * as React from "react";

/**
 * Phase 7 — Mobile-first: match a media query (e.g. for bottom-sheet modals).
 * Returns true when the query matches. SSR-safe: defaults to false.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/** True when viewport width < 768px (mobile). Use for bottom-sheet modals. */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}
