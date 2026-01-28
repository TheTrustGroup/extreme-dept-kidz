import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { generateWebsiteSchema, generateOrganizationSchema } from "@/lib/seo/structured-data";
import { getAllProducts } from "@/lib/db";
import type { Product } from "@/types";
import { HeroSection } from "@/components/home";
import { TrustBar } from "@/components/home";
import { CACHE_TAGS } from "@/lib/utils/cache-revalidation";
import { unstable_cache } from "next/cache";

// Hero + TrustBar in main bundle so above-the-fold is fast and never static/blank

const NewArrivalsSection = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.NewArrivalsSection })), {
  ssr: true, // Render with page so content isn’t blank on first view
});

const ShopByStyleSection = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.ShopByStyleSection })), {
  ssr: true,
});

const FeaturedCollections = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.FeaturedCollections })), {
  ssr: true,
});

const EditorialSection = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.EditorialSection })), {
  ssr: true,
});

const GirlsCollectionSection = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.GirlsCollectionSection })), {
  ssr: true,
});

const StyleGuideSection = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.StyleGuideSection })), {
  ssr: true,
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
    console.error('Failed to fetch products for homepage:', error);
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

        {/* New Arrivals Section - Boys Focused */}
        <NewArrivalsSection products={products} />

        {/* Shop by Style Section - Boys Categories */}
        <ShopByStyleSection />

        {/* Featured Collections Section */}
        <FeaturedCollections />

        {/* Editorial Lifestyle Section - "The EXTREME DEPT Boy" */}
        <EditorialSection />

        {/* Girls Collection Section - Secondary, Smaller */}
        <GirlsCollectionSection products={products} />

        {/* Style Guide Section - Featured Complete Looks */}
        <StyleGuideSection />
      </div>
    </>
  );
}
