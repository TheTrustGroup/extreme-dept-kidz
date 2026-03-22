"use client";

import * as React from "react";
import ProductCard, { type ProductCardProps } from "@/components/product/ProductCard";
import { useCartStore } from "@/lib/stores/cart-store";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

function mapProductToCardProps(p: Product): ProductCardProps {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price / 100,
    compareAtPrice: p.originalPrice ? p.originalPrice / 100 : undefined,
    currency: "₵",
    imageUrl: p.images?.[0]?.url ?? "/placeholder.jpg",
    imageAlt: p.images?.[0]?.alt ?? p.name,
    badge: p.tags?.includes("new")
      ? "new"
      : !p.inStock
        ? "sold-out"
        : p.originalPrice != null && p.originalPrice > p.price
          ? "sale"
          : null,
    isAvailable: p.inStock ?? true,
  };
}

/** Placeholder when fewer than 4 products. Not a product — no link, no Quick View. */
function PlaceholderCard(): JSX.Element {
  return (
    <div
      className={cn(
        "product-card-placeholder w-full flex flex-col items-center justify-center p-8 rounded-xl",
        "bg-cream-50 dark:bg-dark-surface border-2 border-dashed border-cream-200 dark:border-dark-border-glass",
        "text-charcoal-600 dark:text-dark-text-secondary cursor-default select-none",
        "min-h-[280px] sm:min-h-[320px]"
      )}
      style={{ aspectRatio: "4 / 5" }}
      aria-hidden="true"
    >
      <div className="text-center space-y-4">
        <p className="font-serif text-lg font-semibold text-charcoal-900 dark:text-dark-text-primary">
          More Styles Coming Soon
        </p>
        <p className="text-sm text-charcoal-600 dark:text-dark-text-secondary">
          Check back for new arrivals
        </p>
      </div>
    </div>
  );
}

interface JustDroppedGridProps {
  products: Product[];
  placeholdersNeeded: number;
}

/**
 * Client grid for Just Dropped: new ProductCard + add-to-cart / quick-view, with optional placeholders.
 */
export function JustDroppedGrid({
  products,
  placeholdersNeeded,
}: JustDroppedGridProps): JSX.Element {
  const addToCart = useCartStore((s) => s.addItem);

  const handleAddToCart = React.useCallback(
    (productId: string) => {
      const product = products.find((p) => p.id === productId);
      if (!product || !product.inStock) return;
      const firstSize =
        product.sizes?.find((s) => s.inStock)?.size ??
        product.sizes?.[0]?.size;
      if (firstSize) addToCart(product, firstSize);
    },
    [products, addToCart]
  );

  const handleQuickView = React.useCallback((_productId: string) => {
    // Quick view modal — build in a later step
  }, []);

  return (
    <div
      className="product-grid"
      role="list"
      aria-label="New arrivals products"
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          {...mapProductToCardProps(product)}
          index={index}
          priority={index < 4}
          onAddToCart={handleAddToCart}
          onQuickView={handleQuickView}
        />
      ))}
      {Array.from({ length: placeholdersNeeded }, (_, i) => (
        <div key={`placeholder-${i}`} className="w-full min-w-0" role="listitem">
          <PlaceholderCard />
        </div>
      ))}
    </div>
  );
}
