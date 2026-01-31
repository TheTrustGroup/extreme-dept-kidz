"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { LuxuryFooter } from "./LuxuryFooter";

/**
 * Conditionally renders the frontend Footer only on non-admin routes
 * Prevents frontend footer from appearing in admin dashboard
 */
export function ConditionalFooter(): JSX.Element | null {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <LuxuryFooter />;
}
