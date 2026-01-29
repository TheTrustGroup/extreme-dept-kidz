import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductPageClient } from "./ProductPageClient";
import { getProductBySlug, getAllProducts } from "@/lib/db";
import { generateProductSchema, generateBreadcrumbSchema } from "@/lib/seo/structured-data";
import type { Product } from "@/types";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// ISR: Revalidate product pages every 300 seconds (5 min), or on-demand via tags
// This allows products to appear quickly while maintaining freshness
export const revalidate = 300;

/**
 * Generate metadata for product page
 */
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];

  return {
    title: `${product.name} | Extreme Dept Kidz`,
    description: product.description,
    keywords: [
      product.name,
      product.category.name,
      "luxury kids fashion",
      "premium children's clothing",
      ...(product.tags || []),
    ],
    openGraph: {
      title: `${product.name} | Extreme Dept Kidz`,
      description: product.description,
      type: "website",
      images: [
        {
          url: primaryImage.url,
          width: 1200,
          height: 1200,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Extreme Dept Kidz`,
      description: product.description,
      images: [primaryImage.url],
    },
    alternates: {
      canonical: `https://extremedeptkidz.com/products/${product.slug}`,
    },
  };
}

/**
 * Product Detail Page
 * 
 * Premium product page with gallery, info, and related products.
 */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Fetch all products for recommendations
  const allProducts = await getAllProducts();

  // Generate structured data
  const productSchema = generateProductSchema(product);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Collections", url: "/collections" },
    { name: product.category.name, url: `/collections/${product.category.slug}` },
    { name: product.name, url: `/products/${product.slug}` },
  ]);

  // CRITICAL: Streaming SSR - Product page with Suspense boundaries
  // Below-fold sections (RelatedProducts, Reviews) can stream in
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Suspense
        fallback={
          <div className="min-h-screen bg-cream-50 pt-24 pb-16">
            <div className="container mx-auto px-4">
              <div className="animate-pulse space-y-8">
                <div className="h-6 bg-cream-200 rounded w-1/4" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="aspect-square bg-cream-200 rounded-lg" />
                  <div className="space-y-4">
                    <div className="h-8 bg-cream-200 rounded w-3/4" />
                    <div className="h-4 bg-cream-200 rounded w-full" />
                    <div className="h-4 bg-cream-200 rounded w-2/3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        key={`product-${product.slug}`}
      >
        <ProductPageClient product={product} allProducts={allProducts} />
      </Suspense>
    </>
  );
}

