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
      {/* Mobile-first Polo: full-width image, then solid info card; no overflow, no text behind */}
      <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary pt-16 xs:pt-20 md:pt-24 pb-28 lg:pb-16 transition-colors duration-300 overflow-x-hidden" style={{ contain: "layout style paint" }}>
        {/* Breadcrumb — minimal, above content */}
        <Container size="lg" className="overflow-hidden">
          <div className="mb-3 mt-4 sm:mt-8 sm:mb-4">
            <Breadcrumb items={breadcrumbItems} generateStructuredData={false} />
          </div>
        </Container>

        {/* Main: mobile = single column (image then sheet); desktop = 2-col */}
        <div className="mb-0 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,440px)] gap-0 lg:gap-12 lg:max-w-7xl lg:mx-auto lg:px-8 mb-0">
            {/* Gallery — full width on mobile, cream bg, Polo "1 | 2" indicator */}
            <div className="lg:sticky lg:top-24 lg:self-start bg-cream-100 dark:bg-dark-surface overflow-hidden">
              <ProductGallery
                images={images}
                productName={product.name}
              />
            </div>

            {/* Info card — Polo: solid white/cream sheet on mobile, rounded top; no content bleed */}
            <div className="lg:sticky lg:top-24 lg:self-start -mt-5 lg:mt-0 relative z-10 lg:bg-transparent bg-white dark:bg-dark-bg-primary rounded-t-2xl lg:rounded-none pt-5 px-4 sm:px-6 lg:px-0 pb-8 lg:pb-0 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.15)] lg:shadow-none overflow-hidden">
              <ProductInfo product={product} purchaseState={purchaseState} />
            </div>
          </div>
        </div>

        <Container size="lg" className="mt-12 lg:mt-16 overflow-hidden">
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


