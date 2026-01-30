"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const PRODUCTS_UPDATED_KEY = "products_updated";

/**
 * Listens for product list updates (e.g. admin upload in another tab).
 * When products_updated is set in localStorage, refreshes the current page
 * so all browsers/tabs see the same product list.
 */
export function ProductsUpdateListener(): null {
  const router = useRouter();

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PRODUCTS_UPDATED_KEY && e.newValue) {
        router.refresh();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [router]);

  return null;
}
