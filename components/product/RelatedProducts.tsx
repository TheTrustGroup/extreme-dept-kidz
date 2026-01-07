"use client";

import * as React from "react";
import type { Product } from "@/types";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Container } from "@/components/ui/container";
import { H2 } from "@/components/ui/typography";

interface RelatedProductsProps {
  currentProduct: Product;
  allProducts: Product[];
  limit?: number;
}

/**
 * RelatedProducts Component
 * 
 * Displays related products based on category and tags.
 */
export function RelatedProducts({
  currentProduct,
  allProducts,
  limit = 4,
}: RelatedProductsProps) {
  const relatedProducts = React.useMemo(() => {
    // Filter out current product
    const filtered = allProducts.filter((p) => p.id !== currentProduct.id);

    // Prioritize products from same category
    const sameCategory = filtered.filter(
      (p) => p.category.id === currentProduct.category.id
    );

    // Then products with similar tags
    const similarTags = filtered.filter((p) => {
      if (!currentProduct.tags || !p.tags) return false;
      return p.tags.some((tag) => currentProduct.tags?.includes(tag));
    });

    // Combine and deduplicate
    const combined = [
      ...sameCategory,
      ...similarTags.filter((p) => !sameCategory.includes(p)),
    ];

    // Remove duplicates
    const unique = combined.filter(
      (product, index, self) =>
        index === self.findIndex((p) => p.id === product.id)
    );

    return unique.slice(0, limit);
  }, [currentProduct, allProducts, limit]);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-cream-50">
      <Container size="lg">
        <div className="space-y-12">
          <H2 className="text-charcoal-900 text-center">You May Also Like</H2>
          <ProductGrid products={relatedProducts} columns={4} />
        </div>
      </Container>
    </section>
  );
}

