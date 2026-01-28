import type { Metadata } from "next";
import { Suspense } from "react";
import { CollectionPageClient } from "./CollectionPageClient";
import { getAllCategories, getAllProducts, getProductsByCategory } from "@/lib/db";
import { getProductsByCollection } from "@/lib/utils/filter-products";
import type { Product } from "@/types";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

// Disable static generation to prevent hydration issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Generate metadata from real category (Admin → Categories).
 */
export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const categories = await getAllCategories();
    const category = categories.find((c) => c.slug === slug && c.isActive);

    if (!category) {
      return { title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} | Extreme Dept Kidz` };
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
  } catch (error) {
    console.error(`[generateMetadata] Error generating metadata:`, error);
    return { title: "Collection | Extreme Dept Kidz" };
  }
}

/**
 * Collection Page
 *
 * Uses real categories (Admin → Categories). Products come from getProductsByCategory(slug).
 */
export default async function CollectionPage({ params }: CollectionPageProps): Promise<JSX.Element> {
  const { slug } = await params;

  try {
    const [categories, productsByCategory] = await Promise.all([
      getAllCategories(),
      getProductsByCategory(slug),
    ]);

    const category = categories.find((c) => c.slug === slug && c.isActive);
    let products: Product[] = productsByCategory;

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CollectionPage] Loading collection: ${slug}`);
      console.log(`[CollectionPage] Category found:`, category ? `${category.name} (${category.slug})` : 'none');
      console.log(`[CollectionPage] Products from getProductsByCategory:`, productsByCategory.length);
    }

    if (products.length === 0 && !category) {
      try {
        const all = await getAllProducts();
        products = getProductsByCollection(all, slug);
        if (process.env.NODE_ENV === 'development') {
          console.log(`[CollectionPage] Fallback products from getProductsByCollection:`, products.length);
        }
      } catch (fallbackError) {
        console.error(`[CollectionPage] Error fetching fallback products for ${slug}:`, fallbackError);
        // Continue with empty products array
        products = [];
      }
    }

    const collectionInfo = category
      ? { name: category.name, description: category.description ?? undefined }
      : undefined;

    // Serialize data to prevent hydration issues
    // Convert Dates to strings, ensure numbers are numbers, etc.
    const serializedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: typeof product.price === 'number' ? product.price : Number(product.price),
      originalPrice: product.originalPrice ? (typeof product.originalPrice === 'number' ? product.originalPrice : Number(product.originalPrice)) : undefined,
      sku: product.sku,
      inStock: Boolean(product.inStock),
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
      },
      images: product.images.map((img) => ({
        url: img.url,
        alt: img.alt,
        isPrimary: Boolean(img.isPrimary),
      })),
      sizes: product.sizes.map((size) => ({
        size: size.size,
        inStock: Boolean(size.inStock),
      })),
      tags: product.tags || [],
      weight: product.weight,
      dimensions: product.dimensions,
      metadata: product.metadata,
      createdAt: product.createdAt ? (typeof product.createdAt === 'string' ? product.createdAt : product.createdAt.toISOString()) : undefined,
      updatedAt: product.updatedAt ? (typeof product.updatedAt === 'string' ? product.updatedAt : product.updatedAt.toISOString()) : undefined,
    }));

    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        }
      >
        <CollectionPageClient
          params={{ slug }}
          products={serializedProducts}
          collectionInfo={collectionInfo}
        />
      </Suspense>
    );
  } catch (error) {
    console.error(`[CollectionPage] Error loading collection ${slug}:`, error);
    
    // Return error state with empty products
    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        }
      >
        <CollectionPageClient
          params={{ slug }}
          products={[]}
          collectionInfo={undefined}
        />
      </Suspense>
    );
  }
}
