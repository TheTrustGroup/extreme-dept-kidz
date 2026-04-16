"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { H1, Body } from "@/components/ui/typography";
import CollectionToolbar, {
  type FilterState,
} from "@/components/collection/CollectionToolbar";
import ProductGrid from "@/components/product/ProductGrid";
import type { ProductCardProps } from "@/components/product/ProductCard";
import { useCartStore } from "@/lib/stores/cart-store";
import { getProductAgeRange } from "@/lib/utils/filter-products";
import { normalizeProductSizeLabel } from "@/lib/constants/product-sizes";
import { SmartImagePrefetch } from "@/components/ui/SmartImagePrefetch";
import { ComingSoonPage } from "@/components/collections/ComingSoonPage";
import type { Product } from "@/types";

interface CollectionPageClientProps {
  params: { slug: string };
  products?: Product[];
  collectionInfo?: {
    name: string;
    description?: string;
    image?: string;
    metadata?: Record<string, unknown>;
  };
  skipHero?: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  sizes: [],
  ageRanges: [],
  priceMax: 1000,
  availability: false,
};

function productToCardProps(p: Product): ProductCardProps {
  const priceNum = typeof p.price === "number" ? p.price : Number(p.price);
  const originalNum =
    p.originalPrice != null
      ? typeof p.originalPrice === "number"
        ? p.originalPrice
        : Number(p.originalPrice)
      : undefined;
  const primaryImage = p.images?.find((img) => img.isPrimary) ?? p.images?.[0];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: priceNum / 100,
    compareAtPrice: originalNum != null ? originalNum / 100 : undefined,
    currency: "₵",
    imageUrl: primaryImage?.url ?? "/placeholder.jpg",
    imageAlt: primaryImage?.alt ?? p.name,
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

export function CollectionPageClient({
  params,
  products: serverProducts = [],
  collectionInfo,
  skipHero = false,
}: CollectionPageClientProps): JSX.Element {
  const [products, setProducts] = React.useState<Product[]>(serverProducts);
  const [filters, setFilters] = React.useState<FilterState>(DEFAULT_FILTERS);
  const [sortValue, setSortValue] = React.useState("featured");

  const collection = React.useMemo(() => {
    if (collectionInfo) {
      return {
        id: `coll-${params.slug}`,
        name: collectionInfo.name,
        slug: params.slug,
        description: collectionInfo.description ?? "",
        image: "",
        isActive: true,
      };
    }
    if (serverProducts.length > 0 && serverProducts[0]?.category) {
      const c = serverProducts[0].category;
      return {
        id: `coll-${params.slug}`,
        name: c.name || params.slug,
        slug: params.slug,
        description: "",
        image: "",
        isActive: true,
      };
    }
    return {
      id: `coll-${params.slug}`,
      name: params.slug,
      slug: params.slug,
      description: "",
      image: "",
      isActive: true,
    };
  }, [params.slug, serverProducts, collectionInfo]);

  React.useEffect(() => {
    if (serverProducts && serverProducts.length >= 0) {
      setProducts(serverProducts);
    }
  }, [serverProducts]);

  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
      if (filters.sizes.length > 0) {
        const normalizedFilterSizes = filters.sizes
          .map((size) => normalizeProductSizeLabel(size))
          .filter((size): size is NonNullable<typeof size> => size != null);
        const hasSize = product.sizes?.some(
          (s) => {
            const normalizedSize = normalizeProductSizeLabel(s.size);
            return normalizedSize != null && normalizedFilterSizes.includes(normalizedSize) && s.inStock;
          }
        );
        if (!hasSize) return false;
      }
      if (filters.ageRanges.length > 0) {
        const productAge = getProductAgeRange(product);
        if (!productAge || !filters.ageRanges.includes(productAge)) return false;
      }
      const priceNum = typeof product.price === "number" ? product.price : Number(product.price);
      if (priceNum > filters.priceMax * 100) return false;
      if (filters.availability && !product.inStock) return false;
      return true;
    });
  }, [products, filters]);

  const sortedProducts = React.useMemo(() => {
    const list = [...filteredProducts];
    switch (sortValue) {
      case "price-asc":
        return list.sort(
          (a, b) =>
            (typeof a.price === "number" ? a.price : Number(a.price)) -
            (typeof b.price === "number" ? b.price : Number(b.price))
        );
      case "price-desc":
        return list.sort(
          (a, b) =>
            (typeof b.price === "number" ? b.price : Number(b.price)) -
            (typeof a.price === "number" ? a.price : Number(a.price))
        );
      case "newest":
        return list.sort((a, b) => {
          const aT = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bT = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bT - aT;
        });
      case "name-asc":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list;
    }
  }, [filteredProducts, sortValue]);

  const cardProducts: ProductCardProps[] = React.useMemo(
    () => sortedProducts.map(productToCardProps),
    [sortedProducts]
  );

  const addToCart = useCartStore((s) => s.addItem);
  const handleAddToCart = React.useCallback(
    (productId: string) => {
      const product = sortedProducts.find((p) => p.id === productId);
      if (!product || !product.inStock) return;
      const firstSize =
        product.sizes?.find((s) => s.inStock)?.size ??
        product.sizes?.[0]?.size;
      if (firstSize) addToCart(product, firstSize);
    },
    [sortedProducts, addToCart]
  );

  const handleQuickView = React.useCallback((_productId: string) => {
    // Quick view modal — build in a later step
  }, []);

  const clearAll = () => setFilters(DEFAULT_FILTERS);

  const isGirlsCollection = params.slug === "girls";
  const hasNoProducts = products.length === 0;

  if (isGirlsCollection && hasNoProducts) {
    const launchDate =
      collectionInfo?.metadata &&
      typeof collectionInfo.metadata.launchDate === "string"
        ? collectionInfo.metadata.launchDate
        : "Spring 2025";
    const heroImage = collectionInfo?.image || "/4677.png";
    const previewImages =
      collectionInfo?.metadata &&
      Array.isArray(collectionInfo.metadata.previewImages)
        ? (collectionInfo.metadata.previewImages as string[])
        : [
            "/IMG_4673.png",
            "/IMG_4689.png",
            "/4671.png",
            "/4672.png",
            "/4674.png",
            "/4675.png",
          ];
    return (
      <ComingSoonPage
        collectionName={collectionInfo?.name || "Girls"}
        collectionSlug="girls"
        estimatedLaunchDate={launchDate}
        heroImage={heroImage}
        previewImages={previewImages}
      />
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-cream-50 pt-20 md:pt-24 pb-16">
        <Container size="lg">
          <div className="text-center py-16">
            <H1 className="text-charcoal-900 mb-4">Collection Not Found</H1>
            <Body className="text-charcoal-600 mb-8">
              This collection may have been moved or is currently unavailable.
              Discover our other curated selections.
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

  return (
    <div className={skipHero ? "" : "min-h-screen bg-cream-50"}>
      <div
        className={skipHero ? "pt-0" : "pt-16 xs:pt-18 sm:pt-20 md:pt-24 pb-12 sm:pb-16"}
      >
        <div className="collection-page">
          {!skipHero && (
            <div className="collection-header container-luxury">
              <motion.h1
                className="text-h1 font-playfair text-[var(--text-primary)]"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {collection.name}
              </motion.h1>
              {collection.description ? (
                <motion.p
                  className="collection-header__desc"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {collection.description}
                </motion.p>
              ) : null}
            </div>
          )}

          <div className="container-luxury section-sm">
            <CollectionToolbar
              totalProducts={cardProducts.length}
              filters={filters}
              sortValue={sortValue}
              onFiltersChange={setFilters}
              onSortChange={setSortValue}
              onClearAll={clearAll}
            />

            <div className="mt-6">
              <ProductGrid
                products={cardProducts}
                collectionName={collection.name}
                onAddToCart={handleAddToCart}
                onQuickView={handleQuickView}
                columns={4}
              />
            </div>
          </div>
        </div>

        <SmartImagePrefetch
          imageUrls={sortedProducts
            .slice(0, 20)
            .flatMap((p) => [p.images[0]?.url, p.images[1]?.url])
            .filter((url): url is string => !!url)}
          prefetchDistance={200}
          maxConcurrent={3}
          enabled={sortedProducts.length > 0}
        />
      </div>
    </div>
  );
}
