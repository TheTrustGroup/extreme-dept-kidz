"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

/**
 * Conditionally renders the frontend Header only on non-admin routes.
 * Prevents frontend navigation from appearing in admin dashboard.
 */
export function ConditionalHeader(): JSX.Element | null {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/checkout")) {
    return null;
  }

  return <Header />;
}
