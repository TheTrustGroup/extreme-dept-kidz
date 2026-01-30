import type { Metadata } from "next";
import { Suspense } from "react";
import { CollectionPageClient } from "./CollectionPageClient";
import { getAllCategories, getAllProducts, getProductsByCategory } from "@/lib/db";
import { getProductsByCollection } from "@/lib/utils/filter-products";
import { CACHE_TAGS } from "@/lib/utils/cache-revalidation";
import { CACHE_REVALIDATE_PRODUCTS } from "@/lib/utils/cache-constants";
import { unstable_cache } from "next/cache";
import { generateBreadcrumbSchema } from "@/lib/seo/structured-data";
import type { Product } from "@/types";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

// ISR: Align with cache-constants so admin-uploaded products appear quickly
export const revalidate = CACHE_REVALIDATE_PRODUCTS;

/**
 * Generate metadata from real category (Admin → Categories).
 */
export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    if (slug === 'all') {
      return {
        title: 'All Products | Extreme Dept Kidz',
        description: 'Browse all premium kids fashion. New arrivals, boys, girls, and essentials.',
        keywords: ['all products', 'kids fashion', 'premium children\'s clothing', 'luxury kids fashion'],
        alternates: { canonical: 'https://extremedeptkidz.com/collections/all' },
      };
    }
    const categories = await getAllCategories();
    const category = categories.find((c) => c.slug === slug && c.isActive);

    if (!category) {
      return { title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} | Extreme Dept Kidz` };
    }

    const name = category.name;
    const description = category.description ?? `Shop ${name} at Extreme Dept Kidz.`;

    return {
      title: `${name} | Extreme Dept Kidz`,
      description,
      keywords: [name, "luxury kids fashion", "premium children's clothing", "kids fashion collection"],
      alternates: { canonical: `https://extremedeptkidz.com/collections/${slug}` },
      openGraph: {
        title: `${name} | Extreme Dept Kidz`,
        description,
        url: `https://extremedeptkidz.com/collections/${slug}`,
        images: [{ url: "https://extremedeptkidz.com/og-image.jpg", width: 1200, height: 630, alt: name }],
      },
    };
  } catch (error) {
    console.error(`[generateMetadata] Error generating metadata:`, error);
    return { title: "Collection | Extreme Dept Kidz" };
  }
}

/**
 * Collection Page
 *
 * Uses real categories (Admin → Categories). Products come from getProductsByCategory(slug).
 */
export default async function CollectionPage({ params }: CollectionPageProps): Promise<JSX.Element> {
  const { slug } = await params;

  try {
    // "All" collection: show all products (no category filter)
    if (slug === 'all') {
      const isBuildTime =
        process.env.NEXT_PHASE === 'phase-production-build' ||
        process.env.npm_lifecycle_event === 'build';
      const getCachedAllProducts = unstable_cache(
        async () => getAllProducts(),
        ['products-all'],
        { tags: [CACHE_TAGS.products, CACHE_TAGS.collections], revalidate: CACHE_REVALIDATE_PRODUCTS }
      );
      let products = await getCachedAllProducts();
      // Bypass stale empty cache at runtime (same as homepage)
      if (products.length === 0 && process.env.NODE_ENV === 'production' && !isBuildTime) {
        try {
          const fresh = await getAllProducts();
          if (fresh.length > 0) products = fresh;
        } catch {
          // keep []
        }
      }
      const collectionInfo = {
        name: 'All Products',
        description: 'Browse all products',
        image: undefined as string | undefined,
        metadata: undefined as Record<string, unknown> | undefined,
      };
      const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Collections', url: '/collections' },
        { name: 'All Products', url: '/collections/all' },
      ]);
      const serializedProducts = products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: typeof product.price === 'number' ? product.price : Number(product.price),
        originalPrice: product.originalPrice ? (typeof product.originalPrice === 'number' ? product.originalPrice : Number(product.originalPrice)) : undefined,
        sku: product.sku,
        inStock: Boolean(product.inStock),
        category: {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        },
        images: product.images.map((img) => ({
          url: img.url,
          alt: img.alt,
          isPrimary: Boolean(img.isPrimary),
        })),
        sizes: product.sizes.map((size) => ({
          size: size.size,
          inStock: Boolean(size.inStock),
        })),
        tags: product.tags || [],
        weight: product.weight,
        dimensions: product.dimensions,
        metadata: product.metadata,
        createdAt: product.createdAt ? (typeof product.createdAt === 'string' ? product.createdAt : product.createdAt.toISOString()) : undefined,
        updatedAt: product.updatedAt ? (typeof product.updatedAt === 'string' ? product.updatedAt : product.updatedAt.toISOString()) : undefined,
      }));
      return (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
          <Suspense fallback={<div className="min-h-screen bg-cream-50 pt-24 pb-16"><div className="container mx-auto px-4 animate-pulse space-y-8"><div className="h-8 bg-cream-200 rounded w-1/3" /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{Array.from({ length: 8 }).map((_, i) => (<div key={i} className="space-y-4"><div className="aspect-square bg-cream-200 rounded-lg" /><div className="h-4 bg-cream-200 rounded w-3/4" /><div className="h-4 bg-cream-200 rounded w-1/2" /></div>))}</div></div></div>}>
            <CollectionPageClient params={{ slug }} products={serializedProducts} collectionInfo={collectionInfo} />
          </Suspense>
        </>
      );
    }

    // Use unstable_cache with tags for efficient cache invalidation
    // CRITICAL: Cache keys must match the tags used in revalidation
    const getCachedCategories = unstable_cache(
      async () => {
        const categories = await getAllCategories();
        if (process.env.NODE_ENV === 'development') {
          console.log(`[CollectionPage] Fetched ${categories.length} categories for cache`);
        }
        return categories;
      },
      [`categories-${slug}`],
      {
        tags: [CACHE_TAGS.categories, CACHE_TAGS.collections, CACHE_TAGS.category(slug)],
        revalidate: CACHE_REVALIDATE_PRODUCTS,
      }
    );

    const getCachedProducts = unstable_cache(
      async () => {
        const products = await getProductsByCategory(slug);
        if (process.env.NODE_ENV === 'development') {
          console.log(`[CollectionPage] Fetched ${products.length} products for cache (category: ${slug})`);
          if (products.length > 0) {
            console.log(`[CollectionPage] Products:`, products.map(p => p.name));
          }
        }
        return products;
      },
      [`products-${slug}`],
      {
        tags: [CACHE_TAGS.products, CACHE_TAGS.category(slug), CACHE_TAGS.collection(slug)],
        revalidate: CACHE_REVALIDATE_PRODUCTS,
      }
    );

    const [categories, productsByCategory] = await Promise.all([
      getCachedCategories(),
      getCachedProducts(),
    ]);

    const category = categories.find((c) => c.slug === slug && c.isActive);
    let products: Product[] = productsByCategory;

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CollectionPage] Loading collection: ${slug}`);
      console.log(`[CollectionPage] Category found:`, category ? `${category.name} (${category.slug})` : 'none');
      console.log(`[CollectionPage] Products from getProductsByCategory:`, productsByCategory.length);
    }

    // When no products from category: use tag/collection fallback (e.g. new-arrivals by "new" tag)
    // Also when slug is new-arrivals and category has 0 products (products assigned to Boys only)
    if (products.length === 0) {
      try {
        const all = await getAllProducts();
        const fallbackProducts = getProductsByCollection(all, slug);
        if (fallbackProducts.length > 0) {
          products = fallbackProducts;
        } else if (slug === 'new-arrivals' && all.length > 0) {
          // New Arrivals with 0 tagged "new": show all products (newest first) so page isn't empty
          products = [...all].sort((a, b) => {
            const aT = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bT = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bT - aT;
          });
        }
        if (process.env.NODE_ENV === 'development') {
          console.log(`[CollectionPage] Fallback products for ${slug}:`, products.length);
        }
      } catch (fallbackError) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`[CollectionPage] Error fetching fallback products for ${slug}:`, fallbackError);
        }
        products = [];
      }
    }

    const collectionInfo = category
      ? { 
          name: category.name, 
          description: category.description ?? undefined,
          image: category.image ?? undefined,
          metadata: category.metadata ? (typeof category.metadata === 'object' ? category.metadata as Record<string, unknown> : undefined) : undefined,
        }
      : undefined;

    // Generate breadcrumb structured data
    const breadcrumbSchema = category
      ? generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Collections", url: "/collections" },
          { name: category.name, url: `/collections/${category.slug}` },
        ])
      : null;

    // Serialize data to prevent hydration issues
    // Convert Dates to strings, ensure numbers are numbers, etc.
    const serializedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: typeof product.price === 'number' ? product.price : Number(product.price),
      originalPrice: product.originalPrice ? (typeof product.originalPrice === 'number' ? product.originalPrice : Number(product.originalPrice)) : undefined,
      sku: product.sku,
      inStock: Boolean(product.inStock),
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
      },
      images: product.images.map((img) => ({
        url: img.url,
        alt: img.alt,
        isPrimary: Boolean(img.isPrimary),
      })),
      sizes: product.sizes.map((size) => ({
        size: size.size,
        inStock: Boolean(size.inStock),
      })),
      tags: product.tags || [],
      weight: product.weight,
      dimensions: product.dimensions,
      metadata: product.metadata,
      createdAt: product.createdAt ? (typeof product.createdAt === 'string' ? product.createdAt : product.createdAt.toISOString()) : undefined,
      updatedAt: product.updatedAt ? (typeof product.updatedAt === 'string' ? product.updatedAt : product.updatedAt.toISOString()) : undefined,
    }));

    // CRITICAL: Streaming SSR with optimized Suspense boundary
    // Uses proper skeleton to prevent layout shift
    return (
      <>
        {breadcrumbSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
          />
        )}
        <Suspense
          fallback={
          <div className="min-h-screen bg-cream-50 pt-24 pb-16">
            <div className="container mx-auto px-4">
              <div className="animate-pulse space-y-8">
                {/* Header skeleton */}
                <div className="h-8 bg-cream-200 rounded w-1/3" />
                {/* Product grid skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-4">
                      <div className="aspect-square bg-cream-200 rounded-lg" />
                      <div className="h-4 bg-cream-200 rounded w-3/4" />
                      <div className="h-4 bg-cream-200 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        }
        key={`collection-${slug}`}
      >
        <CollectionPageClient
          params={{ slug }}
          products={serializedProducts}
          collectionInfo={collectionInfo}
        />
      </Suspense>
      </>
    );
  } catch (error) {
    console.error(`[CollectionPage] Error loading collection ${slug}:`, error);
    
    // Return error state with empty products
    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        }
      >
        <CollectionPageClient
          params={{ slug }}
          products={[]}
          collectionInfo={undefined}
        />
      </Suspense>
    );
  }
}
