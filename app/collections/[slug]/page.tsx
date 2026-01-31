import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryHero } from "@/components/categories";
import { CollectionPageClient } from "./CollectionPageClient";
import { getAllCategories } from "@/lib/db";
import { getProducts, getProductsByCategory } from "@/lib/data/products";
import { getProductsByCollection } from "@/lib/utils/filter-products";
import { generateBreadcrumbSchema } from "@/lib/seo/structured-data";
import type { Product } from "@/types";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

/** PHASE 9 — Safe ISR: Collection/category pages revalidate every 60s. Product detail stays dynamic. */
export const revalidate = 60;

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
    // "All" collection: show all products (no category filter) — fully dynamic SSR
    if (slug === 'all') {
      const products = await getProducts({ storefrontOnly: true });
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
          <div className="min-h-screen bg-luxury-cream">
            <CategoryHero
              title={collectionInfo.name}
              description={collectionInfo.description}
              productCount={serializedProducts.length}
              backgroundImage={collectionInfo.image}
            />
            <div className="container-luxury section-padding">
              <Suspense fallback={<div className="animate-pulse space-y-6"><div className="h-8 bg-luxury-cream-300/50 rounded w-1/3" /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{Array.from({ length: 8 }).map((_, i) => (<div key={i} className="space-y-4"><div className="aspect-[4/5] bg-luxury-cream-300/50 rounded-lg" /><div className="h-4 bg-luxury-cream-300/50 rounded w-3/4" /><div className="h-4 bg-luxury-cream-300/50 rounded w-1/2" /></div>))}</div></div>}>
                <CollectionPageClient params={{ slug }} products={serializedProducts} collectionInfo={collectionInfo} skipHero />
              </Suspense>
            </div>
          </div>
        </>
      );
    }

    // Fully dynamic SSR: direct DB calls, no cache
    const [categories, productsByCategory] = await Promise.all([
      getAllCategories(),
      getProductsByCategory(slug, { storefrontOnly: true }),
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
        const all = await getProducts({ storefrontOnly: true });
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

    const heroTitle = collectionInfo?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1);
    const heroDescription = collectionInfo?.description;
    const heroImage = collectionInfo?.image;

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
        <div className="min-h-screen bg-luxury-cream">
          <CategoryHero
            title={heroTitle}
            description={heroDescription}
            productCount={serializedProducts.length}
            backgroundImage={heroImage}
          />
          <div className="container-luxury section-padding">
            <Suspense
              fallback={
                <div className="animate-pulse space-y-6">
                  <div className="h-8 bg-luxury-cream-300/50 rounded w-1/3" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="space-y-4">
                        <div className="aspect-[4/5] bg-luxury-cream-300/50 rounded-lg" />
                        <div className="h-4 bg-luxury-cream-300/50 rounded w-3/4" />
                        <div className="h-4 bg-luxury-cream-300/50 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                </div>
              }
              key={`collection-${slug}`}
            >
              <CollectionPageClient
                params={{ slug }}
                products={serializedProducts}
                collectionInfo={collectionInfo}
                skipHero
              />
            </Suspense>
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error(`[CollectionPage] Error loading collection ${slug}:`, error);

    // Return error state with empty products
    const fallbackTitle = slug.charAt(0).toUpperCase() + slug.slice(1);
    return (
      <div className="min-h-screen bg-luxury-cream">
        <CategoryHero title={fallbackTitle} productCount={0} />
        <div className="container-luxury section-padding">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-navy"></div>
              </div>
            }
          >
            <CollectionPageClient
              params={{ slug }}
              products={[]}
              collectionInfo={undefined}
              skipHero
            />
          </Suspense>
        </div>
      </div>
    );
  }
}
