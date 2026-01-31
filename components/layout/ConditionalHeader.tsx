"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { LuxuryHeader } from "./LuxuryHeader";

const DEFAULT_CATEGORIES = [
  { name: "Boys", slug: "boys" },
  { name: "Girls", slug: "girls" },
];

/**
 * Conditionally renders the frontend Header only on non-admin routes
 * Prevents frontend navigation from appearing in admin dashboard
 */
export function ConditionalHeader({
  cartItemCount = 0,
  user = null,
  categories = DEFAULT_CATEGORIES,
}: {
  cartItemCount?: number;
  user?: { name: string; email: string } | null;
  categories?: Array<{ name: string; slug: string }>;
}): JSX.Element | null {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <LuxuryHeader
      cartCount={cartItemCount}
      user={user}
      categories={categories}
    />
  );
}
