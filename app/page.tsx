import type { Metadata } from "next";
import { Suspense } from "react";
import nextDynamic from "next/dynamic";
import { generateWebsiteSchema, generateOrganizationSchema } from "@/lib/seo/structured-data";
import { getAllProducts } from "@/lib/db";
import type { Product } from "@/types";
import { HeroSection } from "@/components/home";
import { TrustBar } from "@/components/home";
import { CACHE_TAGS } from "@/lib/utils/cache-revalidation";
import { unstable_cache } from "next/cache";
import { StreamingSkeleton } from "@/components/ui/StreamingSkeleton";
import { SmartImagePrefetch } from "@/components/ui/SmartImagePrefetch";

// Hero + TrustBar in main bundle so above-the-fold is fast and never static/blank

const NewArrivalsSection = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.NewArrivalsSection })), {
  ssr: true, // Render with page so content isn’t blank on first view
});

const ShopByStyleSection = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.ShopByStyleSection })), {
  ssr: true, // SSR enabled for streaming
  loading: () => <StreamingSkeleton variant="section" height="h-96" />,
});

const ShopByCategory = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.ShopByCategory })), {
  ssr: true, // SSR enabled for streaming
  loading: () => <StreamingSkeleton variant="section" height="h-96" />,
});

const FeaturedCollections = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.FeaturedCollections })), {
  ssr: true, // SSR enabled for streaming
  loading: () => <StreamingSkeleton variant="section" height="h-96" />,
});

const EditorialSection = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.EditorialSection })), {
  ssr: true, // SSR enabled for streaming
  loading: () => <StreamingSkeleton variant="section" height="h-[600px]" />,
});

const GirlsCollectionSection = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.GirlsCollectionSection })), {
  ssr: true, // SSR enabled for streaming
  loading: () => <StreamingSkeleton variant="product-grid" />,
});

const StyleGuideSection = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.StyleGuideSection })), {
  ssr: true, // SSR enabled for streaming
  loading: () => <StreamingSkeleton variant="section" height="h-96" />,
});

// ISR: Revalidate homepage every 60 seconds, or on-demand via tags
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Extreme Dept Kidz | Luxury Kids Fashion",
  description:
    "Discover luxury kids fashion at Extreme Dept Kidz. Premium clothing and accessories for boys and girls. New arrivals, exclusive collections, and timeless style.",
  keywords: [
    "luxury kids fashion",
    "premium children's clothing",
    "kids fashion brand",
    "boys clothing",
    "girls clothing",
    "designer kids wear",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Extreme Dept Kidz | Luxury Kids Fashion",
    description:
      "Discover luxury kids fashion at Extreme Dept Kidz. Premium clothing and accessories for boys and girls.",
    url: "https://extremedeptkidz.com",
    images: [
      {
        url: "https://extremedeptkidz.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Extreme Dept Kidz - Luxury Kids Fashion",
      },
    ],
  },
};

/**
 * Home Page
 * 
 * Composes all home page sections:
 * - HeroSection: Full viewport hero with parallax
 * - FeaturedCollections: 3-column collections grid
 * - ShopByCategory: 2x2 category grid
 * - EditorialSection: Split-screen lifestyle editorial
 */
export default async function Home() {
  const websiteSchema = generateWebsiteSchema();
  const organizationSchema = generateOrganizationSchema();

  // Fetch products from database to display on homepage
  // Performance: Tagged for efficient cache invalidation
  // Build-time resilient: getAllProducts now handles build-time failures gracefully
  let products: Product[] = [];
  try {
    // Use unstable_cache for ISR with tag-based revalidation
    // getAllProducts will fallback to mock data during build if DB unavailable
    const getCachedProducts = unstable_cache(
      async () => getAllProducts(),
      ['homepage-products'],
      {
        tags: [CACHE_TAGS.products, CACHE_TAGS.homepage],
        revalidate: 60,
      }
    );
    
    products = await getCachedProducts();
  } catch (error) {
    // Fallback: Continue with empty array - components will use mock data as fallback
    // This should rarely happen now that getAllProducts handles build-time failures
    // Performance: Error logging handled by error boundary
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to fetch products for homepage:', error);
    }
    products = [];
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <div className="relative">
        {/* Hero Section - Full viewport height, seamless with header */}
        <HeroSection />

        {/* Trust Bar - Prominent trust signals for first-time visitors */}
        <TrustBar />

        {/* CRITICAL: Streaming SSR with proper Suspense boundaries */}
        {/* Progressive rendering: LCP elements (Hero) render first, rest streams in */}
        {/* Each Suspense boundary enables independent streaming of sections */}
        
        {/* New Arrivals Section - Above fold, critical for engagement */}
        <Suspense 
          fallback={<StreamingSkeleton variant="product-grid" />}
          key="new-arrivals"
        >
          <NewArrivalsSection products={products} />
        </Suspense>

        {/* Shop by Style Section - Above fold, category navigation */}
        <Suspense 
          fallback={<StreamingSkeleton variant="section" height="h-96" />}
          key="shop-by-style"
        >
          <ShopByStyleSection />
        </Suspense>

        {/* Shop by Category Section - Real categories from database */}
        <Suspense 
          fallback={<StreamingSkeleton variant="section" height="h-96" />}
          key="shop-by-category"
        >
          <ShopByCategory />
        </Suspense>

        {/* Featured Collections Section - Below fold, can stream */}
        <Suspense 
          fallback={<StreamingSkeleton variant="section" height="h-96" />}
          key="featured-collections"
        >
          <FeaturedCollections />
        </Suspense>

        {/* Editorial Lifestyle Section - Below fold, can stream */}
        <Suspense 
          fallback={<StreamingSkeleton variant="section" height="h-[600px]" />}
          key="editorial"
        >
          <EditorialSection />
        </Suspense>

        {/* Girls Collection Section - Below fold, can stream */}
        <Suspense 
          fallback={<StreamingSkeleton variant="product-grid" />}
          key="girls-collection"
        >
          <GirlsCollectionSection products={products} />
        </Suspense>

        {/* Style Guide Section - Below fold, can stream */}
        <Suspense 
          fallback={<StreamingSkeleton variant="section" height="h-96" />}
          key="style-guide"
        >
          <StyleGuideSection />
        </Suspense>
        
        {/* CRITICAL: Smart prefetching for homepage product images */}
        {/* Prefetches images when they're near viewport for instant loading */}
        <SmartImagePrefetch
          imageUrls={products
            .slice(0, 12) // Prefetch first 12 products on homepage
            .flatMap((product) => [
              product.images[0]?.url,
              product.images[1]?.url, // Secondary images
            ])
            .filter((url): url is string => !!url)}
          prefetchDistance={200}
          maxConcurrent={3}
          enabled={products.length > 0}
        />
      </div>
    </>
  );
}
