"use client";

import * as React from "react";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { StickyAddToCart } from "@/components/product/StickyAddToCart";
import { CompleteTheLook } from "@/components/product/CompleteTheLook";
import { ProductRecommendations } from "@/components/product/ProductRecommendations";
import { Reviews } from "@/components/product/Reviews";
import { useProductPurchase } from "@/lib/hooks/use-product-purchase";
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

/**
 * ProductPageClient Component
 * 
 * Client-side product page content with interactivity.
 * Uses shared purchase state to prevent duplication between
 * ProductInfo and StickyAddToCart components.
 */
export function ProductPageClient({ product, allProducts = [], completeLooks = [] }: ProductPageClientProps): JSX.Element {
  // Shared purchase state for ProductInfo and StickyAddToCart
  const purchaseState = useProductPurchase(product);

  const category = product.category ?? { name: "Product", slug: "all" };
  const images = product.images ?? [];
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Collections", href: "/collections" },
    { label: category.name, href: `/collections/${category.slug}` },
    { label: product.name },
  ];

  return (
    <>
      {/* Polo-style: full-width image on mobile, then info card; 2-col on desktop */}
      <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary pt-20 md:pt-24 pb-24 lg:pb-16 transition-colors duration-300" style={{ contain: "layout style paint" }}>
        {/* Breadcrumb — minimal, above content */}
        <Container size="lg">
          <div className="mb-4 mt-6 sm:mt-8">
            <Breadcrumb items={breadcrumbItems} generateStructuredData={false} />
          </div>
        </Container>

        {/* Main: image full width on mobile; on desktop 2-col */}
        <div className="mb-0">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,440px)] gap-0 lg:gap-12 lg:max-w-7xl lg:mx-auto lg:px-8 mb-0">
            {/* Gallery — full width mobile, cream bg, Polo indicator */}
            <div className="lg:sticky lg:top-24 lg:self-start bg-cream-100 dark:bg-dark-surface">
              <ProductGallery
                images={images}
                productName={product.name}
              />
            </div>

            {/* Info card — Polo: white/cream card, rounded top on mobile (overlaps image feel) */}
            <div className="lg:sticky lg:top-24 lg:self-start -mt-6 lg:mt-0 relative z-10 lg:bg-transparent bg-cream-50 dark:bg-dark-bg-primary rounded-t-2xl lg:rounded-none pt-6 lg:pt-0 px-4 sm:px-6 lg:px-0 pb-8 lg:pb-0">
              <ProductInfo product={product} purchaseState={purchaseState} />
            </div>
          </div>
        </div>

        <Container size="lg" className="mt-12 lg:mt-16">
          {/* Shipping & Returns — anchor for #shipping link from ProductInfo */}
          <section id="shipping" className="scroll-mt-24 mb-8 pb-8 border-b border-cream-200 dark:border-dark-border-glass">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal-900 dark:text-dark-text-primary mb-2">
              Shipping and Free Returns
            </h2>
            <p className="text-sm text-charcoal-600 dark:text-dark-text-secondary">
              Free shipping on orders over ₵800. Easy returns within 30 days. Items must be unworn with tags attached.
            </p>
          </section>

          {/* Complete The Look Section - Below fold, can stream */}
          <Suspense fallback={<div className="h-96 bg-cream-50 dark:bg-dark-surface animate-pulse rounded-xl" />}>
            <CompleteTheLook currentProduct={product} initialLooks={completeLooks} />
          </Suspense>

          {/* Reviews Section - Below fold, can stream */}
          <Suspense fallback={<div className="h-64 bg-cream-50 dark:bg-dark-surface animate-pulse rounded-xl" />}>
            <Reviews productId={product.id} />
          </Suspense>
        </Container>
      </div>

      {/* Product Recommendations - Below fold, can stream */}
      <Suspense fallback={<div className="h-96 bg-cream-50 dark:bg-dark-surface animate-pulse" />}>
        <ProductRecommendations
          currentProduct={product}
          allProducts={allProducts}
          type="you-may-also-like"
          limit={4}
        />
      </Suspense>

      {/* Sticky Add to Cart Bar - Mobile: Always visible, Desktop: On scroll */}
      <StickyAddToCart product={product} purchaseState={purchaseState} />
    </>
  );
}


