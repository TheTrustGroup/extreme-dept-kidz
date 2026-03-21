"use client";

import * as React from "react";
import { Suspense, useState, useCallback } from "react";
import { Container } from "@/components/ui/container";
import { ProductGallery } from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import StickyAddToCart from "@/components/product/StickyAddToCart";
import { CompleteTheLook } from "@/components/product/CompleteTheLook";
import { ProductRecommendations } from "@/components/product/ProductRecommendations";
import { Reviews } from "@/components/product/Reviews";
import { useCartStore } from "@/lib/stores/cart-store";
import type { Product } from "@/types";

/** Shape matching lib/data/complete-looks getCompleteLooksForProduct */
export interface CompleteLookForProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  mainImage: string | null;
  totalPrice: number;
  bundlePrice: number;
  savings: number;
  bundleDiscount: number | null;
  featured: boolean;
  tags: string[];
  ageRange: string | null;
  products: Array<{ productId: string; product: any; required: boolean; isOptional: boolean }>;
  items: Array<{ productId: string; product: any; required: boolean }>;
}

interface ProductPageClientProps {
  product: Product;
  allProducts?: Product[];
  completeLooks?: CompleteLookForProduct[];
}

/** Map Product.sizes to ProductInfo variants (id = size for cart lookup). */
function productToVariants(product: Product): { id: string; size: string; stock: number }[] {
  const sizes = product.sizes ?? [];
  return sizes.map((s) => ({
    id: s.size,
    size: s.size,
    stock: s.inStock ? (s.quantity ?? 1) : 0,
  }));
}

/** Price in cedis for display (DB stores pesewas). */
function priceInCedis(product: Product): number {
  return Number(product.price) / 100;
}

function compareAtPriceInCedis(product: Product): number | undefined {
  if (product.originalPrice == null) return undefined;
  return Number(product.originalPrice) / 100;
}

/**
 * ProductPageClient — PDP layout: gallery left, info right, sticky bar on scroll.
 * Breadcrumb lives only in ProductInfo (no duplication).
 */
export function ProductPageClient({
  product,
  allProducts = [],
  completeLooks = [],
}: ProductPageClientProps): JSX.Element {
  const category = product.category ?? { name: "Product", slug: "all" };
  const images = product.images ?? [];
  const variants = productToVariants(product);
  const priceCedis = priceInCedis(product);
  const compareCedis = compareAtPriceInCedis(product);
  const isNew =
    product.tags?.includes("new") ?? product.tags?.includes("new-arrival") ?? false;
  const isOnSale =
    product.originalPrice != null && product.originalPrice > product.price;

  const [currentVariantId, setCurrentVariantId] = useState<string | null>(
    variants.find((v) => v.stock > 0)?.id ?? null
  );
  const addToCart = useCartStore((s) => s.addItem);

  const handleAddToCart = useCallback(
    async (productId: string, variantId: string) => {
      const size = variantId;
      if (!size || !product.inStock) return;
      addToCart(product, size);
    },
    [product, addToCart]
  );

  const handleStickyAdd = useCallback(async () => {
    await handleAddToCart(product.id, currentVariantId ?? "");
  }, [product.id, currentVariantId, handleAddToCart]);

  return (
    <>
      <div
        className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary pt-16 xs:pt-20 md:pt-24 pb-28 lg:pb-16 transition-colors duration-300 overflow-x-hidden"
        style={{ contain: "layout style paint" }}
      >
        <div className="pdp-layout container-luxury section-sm">
          <div className="pdp-gallery">
            <ProductGallery images={images} productName={product.name} />
          </div>

          <ProductInfo
            id={product.id}
            name={product.name}
            price={priceCedis}
            compareAtPrice={compareCedis}
            currency="GHS ₵"
            description={product.description ?? undefined}
            variants={variants}
            collectionName={category.name}
            collectionSlug={category.slug}
            badge={isNew ? "new" : isOnSale ? "sale" : null}
            onAddToCart={handleAddToCart}
            onVariantChange={setCurrentVariantId}
          />
        </div>

        <Container size="lg" className="mt-12 lg:mt-16 overflow-hidden">
          <Suspense fallback={<div className="h-96 bg-cream-50 dark:bg-dark-surface animate-pulse rounded-xl" />}>
            <CompleteTheLook currentProduct={product} initialLooks={completeLooks} />
          </Suspense>

          <Suspense fallback={<div className="h-64 bg-cream-50 dark:bg-dark-surface animate-pulse rounded-xl" />}>
            <Reviews productId={product.id} />
          </Suspense>
        </Container>
      </div>

      <Suspense fallback={<div className="h-96 bg-cream-50 dark:bg-dark-surface animate-pulse" />}>
        <ProductRecommendations
          currentProduct={product}
          allProducts={allProducts}
          type="you-may-also-like"
          limit={4}
        />
      </Suspense>

      <StickyAddToCart
        productName={product.name}
        price={priceCedis}
        currency="GHS ₵"
        imageUrl={product.images?.[0]?.url}
        selectedSize={currentVariantId ?? undefined}
        isAvailable={product.inStock}
        onAddToCart={handleStickyAdd}
      />
    </>
  );
}


