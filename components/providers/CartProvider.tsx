"use client";

import * as React from "react";
import { useCartStore } from "@/lib/stores/cart-store";

interface CartProviderProps {
  children: React.ReactNode;
}

/**
 * CartProvider
 * 
 * Handles cart store hydration for SSR compatibility.
 * Ensures localStorage is only accessed on the client side.
 */
export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const setHydrated = useCartStore((state) => state.setHydrated);
  const isHydrated = useCartStore((state) => state.isHydrated);

  React.useEffect(() => {
    // Mark store as hydrated after component mounts
    if (!isHydrated) {
      setHydrated();
    }
  }, [isHydrated, setHydrated]);

  return <>{children}</>;
}

