"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";

/**
 * Conditionally renders the frontend Header only on non-admin routes
 * Prevents frontend navigation from appearing in admin dashboard
 */
export function ConditionalHeader({ cartItemCount = 0 }: { cartItemCount?: number }): JSX.Element | null {
  const pathname = usePathname();
  
  // Don't render frontend header on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <Header cartItemCount={cartItemCount} />;
}
