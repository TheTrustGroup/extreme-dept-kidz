"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { m } from "framer-motion";
import { Grid3x3 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { H1, Body } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
  FilterSidebar,
  type FilterState,
} from "@/components/products/FilterSidebar";
import {
  ProductToolbar,
  type SortOption,
} from "@/components/products/ProductToolbar";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ActiveFilters } from "@/components/products/ActiveFilters";
import { mockProducts, mockCollections } from "@/lib/mock-data";
import {
  filterProducts,
  sortProducts,
  getProductsByCollection,
} from "@/lib/utils/filter-products";
import { modelImages } from "@/lib/data/image-manifest";

interface CollectionPageClientProps {
  params: {
    slug: string;
  };
}

/**
 * Collection Page Client Component
 * 
 * Displays products for a specific collection with filtering and sorting.
 */
export function CollectionPageClient({ params }: CollectionPageClientProps): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Get collection or create virtual collection for category-based routes
  const collection = React.useMemo(() => {
    // First check if it's a real collection
    const foundCollection = mockCollections.find((c) => c.slug === params.slug);
    if (foundCollection) return foundCollection;

    // Handle category-based collections (boys, girls)
    const categoryMap: Record<string, { name: string; description: string }> = {
      "boys": {
        name: "Boys Collection",
        description: "Premium streetwear and luxury essentials for the modern boy. Elevated style for young legends.",
      },
      "girls": {
        name: "Girls Collection",
        description: "Select premium styles for girls. Thoughtfully curated pieces designed for the modern young lady.",
      },
    };

    const categoryInfo = categoryMap[params.slug];
    if (categoryInfo) {
      return {
        id: `coll-${params.slug}`,
        name: categoryInfo.name,
        slug: params.slug,
        description: categoryInfo.description,
        image: "",
        isActive: true,
      };
    }

    return null;
  }, [params.slug]);

  // Initialize filters from URL params
  const getFiltersFromParams = (): FilterState => {
    return {
      categories: searchParams.get("categories")?.split(",").filter(Boolean) || [],
      sizes: searchParams.get("sizes")?.split(",").filter(Boolean) || [],
      priceRange: {
        min: parseInt(searchParams.get("minPrice") || "0", 10),
        max: parseInt(searchParams.get("maxPrice") || "18000", 10),
      },
      inStockOnly: searchParams.get("inStock") === "true",
    };
  };

  const [filters, setFilters] = React.useState<FilterState>(
    getFiltersFromParams()
  );
  const [sortBy, setSortBy] = React.useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "featured"
  );

  // Update URL when filters or sort change
  React.useEffect(() => {
    const params = new URLSearchParams();

    if (filters.categories.length > 0) {
      params.set("categories", filters.categories.join(","));
    }
    if (filters.sizes.length > 0) {
      params.set("sizes", filters.sizes.join(","));
    }
    if (filters.priceRange.min !== 0) {
      params.set("minPrice", filters.priceRange.min.toString());
    }
    if (filters.priceRange.max !== 18000) {
      params.set("maxPrice", filters.priceRange.max.toString());
    }
    if (filters.inStockOnly) {
      params.set("inStock", "true");
    }
    if (sortBy !== "featured") {
      params.set("sort", sortBy);
    }

    const queryString = params.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    router.replace(newUrl, { scroll: false });
  }, [filters, sortBy, router]);

  // Get and filter products
  const collectionProducts = React.useMemo(() => {
    if (!collection) return [];
    return getProductsByCollection(mockProducts, collection.slug);
  }, [collection, params.slug]);

  const filteredProducts = React.useMemo(() => {
    return filterProducts(collectionProducts, filters);
  }, [collectionProducts, filters]);

  const sortedProducts = React.useMemo(() => {
    return sortProducts(filteredProducts, sortBy);
  }, [filteredProducts, sortBy]);

  // Simulate loading
  React.useEffect(() => {
    setIsLoading(false);
  }, []);

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterState): void => {
    setFilters(newFilters);
  };

  // Handle sort changes
  const handleSortChange = (newSort: SortOption): void => {
    setSortBy(newSort);
  };

  // Handle active filter removal
  const handleRemoveCategory = (category: string): void => {
    setFilters({
      ...filters,
      categories: filters.categories.filter((c) => c !== category),
    });
  };

  const handleRemoveSize = (size: string): void => {
    setFilters({
      ...filters,
      sizes: filters.sizes.filter((s) => s !== size),
    });
  };

  const handleClearPrice = (): void => {
    setFilters({
      ...filters,
      priceRange: { min: 0, max: 18000 },
    });
  };

  const handleClearStock = (): void => {
    setFilters({
      ...filters,
      inStockOnly: false,
    });
  };

  const handleClearAllFilters = (): void => {
    setFilters({
      categories: [],
      sizes: [],
      priceRange: { min: 0, max: 18000 },
      inStockOnly: false,
    });
  };

  if (!collection) {
    return (
      <div className="min-h-screen bg-cream-50 pt-20 md:pt-24 pb-16">
        <Container size="lg">
          <div className="text-center py-16">
            <H1 className="text-charcoal-900 mb-4">Collection Not Found</H1>
            <Body className="text-charcoal-600 mb-8">
              This collection may have been moved or is currently unavailable. Discover our other curated selections.
            </Body>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" asChild>
                <Link href="/collections">View All Collections</Link>
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <Link href="/">Go Home</Link>
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  const activeFiltersCount = 
    filters.categories.length +
    filters.sizes.length +
    (filters.priceRange.min !== 0 || filters.priceRange.max !== 18000 ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0);

  // Get collection hero image based on slug
  const getCollectionHeroImage = (): string => {
    if (params.slug === "boys") return "/Extreme 3.png";
    if (params.slug === "girls") return "/Extreme 4.png";
    if (params.slug === "new-arrivals") return "/Extreme 4.png";
    return "/Extreme 5.png";
  };

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Collection Hero Header */}
      <section className="relative h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
        <Image
          src={getCollectionHeroImage()}
          alt={collection.name}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 via-charcoal-900/40 to-transparent" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <H1 className="text-cream-50 mb-4 text-4xl md:text-5xl lg:text-6xl font-serif font-bold drop-shadow-lg">
              {collection.name.toUpperCase()}
            </H1>
            {collection.description && (
              <Body className="text-xl md:text-2xl text-cream-100 max-w-2xl mx-auto drop-shadow-md">
                {collection.description}
              </Body>
            )}
          </m.div>
        </div>
      </section>

      <div className="pt-16 xs:pt-18 sm:pt-20 md:pt-24 pb-12 sm:pb-16">
        <Container size="lg">
          {/* Product Count & Active Filters */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 xs:mb-7 sm:mb-8 md:mb-10 lg:mb-12"
          >
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-cream-200">
              <Body className="text-sm text-charcoal-600 font-medium">
                {sortedProducts.length} {sortedProducts.length === 1 ? "Product" : "Products"}
              </Body>
              {activeFiltersCount > 0 && (
                <Body className="text-xs text-charcoal-500">
                  {activeFiltersCount} {activeFiltersCount === 1 ? "filter" : "filters"} active
                </Body>
              )}
            </div>
          </m.div>
          
          {/* Product Count & Active Filters */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-cream-200">
            <Body className="text-sm text-charcoal-600 font-medium">
              {sortedProducts.length} {sortedProducts.length === 1 ? "Product" : "Products"}
            </Body>
            {activeFiltersCount > 0 && (
              <Body className="text-xs text-charcoal-500">
                {activeFiltersCount} {activeFiltersCount === 1 ? "filter" : "filters"} active
              </Body>
            )}
          </div>
        </m.div>

        {/* Main Content: Filters + Products */}
        <div className="flex flex-col lg:flex-row gap-6 xs:gap-7 sm:gap-8">
          {/* Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
          />

          {/* Products Section */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <ProductToolbar
              resultCount={sortedProducts.length}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              onFilterClick={() => setIsFilterOpen(true)}
            />

            {/* Active Filters */}
            <ActiveFilters
              filters={filters}
              onRemoveCategory={handleRemoveCategory}
              onRemoveSize={handleRemoveSize}
              onClearPrice={handleClearPrice}
              onClearStock={handleClearStock}
              onClearAll={handleClearAllFilters}
            />

            {/* Product Grid with Animation */}
            <m.div
              key={`${sortedProducts.length}-${sortBy}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-6 xs:mt-7 sm:mt-8"
            >
              <ProductGrid
                products={sortedProducts}
                isLoading={isLoading}
                columns={4}
              />
            </m.div>
          </div>
        </div>
      </Container>
    </div>
  );
}

