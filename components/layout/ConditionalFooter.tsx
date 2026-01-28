"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

/**
 * Conditionally renders the frontend Footer only on non-admin routes
 * Prevents frontend footer from appearing in admin dashboard
 */
export function ConditionalFooter(): JSX.Element | null {
  const pathname = usePathname();
  
  // Don't render frontend footer on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <Footer />;
}
