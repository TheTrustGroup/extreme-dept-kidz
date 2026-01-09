"use client";

import * as React from "react";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { mockProducts } from "@/lib/mock-data";
import type { Product } from "@/types";

interface ProductPageClientProps {
  product: Product;
}

/**
 * ProductPageClient Component
 * 
 * Client-side product page content with interactivity.
 */
export function ProductPageClient({ product }: ProductPageClientProps) {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Collections", href: "/collections" },
    {
      label: product.category.name,
      href: `/categories/${product.category.slug}`,
    },
    { label: product.name },
  ];

  return (
    <>
      <div className="min-h-screen bg-cream-50 pt-20 md:pt-24 pb-16">
        <Container size="lg">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          {/* Main Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8 lg:gap-12 mb-16 lg:mb-24">
            {/* Product Gallery - Sticky on Desktop */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ProductGallery
                images={product.images}
                productName={product.name}
              />
            </div>

            {/* Product Info - Sticky on Desktop */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ProductInfo product={product} />
            </div>
          </div>
        </Container>
      </div>

      {/* Related Products */}
      <RelatedProducts
        currentProduct={product}
        allProducts={mockProducts}
        limit={4}
      />
    </>
  );
}


