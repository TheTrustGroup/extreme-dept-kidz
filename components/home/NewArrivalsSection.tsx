"use client";

import * as React from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { Container } from "@/components/ui/container";
import { H2 } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import ProductCard, { type ProductCardProps } from "@/components/product/ProductCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

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
import { useTheme } from "@/components/providers/ThemeProvider";

interface NewArrivalsSectionProps {
  products?: Product[];
}

type FilterType = "all" | "boys" | "girls" | "new";

/**
 * Placeholder Card Component
 * Shows "More styles coming soon" message
 */
/** Placeholder when fewer products — not a product; same pattern as JustDroppedSection. */
function PlaceholderCard(): JSX.Element {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        "product-card-placeholder w-full flex flex-col items-center justify-center p-8 rounded-xl",
        "bg-cream-50 dark:bg-dark-surface border-2 border-dashed border-cream-200 dark:border-dark-border-glass",
        "text-charcoal-600 dark:text-dark-text-secondary cursor-default select-none"
      )}
      style={{ aspectRatio: "4 / 5", minHeight: "280px" }}
      aria-hidden="true"
    >
      <div className="text-center space-y-4">
        <div className={cn(
          "w-16 h-16 mx-auto rounded-full flex items-center justify-center",
          "bg-cream-100 dark:bg-dark-bg-secondary"
        )}>
          <ChevronRight className="w-8 h-8 rotate-[-90deg] text-charcoal-400 dark:text-dark-text-muted" />
        </div>
        <p className="font-sans text-lg font-semibold text-charcoal-900 dark:text-dark-text-primary">
          More Styles Coming Soon
        </p>
        <p className="text-sm text-charcoal-600 dark:text-dark-text-secondary">
          Check back for new arrivals
        </p>
      </div>
    </div>
  );
}

export function NewArrivalsSection({ products }: NewArrivalsSectionProps): JSX.Element {
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = React.useState<FilterType>("all");
  
  // Use provided products only; never mock in production (empty array if undefined)
  const allProducts = React.useMemo(() => {
    const sourceProducts = Array.isArray(products) ? products : [];
    
    // Remove duplicates by ID and slug
    const uniqueProducts = sourceProducts.filter((product, index, self) =>
      index === self.findIndex((p) => p.id === product.id || p.slug === product.slug)
    );
    
    // Sort by newest first (products with "new" tag or recent createdAt)
    return [...uniqueProducts].sort((a, b) => {
      const aIsNew = a.tags?.includes("new") ? 1 : 0;
      const bIsNew = b.tags?.includes("new") ? 1 : 0;
      if (aIsNew !== bIsNew) return bIsNew - aIsNew;
      
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
  }, [products]);

  // Filter products based on active filter (safe for missing category)
  const filteredProducts = React.useMemo(() => {
    const slug = (p: Product) => p.category?.slug ?? "";
    const name = (p: Product) => (p.category?.name ?? "").toLowerCase();
    switch (activeFilter) {
      case "boys":
        return allProducts.filter((p) => slug(p) === "boys" || name(p) === "boys");
      case "girls":
        return allProducts.filter((p) => slug(p) === "girls" || name(p) === "girls");
      case "new":
        return allProducts.filter((p) => p.tags?.includes("new"));
      case "all":
      default:
        return allProducts;
    }
  }, [allProducts, activeFilter]);

  // Get products to display (4-6 products)
  const displayedProducts = React.useMemo(() => {
    const count = filteredProducts.length >= 6 ? 6 : filteredProducts.length >= 4 ? filteredProducts.length : 4;
    return filteredProducts.slice(0, count);
  }, [filteredProducts]);

  // Fill with placeholders if needed
  const productsToShow = React.useMemo(() => {
    const placeholdersNeeded = Math.max(0, 4 - displayedProducts.length);
    return [
      ...displayedProducts,
      ...Array.from({ length: placeholdersNeeded }, (_, i) => ({ id: `placeholder-${i}`, isPlaceholder: true }))
    ];
  }, [displayedProducts]);

  // Get "View All" link based on filter
  const getViewAllLink = (): string => {
    switch (activeFilter) {
      case "boys":
        return "/collections/boys";
      case "girls":
        return "/collections/girls";
      case "new":
        return "/collections/new-arrivals";
      case "all":
      default:
        return "/collections/new-arrivals";
    }
  };

  const filters: Array<{ id: FilterType; label: string }> = [
    { id: "all", label: "All" },
    { id: "boys", label: "Boys" },
    { id: "girls", label: "Girls" },
    { id: "new", label: "New Arrivals" },
  ];

  return (
    <section 
      className={cn(
        "section reveal transition-colors duration-300 min-h-[320px] py-10 sm:py-12",
        theme === "dark" ? "bg-dark-bg-primary" : "bg-cream-50"
      )}
      aria-labelledby="new-arrivals-heading"
    >
      <Container size="lg">
        {/* Design System: Consistent spacing using 8px base scale */}
        <div className="space-y-[var(--space-8)] lg:space-y-[var(--space-12)]">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[var(--space-4)] sm:gap-[var(--space-6)]">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <H2 
                id="new-arrivals-heading"
                className={cn(
                  "transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                )}
              >
                JUST DROPPED
              </H2>
            </m.div>
            <m.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Button
                variant="secondary"
                size="sm"
                className="hidden sm:flex items-center gap-2 min-h-[44px] touch-manipulation"
                asChild
              >
                <Link href={getViewAllLink()} aria-label={`View all ${activeFilter === "all" ? "new arrivals" : activeFilter} products`}>
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </Button>
            </m.div>
          </div>

          {/* Filter Buttons */}
          <m.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-wrap items-center gap-[var(--space-2)] sm:gap-[var(--space-3)]"
            role="tablist"
            aria-label="Filter products"
          >
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "px-4 py-2 rounded-lg font-sans text-sm font-semibold uppercase tracking-wider transition-all duration-300",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2",
                  activeFilter === filter.id
                    ? theme === "dark"
                      ? "bg-accent-primary text-dark-bg-primary focus:ring-accent-primary"
                      : "bg-navy-900 text-cream-50 focus:ring-navy-500"
                    : theme === "dark"
                      ? "bg-dark-surface text-dark-text-secondary hover:bg-dark-bg-secondary hover:text-dark-text-primary focus:ring-accent-primary"
                      : "bg-cream-100 text-charcoal-700 hover:bg-cream-200 hover:text-charcoal-900 focus:ring-navy-500"
                )}
                role="tab"
                aria-selected={activeFilter === filter.id}
                aria-controls={`filter-${filter.id}`}
              >
                {filter.label}
              </button>
            ))}
          </m.div>

          {/* Products Grid - Responsive: Mobile 2 cols, Tablet 3 cols, Desktop 4 cols */}
          <div 
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[var(--space-4)] sm:gap-[var(--space-5)] lg:gap-[var(--space-6)]"
            role="list"
            aria-label={`${activeFilter === "all" ? "New arrivals" : activeFilter} products`}
          >
            {productsToShow.map((item, index) => {
              if ('isPlaceholder' in item && item.isPlaceholder) {
                return (
                  <m.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="w-full"
                    role="listitem"
                  >
                    <PlaceholderCard />
                  </m.div>
                );
              }

              const product = item as Product;
              return (
                <m.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="w-full"
                  role="listitem"
                >
                  <ProductCard
                    {...productToCardProps(product)}
                    priority={index < 2} // Prioritize first 2 products for LCP
                  />
                </m.div>
              );
            })}
          </div>

          {/* Mobile View All Button - Touch-friendly */}
          <div className="lg:hidden text-center pt-[var(--space-4)]">
            <Button 
              variant="secondary" 
              size="md" 
              className="min-h-[48px] w-full sm:w-auto touch-manipulation" 
              asChild
            >
              <Link href={getViewAllLink()} aria-label={`View all ${activeFilter === "all" ? "new arrivals" : activeFilter} products`}>
                View All {activeFilter === "all" ? "New Arrivals" : filters.find(f => f.id === activeFilter)?.label}
                <ChevronRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
