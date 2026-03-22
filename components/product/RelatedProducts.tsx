"use client";

import * as React from "react";
import { m } from "framer-motion";
import { useTheme } from "@/components/providers/ThemeProvider";
import type { Product } from "@/types";
import ProductGrid from "@/components/product/ProductGrid";
import type { ProductCardProps } from "@/components/product/ProductCard";

function productToCardProps(p: Product): ProductCardProps {
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
    currency: "₵",
    imageUrl: p.images?.find((img) => img.isPrimary)?.url ?? p.images?.[0]?.url ?? "/placeholder.jpg",
    imageAlt: p.images?.[0]?.alt ?? p.name,
    badge: p.tags?.includes("new")
      ? "new"
      : !p.inStock
        ? "sold-out"
        : originalNum != null && originalNum > priceNum
          ? "sale"
          : null,
    isAvailable: p.inStock ?? true,
  };
}
import { Container } from "@/components/ui/container";
import { H2 } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

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
  const { theme } = useTheme();
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
    <section className="py-16 md:py-24 bg-dark-bg-primary [data-theme='light']:bg-cream-50 transition-colors duration-300">
      <Container size="lg">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-12"
        >
          <H2 className={cn(
            "text-center font-serif transition-colors duration-300",
            theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
          )}>
            You May Also Like
          </H2>
          <ProductGrid
            products={relatedProducts.map(productToCardProps)}
            columns={4}
          />
        </m.div>
      </Container>
    </section>
  );
}

