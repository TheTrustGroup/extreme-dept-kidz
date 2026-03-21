import type { Metadata } from "next";
import { getProducts } from "@/lib/data/products";
import type { Product } from "@/types";
import { generateWebsiteSchema, generateOrganizationSchema } from "@/lib/seo/structured-data";
import HeroSection from "@/components/home/HeroSection";
import TrustBar from "@/components/home/TrustBar";
import JustDroppedClient from "@/components/home/JustDroppedClient";
import ShopByCategory from "@/components/home/ShopByCategory";
import NewsletterSection from "@/components/home/NewsletterSection";
import ClientErrorBoundary from "@/components/ui/ClientErrorBoundary";

/** Home revalidates every 5 minutes (ISR). */
export const revalidate = 300;

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
  alternates: { canonical: "/" },
  openGraph: {
    title: "Extreme Dept Kidz | Luxury Kids Fashion",
    description:
      "Discover luxury kids fashion at Extreme Dept Kidz. Premium clothing and accessories for boys and girls.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    images: [
      {
        url: process.env.NEXT_PUBLIC_SITE_URL
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.jpg`
          : "http://localhost:3000/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Extreme Dept Kidz - Luxury Kids Fashion",
      },
    ],
  },
};

async function getNewArrivals(): Promise<Product[]> {
  try {
    const all = await getProducts({ storefrontOnly: true });
    const sorted = [...all].sort((a, b) => {
      const aAt = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bAt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bAt - aAt;
    });
    return sorted.slice(0, 8);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [newArrivals, websiteSchema, organizationSchema] = await Promise.all([
    getNewArrivals(),
    Promise.resolve(generateWebsiteSchema()),
    Promise.resolve(generateOrganizationSchema()),
  ]);

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
      <main className="bg-luxury-cream">
        <HeroSection />
        <TrustBar />
        <ClientErrorBoundary message="Unable to load new arrivals.">
          <JustDroppedClient products={newArrivals} />
        </ClientErrorBoundary>
        <ClientErrorBoundary message="Unable to load collections.">
          <ShopByCategory />
        </ClientErrorBoundary>
        <NewsletterSection />
      </main>
    </>
  );
}
