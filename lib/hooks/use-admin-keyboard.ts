/**
 * Admin Keyboard Shortcuts Hook
 * 
 * Global keyboard shortcuts for admin dashboard.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAdminKeyboards(): void {
  const router = useRouter();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      // Cmd+K / Ctrl+K: Quick search - handled in AdminHeader (setShowSearch(true)); prevent default here so browser doesn't handle it
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
      }

      // Cmd+N / Ctrl+N: New product
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        router.push("/admin/products/new");
      }

      // Cmd+O / Ctrl+O: Orders
      if ((e.metaKey || e.ctrlKey) && e.key === "o") {
        e.preventDefault();
        router.push("/admin/orders");
      }

      // Cmd+D / Ctrl+D: Dashboard
      if ((e.metaKey || e.ctrlKey) && e.key === "d") {
        e.preventDefault();
        router.push("/admin");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [router]);
}
