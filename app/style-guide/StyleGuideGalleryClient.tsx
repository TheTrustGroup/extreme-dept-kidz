"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { styleLooks } from "@/lib/mock-data/styling-data";
import { calculateBundleDiscount, getProductById } from "@/lib/utils/styling-utils";
import { Button } from "@/components/ui/button";
import { H1 } from "@/components/ui/typography";
import { Container } from "@/components/ui/container";
import { formatPrice } from "@/lib/utils";

/**
 * Style Guide Gallery Client Component
 * 
 * Displays all complete looks with filtering and sorting.
 */
export function StyleGuideGalleryClient(): JSX.Element {
  const [filter, setFilter] = React.useState<{
    occasion?: string;
    ageRange?: string;
    season?: string;
  }>({});
  const [sortBy, setSortBy] = React.useState<"newest" | "price-low" | "price-high">("newest");

  // Get unique filter options
  const occasions = React.useMemo(() => {
    const unique = Array.from(new Set(styleLooks.map(l => l.occasion).filter(Boolean)));
    return unique;
  }, []);

  const ageRanges = React.useMemo(() => {
    const unique = Array.from(new Set(styleLooks.map(l => l.ageRange).filter(Boolean)));
    return unique;
  }, []);

  // Filter and sort looks
  const filteredLooks = React.useMemo(() => {
    let filtered = [...styleLooks];

    if (filter.occasion) {
      filtered = filtered.filter(l => l.occasion === filter.occasion);
    }
    if (filter.ageRange) {
      filtered = filtered.filter(l => l.ageRange === filter.ageRange);
    }
    if (filter.season) {
      filtered = filtered.filter(l => l.season === filter.season);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low": {
          const aProducts = a.products
            .map(p => getProductById(p.productId))
            .filter((p): p is NonNullable<ReturnType<typeof getProductById>> => p !== undefined);
          const bProducts = b.products
            .map(p => getProductById(p.productId))
            .filter((p): p is NonNullable<ReturnType<typeof getProductById>> => p !== undefined);
          const aPricing = calculateBundleDiscount(aProducts, a);
          const bPricing = calculateBundleDiscount(bProducts, b);
          return aPricing.total - bPricing.total;
        }
        case "price-high": {
          const aProducts = a.products
            .map(p => getProductById(p.productId))
            .filter((p): p is NonNullable<ReturnType<typeof getProductById>> => p !== undefined);
          const bProducts = b.products
            .map(p => getProductById(p.productId))
            .filter((p): p is NonNullable<ReturnType<typeof getProductById>> => p !== undefined);
          const aPricing = calculateBundleDiscount(aProducts, a);
          const bPricing = calculateBundleDiscount(bProducts, b);
          return bPricing.total - aPricing.total;
        }
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [filter, sortBy]);

  const clearFilters = (): void => {
    setFilter({});
  };

  const hasActiveFilters = Object.values(filter).some(Boolean);

  return (
    <div className="min-h-screen bg-cream-50 pt-20 md:pt-24 pb-16">
      <Container size="lg">
        {/* Header */}
        <div className="mb-8 md:mb-12 text-center">
          <H1 className="text-charcoal-900 text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
            STYLE GUIDE
          </H1>
          <p className="text-charcoal-600 text-base md:text-lg max-w-2xl mx-auto">
            Complete looks curated by our styling team
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 md:mb-12 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-charcoal-700">Filter by:</span>
            
            <button
              onClick={() => setFilter({})}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !hasActiveFilters
                  ? "bg-navy-900 text-cream-50"
                  : "bg-cream-200 text-charcoal-700 hover:bg-cream-300"
              }`}
            >
              All
            </button>

            {occasions.map(occasion => (
              <button
                key={occasion}
                onClick={() => setFilter(prev => ({
                  ...prev,
                  occasion: prev.occasion === occasion ? undefined : occasion,
                }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter.occasion === occasion
                    ? "bg-navy-900 text-cream-50"
                    : "bg-cream-200 text-charcoal-700 hover:bg-cream-300"
                }`}
              >
                {occasion}
              </button>
            ))}

            {ageRanges.map(ageRange => (
              <button
                key={ageRange}
                onClick={() => setFilter(prev => ({
                  ...prev,
                  ageRange: prev.ageRange === ageRange ? undefined : ageRange,
                }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter.ageRange === ageRange
                    ? "bg-navy-900 text-cream-50"
                    : "bg-cream-200 text-charcoal-700 hover:bg-cream-300"
                }`}
              >
                Age {ageRange}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-charcoal-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Looks Grid */}
        {filteredLooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {filteredLooks.map((look, index) => {
              const lookProducts = look.products
                .map(({ productId }) => getProductById(productId))
                .filter(p => p !== undefined);
              
              const pricing = calculateBundleDiscount(lookProducts, look);
              const requiredProducts = look.products.filter(p => !p.isOptional);

              return (
                <m.div
                  key={look.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group"
                >
                  <Link href={`/style-guide/${look.id}`} className="block">
                    <div className="bg-cream-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                      {/* Look Image */}
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <Image
                          src={look.mainImage}
                          alt={look.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {look.bundleDiscount && (
                          <div className="absolute top-4 right-4 bg-green-500 text-cream-50 text-xs font-bold px-3 py-1.5 rounded-full">
                            SAVE {look.bundleDiscount}%
                          </div>
                        )}
                      </div>

                      {/* Look Info */}
                      <div className="p-6 space-y-3">
                        <h3 className="font-serif text-xl font-bold text-charcoal-900">
                          {look.name}
                        </h3>
                        <p className="font-sans text-sm text-charcoal-600 line-clamp-2">
                          {look.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-charcoal-500">
                          <span>{requiredProducts.length} pieces</span>
                          {look.ageRange && (
                            <>
                              <span>•</span>
                              <span>Age {look.ageRange}</span>
                            </>
                          )}
                          {look.occasion && (
                            <>
                              <span>•</span>
                              <span>{look.occasion}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif text-lg font-bold text-navy-900">
                            {formatPrice(pricing.total)}
                          </span>
                          {pricing.savings > 0 && (
                            <span className="font-sans text-sm text-charcoal-500 line-through">
                              {formatPrice(pricing.subtotal)}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          asChild
                        >
                          <span>VIEW LOOK DETAILS</span>
                        </Button>
                      </div>
                    </div>
                  </Link>
                </m.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-charcoal-600 mb-4">No looks match your filters.</p>
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
}
