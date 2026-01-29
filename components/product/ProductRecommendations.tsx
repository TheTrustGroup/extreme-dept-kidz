"use client";

import * as React from "react";
import { m } from "framer-motion";
import { useTheme } from "@/components/providers/ThemeProvider";
import type { Product } from "@/types";
import { ProductCard } from "@/components/products/ProductCard";
import { Container } from "@/components/ui/container";
import { H2 } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import {
  getRecommendedProducts,
  getProductsByCategory,
  type RecommendationOptions,
} from "@/lib/utils/product-recommendations";

export type RecommendationType =
  | "you-may-also-like"
  | "complete-the-look"
  | "recently-viewed"
  | "popular-in-category"
  | "frequently-bought-together";

interface ProductRecommendationsProps {
  /** Current product (for "you-may-also-like" and "complete-the-look") */
  currentProduct?: Product;
  /** All available products */
  allProducts: Product[];
  /** Type of recommendation */
  type?: RecommendationType;
  /** Category ID (for "popular-in-category") */
  categoryId?: string;
  /** Section title (optional, will use default based on type) */
  title?: string;
  /** Number of products to show */
  limit?: number;
  /** Additional recommendation options */
  options?: RecommendationOptions;
  /** Custom className */
  className?: string;
}

const DEFAULT_TITLES: Record<RecommendationType, string> = {
  "you-may-also-like": "You May Also Like",
  "complete-the-look": "Complete the Look",
  "recently-viewed": "Recently Viewed",
  "popular-in-category": "Popular in This Category",
  "frequently-bought-together": "Frequently Bought Together",
};

/**
 * ProductRecommendations Component
 * 
 * Reusable component for displaying product recommendations with smart filtering.
 * Supports multiple recommendation types and responsive grid layout.
 */
export function ProductRecommendations({
  currentProduct,
  allProducts,
  type = "you-may-also-like",
  categoryId,
  title,
  limit = 4,
  options = {},
  className,
}: ProductRecommendationsProps): JSX.Element | null {
  const { theme } = useTheme();

  // Get recommended products based on type
  const recommendedProducts = React.useMemo(() => {
    if (type === "popular-in-category" && categoryId) {
      return getProductsByCategory(categoryId, allProducts, { ...options, limit });
    }

    if (type === "recently-viewed") {
      // TODO: Implement recently viewed logic (localStorage or API)
      // For now, return empty array
      return [];
    }

    if (type === "frequently-bought-together") {
      // TODO: Implement frequently bought together logic (analytics/API)
      // For now, fall back to recommendations
      if (currentProduct) {
        return getRecommendedProducts(currentProduct, allProducts, { ...options, limit });
      }
      return [];
    }

    // Default: "you-may-also-like" or "complete-the-look"
    if (currentProduct) {
      return getRecommendedProducts(currentProduct, allProducts, { ...options, limit });
    }

    return [];
  }, [currentProduct, allProducts, type, categoryId, limit, options]);

  // Don't render if no recommendations
  if (recommendedProducts.length === 0) {
    return null;
  }

  const sectionTitle = title || DEFAULT_TITLES[type];

  return (
    <section
      className={cn(
        "py-12 md:py-16 lg:py-20 transition-colors duration-300",
        theme === "dark" ? "bg-dark-bg-primary" : "bg-cream-50",
        className
      )}
    >
      <Container size="lg">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-8 md:space-y-12"
        >
          {/* Section Title */}
          <H2
            className={cn(
              "text-center font-serif transition-colors duration-300",
              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
            )}
          >
            {sectionTitle}
          </H2>

          {/* Product Grid */}
          <div
            className={cn(
              "grid gap-4 sm:gap-6",
              // Mobile: 2 columns
              "grid-cols-2",
              // Tablet: 3 columns
              "md:grid-cols-3",
              // Desktop: 4 columns
              "lg:grid-cols-4"
            )}
          >
            {recommendedProducts.map((product, index) => (
              <m.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
              >
                <ProductCard
                  product={product}
                  priority={index < 2} // Prioritize first 2 products for LCP
                  fetchPriority={index < 2 ? "high" : "low"}
                />
              </m.div>
            ))}
          </div>
        </m.div>
      </Container>
    </section>
  );
}
