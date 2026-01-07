"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { H1, Body } from "@/components/ui/typography";
import {
  FilterSidebar,
  type FilterState,
} from "@/components/products/FilterSidebar";
import {
  ProductToolbar,
  type SortOption,
} from "@/components/products/ProductToolbar";
import { ProductGrid } from "@/components/products/ProductGrid";
import { mockProducts, mockCollections } from "@/lib/mock-data";
import {
  filterProducts,
  sortProducts,
  getProductsByCollection,
} from "@/lib/utils/filter-products";

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

  // Get collection
  const collection = mockCollections.find((c) => c.slug === params.slug);

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
  }, [collection]);

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

  if (!collection) {
    return (
      <div className="min-h-screen bg-cream-50 pt-20 md:pt-24 pb-16">
        <Container size="lg">
          <div className="text-center py-16">
            <H1 className="text-charcoal-900 mb-4">Collection Not Available</H1>
            <Body className="text-charcoal-600">
              This collection may have been moved or is currently unavailable. Discover our other curated selections.
            </Body>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-16 xs:pt-18 sm:pt-20 md:pt-24 pb-12 sm:pb-16">
      <Container size="lg">
        {/* Page Header */}
        <div className="mb-6 xs:mb-7 sm:mb-8 md:mb-10 lg:mb-12">
          <H1 className="text-charcoal-900 mb-3 xs:mb-4 text-2xl xs:text-3xl sm:text-4xl">{collection.name}</H1>
          {collection.description && (
            <Body className="text-base xs:text-lg text-charcoal-600 max-w-3xl">
              {collection.description}
            </Body>
          )}
        </div>

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

            {/* Product Grid */}
            <div className="mt-6 xs:mt-7 sm:mt-8">
              <ProductGrid
                products={sortedProducts}
                isLoading={isLoading}
                columns={4}
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

