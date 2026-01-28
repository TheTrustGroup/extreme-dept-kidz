"use client";

import * as React from "react";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { StickyAddToCart } from "@/components/product/StickyAddToCart";
import { CompleteTheLook } from "@/components/product/CompleteTheLook";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { Reviews } from "@/components/product/Reviews";
import { useProductPurchase } from "@/lib/hooks/use-product-purchase";
import { mockProducts } from "@/lib/mock-data";
import type { Product } from "@/types";

interface ProductPageClientProps {
  product: Product;
}

/**
 * ProductPageClient Component
 * 
 * Client-side product page content with interactivity.
 * Uses shared purchase state to prevent duplication between
 * ProductInfo and StickyAddToCart components.
 */
export function ProductPageClient({ product }: ProductPageClientProps): JSX.Element {
  // Shared purchase state for ProductInfo and StickyAddToCart
  const purchaseState = useProductPurchase(product);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Collections", href: "/collections" },
    {
      label: product.category.name,
      href: `/collections/${product.category.slug}`,
    },
    { label: product.name },
  ];

  return (
    <>
      <div className="min-h-screen bg-dark-bg-primary [data-theme='light']:bg-cream-50 pt-20 md:pt-24 pb-20 lg:pb-16 transition-colors duration-300" style={{ contain: "layout style paint" }}>
        <Container size="lg">
          {/* Breadcrumb */}
          <div className="mb-6 sm:mb-8">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          {/* Main Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6 sm:gap-8 lg:gap-12 mb-12 sm:mb-16 lg:mb-24">
            {/* Product Gallery - Sticky on Desktop */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ProductGallery
                images={product.images}
                productName={product.name}
              />
            </div>

            {/* Product Info - Sticky on Desktop */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ProductInfo product={product} purchaseState={purchaseState} />
            </div>
          </div>

          {/* Complete The Look Section - Below fold, can stream */}
          <Suspense fallback={<div className="h-96 bg-cream-50 animate-pulse" />}>
            <CompleteTheLook currentProduct={product} />
          </Suspense>

          {/* Reviews Section - Below fold, can stream */}
          <Suspense fallback={<div className="h-64 bg-cream-50 animate-pulse" />}>
            <Reviews productId={product.id} />
          </Suspense>
        </Container>
      </div>

      {/* Related Products - Below fold, can stream */}
      <Suspense fallback={<div className="h-96 bg-cream-50 animate-pulse" />}>
        <RelatedProducts
          currentProduct={product}
          allProducts={mockProducts}
          limit={4}
        />
      </Suspense>

      {/* Sticky Add to Cart Bar - Mobile: Always visible, Desktop: On scroll */}
      <StickyAddToCart product={product} purchaseState={purchaseState} />
    </>
  );
}


