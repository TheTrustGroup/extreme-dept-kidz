import type { Metadata } from "next";
import { Suspense } from "react";
import nextDynamic from "next/dynamic";
import { generateWebsiteSchema, generateOrganizationSchema } from "@/lib/seo/structured-data";
import { getProducts } from "@/lib/data/products";
import type { Product } from "@/types";
import {
  HeroSection,
  FeaturedCollections,
  TrustSection,
  TrustBar,
  JustDroppedSection,
  GirlsCollectionSection,
} from "@/components/home";
import { StreamingSkeleton } from "@/components/ui/StreamingSkeleton";
import {
  sortJustDropped,
  filterJustDropped,
  parseJustDroppedFilter,
} from "@/lib/utils/just-dropped";
import { SmartImagePrefetch } from "@/components/ui/SmartImagePrefetch";
import { CacheDebugPanel } from "@/components/debug/CacheDebugPanel";

// Hero, TrustBar, and "Just dropped" in main bundle so below-hero is never blank
// Shop by Style removed for world-class simplicity — Just dropped + Shop by Category

const ShopByCategory = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.ShopByCategory })), {
  ssr: true, // SSR enabled for streaming
  loading: () => <StreamingSkeleton variant="section" height="h-96" />,
});

const EditorialSection = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.EditorialSection })), {
  ssr: true, // SSR enabled for streaming
  loading: () => <StreamingSkeleton variant="section" height="h-[600px]" />,
});

const StyleGuideSection = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.StyleGuideSection })), {
  ssr: true, // SSR enabled for streaming
  loading: () => <StreamingSkeleton variant="section" height="h-96" />,
});

/** PHASE 9 — Safe ISR: Home revalidates every 60s. Product detail stays dynamic. */
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
interface HomeProps {
  searchParams?: { filter?: string | string[] } | Promise<{ filter?: string | string[] }>;
}

export default async function Home(props: HomeProps) {
  const websiteSchema = generateWebsiteSchema();
  const organizationSchema = generateOrganizationSchema();

  // Resolve searchParams (Next 14 sync; Next 15+ may pass Promise)
  const rawParams = props.searchParams;
  const searchParamsResolved =
    rawParams && typeof (rawParams as Promise<unknown>).then === "function"
      ? (await (rawParams as Promise<{ filter?: string | string[] }>)) as { filter?: string | string[] }
      : ((rawParams ?? {}) as { filter?: string | string[] });

  // Fetch products on server — single source of truth (storefront: only visible on website)
  let products: Product[] = [];
  try {
    products = await getProducts({ storefrontOnly: true });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to fetch products for homepage:", error);
    }
    products = [];
  }

  // Just dropped: server-side filter from URL (?filter=boys|girls|new|all)
  const currentFilter = parseJustDroppedFilter(searchParamsResolved);
  const sorted = sortJustDropped(products);
  const filteredForJustDropped = filterJustDropped(sorted, currentFilter);

  const generatedAt = new Date().toISOString();

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
      <div className="bg-luxury-cream">
        {/* Hero Section - Full viewport height, seamless with header */}
        <HeroSection />

        {/* Featured Collections - Boys / Girls with hero images and Shop CTAs */}
        <FeaturedCollections />

        {/* Trust / Features - Free shipping, returns, secure checkout, premium quality */}
        <TrustSection />

        {/* Trust Bar - Prominent trust signals for first-time visitors */}
        <TrustBar />

        {/* CRITICAL: Streaming SSR with proper Suspense boundaries */}
        {/* Progressive rendering: LCP elements (Hero) render first, rest streams in */}
        {/* Each Suspense boundary enables independent streaming of sections */}
        
        {/* Just dropped: server-rendered, URL-based filter — reliability, speed, clarity */}
        <JustDroppedSection products={filteredForJustDropped} currentFilter={currentFilter} />
        {/* Shop Girls: only when we have girls products — clear purpose, no empty block */}
        <GirlsCollectionSection products={products} />

        {/* Shop by Category — Real categories from database */}
        <Suspense 
          fallback={<StreamingSkeleton variant="section" height="h-96" />}
          key="shop-by-category"
        >
          <ShopByCategory />
        </Suspense>

        {/* Editorial Lifestyle Section - Below fold, can stream */}
        <Suspense 
          fallback={<StreamingSkeleton variant="section" height="h-[600px]" />}
          key="editorial"
        >
          <EditorialSection />
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
      {/* Temporary: remove after fixing caching */}
      <CacheDebugPanel productsCount={products.length} generatedAt={generatedAt} />
    </>
  );
}
