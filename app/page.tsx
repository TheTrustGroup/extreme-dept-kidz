import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { generateWebsiteSchema, generateOrganizationSchema } from "@/lib/seo/structured-data";
import { getAllProducts } from "@/lib/db";
import type { Product } from "@/types";

// Dynamically import home sections for code splitting and performance
const HeroSection = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.HeroSection })), {
  loading: () => <div className="min-h-screen bg-cream-50" />,
  ssr: true, // Hero is above fold, load immediately
});

const TrustBar = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.TrustBar })), {
  ssr: true, // Trust signals are important for first-time visitors
});

const NewArrivalsSection = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.NewArrivalsSection })), {
  ssr: false, // Below fold, can lazy load
});

const ShopByStyleSection = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.ShopByStyleSection })), {
  ssr: false,
});

const FeaturedCollections = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.FeaturedCollections })), {
  ssr: false,
});

const EditorialSection = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.EditorialSection })), {
  ssr: false,
});

const GirlsCollectionSection = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.GirlsCollectionSection })), {
  ssr: false,
});

const StyleGuideSection = nextDynamic(() => import("@/components/home").then((mod) => ({ default: mod.StyleGuideSection })), {
  ssr: false,
});

export const dynamic = 'force-dynamic'; // Always fetch fresh products on homepage

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
  let products: Product[] = [];
  try {
    products = await getAllProducts();
  } catch (error) {
    console.error('Failed to fetch products for homepage:', error);
    // Continue with empty array - components will use mock data as fallback
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
        {/* Hero Section - Full viewport height */}
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
