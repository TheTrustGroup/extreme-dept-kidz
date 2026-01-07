import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { generateWebsiteSchema, generateOrganizationSchema } from "@/lib/seo/structured-data";

// Dynamically import home sections for code splitting
const HeroSection = dynamic(() => import("@/components/home").then((mod) => ({ default: mod.HeroSection })), {
  loading: () => <div className="min-h-screen bg-cream-50" />,
});

const FeaturedCollections = dynamic(() => import("@/components/home").then((mod) => ({ default: mod.FeaturedCollections })));

const ShopByCategory = dynamic(() => import("@/components/home").then((mod) => ({ default: mod.ShopByCategory })));

const EditorialSection = dynamic(() => import("@/components/home").then((mod) => ({ default: mod.EditorialSection })));

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
export default function Home() {
  const websiteSchema = generateWebsiteSchema();
  const organizationSchema = generateOrganizationSchema();

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
      <main className="relative">
        {/* Hero Section - Full viewport height */}
        <HeroSection />

        {/* Featured Collections Section */}
        <FeaturedCollections />

        {/* Shop by Category Section */}
        <ShopByCategory />

        {/* Editorial Lifestyle Section */}
        <EditorialSection />
      </main>
    </>
  );
}
