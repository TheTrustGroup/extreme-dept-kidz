import type { Metadata } from "next";
import { CollectionPageClient } from "./CollectionPageClient";
import { mockCollections } from "@/lib/mock-data";
import { getAllProducts, getProductsByCategory } from "@/lib/db";
import { getProductsByCollection } from "@/lib/utils/filter-products";
import type { Product } from "@/types";

interface CollectionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic'; // Always fetch fresh products

/**
 * Generate metadata for collection page
 */
export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  // Check if it's a real collection or a category-based collection
  const collection = mockCollections.find((c) => c.slug === slug);
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

  const categoryInfo = categoryMap[slug];
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
      canonical: `https://extremedeptkidz.com/collections/${slug}`,
    },
    openGraph: {
      title: `${collectionName} | Extreme Dept Kidz`,
      description: collectionDescription || `Shop ${collectionName} at Extreme Dept Kidz.`,
      url: `https://extremedeptkidz.com/collections/${slug}`,
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
export default async function CollectionPage({ params }: CollectionPageProps): Promise<JSX.Element> {
  const { slug } = await params;
  
  // Fetch products: category-first (Admin categories drive /collections/[slug])
  // then fallback to tag-based filter for legacy slugs (new-arrivals, etc.)
  let products: Product[] = [];
  try {
    products = await getProductsByCategory(slug);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CollectionPage] getProductsByCategory('${slug}') returned:`, products.length, 'products');
      if (products.length > 0) {
        console.log('  First product:', products[0]?.name, 'category:', products[0]?.category?.name);
      }
    }
    if (products.length === 0) {
      const all = await getAllProducts();
      products = getProductsByCollection(all, slug);
      if (process.env.NODE_ENV === 'development') {
        console.log(`[CollectionPage] Fallback getProductsByCollection('${slug}') returned:`, products.length, 'products');
      }
    }
  } catch (error) {
    console.error('Failed to fetch products for collection:', error);
  }

  return <CollectionPageClient params={{ slug }} products={products} />;
}
