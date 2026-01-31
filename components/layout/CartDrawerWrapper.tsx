"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer";
import { useCartStore } from "@/lib/stores/cart-store";

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
 * Wraps CartDrawer with lazy loading and wires cart store (items, updateQuantity, removeItem).
 */
export function CartDrawerWrapper() {
  const { isOpen, close } = useCartDrawer();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <CartDrawer
      isOpen={isOpen}
      onClose={close}
      items={items}
      onUpdateQuantity={updateQuantity}
      onRemove={removeItem}
    />
  );
}
