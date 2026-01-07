"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer";

// Dynamically import CartDrawer to reduce initial bundle size
const CartDrawer = dynamic(
  () => import("@/components/cart/CartDrawer").then((mod) => ({ default: mod.CartDrawer })),
  {
    ssr: false,
    loading: () => null,
  }
);

/**
 * CartDrawerWrapper Component
 * 
 * Wraps CartDrawer with lazy loading for better performance.
 */
export function CartDrawerWrapper() {
  const { isOpen, close } = useCartDrawer();

  return <CartDrawer isOpen={isOpen} onClose={close} />;
}
