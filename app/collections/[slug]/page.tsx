import type { Metadata } from "next";
import { CollectionPageClient } from "./CollectionPageClient";
import { mockCollections } from "@/lib/mock-data";

interface CollectionPageProps {
  params: {
    slug: string;
  };
}

/**
 * Generate metadata for collection page
 */
export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  // Check if it's a real collection or a category-based collection
  const collection = mockCollections.find((c) => c.slug === params.slug);
  const categoryMap: Record<string, { name: string; description: string }> = {
    "boys": {
      name: "Boys Collection",
      description: "Premium streetwear and luxury essentials for the modern boy.",
    },
    "girls": {
      name: "Girls Collection",
      description: "Select premium styles for girls.",
    },
  };

  const categoryInfo = categoryMap[params.slug];
  const collectionName = collection?.name || categoryInfo?.name;
  const collectionDescription = collection?.description || categoryInfo?.description;

  if (!collection && !categoryInfo) {
    return {
      title: "Collection Not Found | Extreme Dept Kidz",
    };
  }

  return {
    title: `${collectionName} | Extreme Dept Kidz`,
    description: collectionDescription || `Shop ${collectionName} at Extreme Dept Kidz. Premium kids fashion collections.`,
    keywords: [
      collectionName,
      "luxury kids fashion",
      "premium children's clothing",
      "kids fashion collection",
    ],
    alternates: {
      canonical: `https://extremedeptkidz.com/collections/${params.slug}`,
    },
    openGraph: {
      title: `${collectionName} | Extreme Dept Kidz`,
      description: collectionDescription || `Shop ${collectionName} at Extreme Dept Kidz.`,
      url: `https://extremedeptkidz.com/collections/${params.slug}`,
      images: collection?.image
        ? [
            {
              url: collection.image,
              width: 1200,
              height: 630,
              alt: collectionName,
            },
          ]
        : [
            {
              url: "https://extremedeptkidz.com/og-image.jpg",
              width: 1200,
              height: 630,
              alt: collectionName,
            },
          ],
    },
  };
}

/**
 * Collection Page
 * 
 * Displays products for a specific collection with filtering and sorting.
 */
export default function CollectionPage({ params }: CollectionPageProps): JSX.Element {
  return <CollectionPageClient params={params} />;
}
