"use client";

import { useMemo } from "react";
import CartPage from "@/components/cart/CartPage";
import type { CartItem as DrawerCartItem } from "@/components/cart/CartDrawer";
import type { CartItem as StoreCartItem } from "@/types";
import { useCartStore } from "@/lib/stores/cart-store";

function storeItemToDrawerItem(item: StoreCartItem): DrawerCartItem {
  const p = item.product;
  const priceCedis =
    typeof p.price === "number" ? p.price / 100 : Number(p.price) / 100;
  return {
    id: item.id ?? `cart-${p.id}-${item.selectedSize}`,
    productId: p.id,
    variantId: `${p.id}-${item.selectedSize}`,
    slug: p.slug,
    name: p.name,
    variantName: `Size: ${item.selectedSize}`,
    price: priceCedis,
    quantity: item.quantity,
    imageUrl: p.images?.[0]?.url ?? "/placeholder.jpg",
    imageAlt: p.images?.[0]?.alt ?? p.name,
    currency: "₵",
  };
}

export default function CartPageClient() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const drawerItems: DrawerCartItem[] = useMemo(
    () => items.map(storeItemToDrawerItem),
    [items]
  );

  return (
    <CartPage
      items={drawerItems}
      onUpdateQty={updateQuantity}
      onRemove={removeItem}
    />
  );
}
