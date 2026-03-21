"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import TopBar from "./TopBar";

/**
 * Conditionally renders the frontend TopBar + Header only on non-admin routes.
 * Prevents frontend navigation from appearing in admin dashboard.
 */
export function ConditionalHeader(): JSX.Element | null {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/checkout")) {
    return null;
  }

  return (
    <>
      <TopBar />
      <Header />
    </>
  );
}
