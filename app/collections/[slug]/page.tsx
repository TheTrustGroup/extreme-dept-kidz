import type { Metadata } from "next";
import { Suspense } from "react";
import { CollectionPageClient } from "./CollectionPageClient";
import { getAllCategories, getAllProducts, getProductsByCategory } from "@/lib/db";
import { getProductsByCollection } from "@/lib/utils/filter-products";
import { CACHE_TAGS } from "@/lib/utils/cache-revalidation";
import { unstable_cache } from "next/cache";
import type { Product } from "@/types";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

// ISR: Revalidate collection pages every 60 seconds, or on-demand via tags
// This allows products to appear quickly after admin upload while maintaining freshness
export const revalidate = 60;

/**
 * Generate metadata from real category (Admin → Categories).
 */
export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
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
        revalidate: 60,
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
        revalidate: 60,
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

    if (products.length === 0 && !category) {
      try {
        const all = await getAllProducts();
        products = getProductsByCollection(all, slug);
        if (process.env.NODE_ENV === 'development') {
          console.log(`[CollectionPage] Fallback products from getProductsByCollection:`, products.length);
        }
      } catch (fallbackError) {
        // CRITICAL: Only log errors in development to prevent console errors in production
        if (process.env.NODE_ENV === 'development') {
          console.error(`[CollectionPage] Error fetching fallback products for ${slug}:`, fallbackError);
        }
        // Continue with empty products array
        products = [];
      }
    }

    const collectionInfo = category
      ? { name: category.name, description: category.description ?? undefined }
      : undefined;

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
