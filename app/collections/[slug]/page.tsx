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
  const collection = mockCollections.find((c) => c.slug === params.slug);

  if (!collection) {
    return {
      title: "Collection Not Found | Extreme Dept Kidz",
    };
  }

  return {
    title: `${collection.name} | Extreme Dept Kidz`,
    description: collection.description || `Shop ${collection.name} at Extreme Dept Kidz. Premium kids fashion collections.`,
    keywords: [
      collection.name,
      "luxury kids fashion",
      "premium children's clothing",
      "kids fashion collection",
    ],
    alternates: {
      canonical: `https://extremedeptkidz.com/collections/${collection.slug}`,
    },
    openGraph: {
      title: `${collection.name} | Extreme Dept Kidz`,
      description: collection.description || `Shop ${collection.name} at Extreme Dept Kidz.`,
      url: `https://extremedeptkidz.com/collections/${collection.slug}`,
      images: collection.image
        ? [
            {
              url: collection.image,
              width: 1200,
              height: 630,
              alt: collection.name,
            },
          ]
        : [
            {
              url: "https://extremedeptkidz.com/og-image.jpg",
              width: 1200,
              height: 630,
              alt: collection.name,
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
