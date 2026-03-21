"use client";

import { useMemo } from "react";
import JustDropped from "./JustDropped";
import type { Product } from "@/types";
import { useCartStore } from "@/lib/stores/cart-store";

function productToCardProps(p: Product) {
  const priceNum = typeof p.price === "number" ? p.price : Number(p.price);
  const originalNum =
    p.originalPrice != null
      ? typeof p.originalPrice === "number"
        ? p.originalPrice
        : Number(p.originalPrice)
      : undefined;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: priceNum / 100,
    compareAtPrice: originalNum != null ? originalNum / 100 : undefined,
    currency: "GHS ₵" as const,
    imageUrl: p.images?.[0]?.url ?? "/placeholder.jpg",
    imageAlt: p.images?.[0]?.alt ?? p.name,
    badge: p.tags?.includes("new")
      ? ("new" as const)
      : !p.inStock
        ? ("sold-out" as const)
        : originalNum != null && originalNum > priceNum
          ? ("sale" as const)
          : null,
    isAvailable: p.inStock ?? true,
  };
}

interface JustDroppedClientProps {
  products: Product[];
}

export default function JustDroppedClient({ products }: JustDroppedClientProps) {
  const addToCart = useCartStore((s) => s.addItem);
  const cardProducts = useMemo(
    () => products.map(productToCardProps),
    [products]
  );

  const handleAddToCart = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !product.inStock) return;
    const firstSize =
      product.sizes?.find((s) => s.inStock)?.size ??
      product.sizes?.[0]?.size;
    if (firstSize) addToCart(product, firstSize);
  };

  return (
    <JustDropped products={cardProducts} onAddToCart={handleAddToCart} />
  );
}
