"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer";
import { useCartStore } from "@/lib/stores/cart-store";
import type { CartItem as DrawerCartItem } from "@/components/cart/CartDrawer";
import type { CartItem as StoreCartItem } from "@/types";

function storeItemToDrawerItem(item: StoreCartItem): DrawerCartItem {
  const p = item.product;
  const priceCedis =
    typeof p.price === "number" ? p.price / 100 : Number(p.price) / 100;
  const primaryImage = p.images?.find((img) => img.isPrimary) ?? p.images?.[0];
  return {
    id: item.id ?? `cart-${p.id}-${item.selectedSize}`,
    productId: p.id,
    variantId: `${p.id}-${item.selectedSize}`,
    slug: p.slug,
    name: p.name,
    variantName: `Size: ${item.selectedSize}`,
    price: priceCedis,
    quantity: item.quantity,
    imageUrl: primaryImage?.url ?? "/placeholder.jpg",
    imageAlt: primaryImage?.alt ?? p.name,
    currency: "₵",
  };
}

const CartDrawer = dynamic(
  () => import("@/components/cart/CartDrawer").then((mod) => ({ default: mod.default })),
  { ssr: false, loading: () => null }
);

export function CartDrawerWrapper() {
  const { isOpen, close } = useCartDrawer();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const drawerItems: DrawerCartItem[] = useMemo(
    () => items.map(storeItemToDrawerItem),
    [items]
  );

  return (
    <CartDrawer
      open={isOpen}
      onClose={close}
      items={drawerItems}
      onUpdateQty={updateQuantity}
      onRemove={removeItem}
    />
  );
}
