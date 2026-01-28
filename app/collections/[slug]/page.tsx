import type { Metadata } from "next";
import { CollectionPageClient } from "./CollectionPageClient";
import { getAllCategories, getAllProducts, getProductsByCategory } from "@/lib/db";
import { getProductsByCollection } from "@/lib/utils/filter-products";
import type { Product } from "@/types";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

/**
 * Generate metadata from real category (Admin → Categories).
 */
export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getAllCategories();
  const category = categories.find((c) => c.slug === slug && c.isActive);

  if (!category) {
    return { title: "Collection Not Found | Extreme Dept Kidz" };
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
}

/**
 * Collection Page
 *
 * Uses real categories (Admin → Categories). Products come from getProductsByCategory(slug).
 */
export default async function CollectionPage({ params }: CollectionPageProps): Promise<JSX.Element> {
  const { slug } = await params;

  const [categories, productsByCategory] = await Promise.all([
    getAllCategories(),
    getProductsByCategory(slug),
  ]);

  const category = categories.find((c) => c.slug === slug && c.isActive);
  let products: Product[] = productsByCategory;

  if (products.length === 0 && !category) {
    const all = await getAllProducts();
    products = getProductsByCollection(all, slug);
  }

  const collectionInfo = category
    ? { name: category.name, description: category.description ?? undefined }
    : undefined;

  return (
    <CollectionPageClient
      params={{ slug }}
      products={products}
      collectionInfo={collectionInfo}
    />
  );
}
