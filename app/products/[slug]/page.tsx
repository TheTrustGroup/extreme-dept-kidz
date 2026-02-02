import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductPageClient } from "./ProductPageClient";
import { getProductBySlug, getProducts } from "@/lib/data/products";
import { getCompleteLooksForProduct } from "@/lib/data/complete-looks";
import { generateProductSchema, generateBreadcrumbSchema } from "@/lib/seo/structured-data";
import type { Product } from "@/types";

/**
 * PHASE 1 — Bulletproof commerce: product detail is ALWAYS server-rendered.
 * UI → Server Component → DB only. No ISR, no client fetch, no revalidation.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/** Generate metadata — direct server fetch, no cache. */
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug, { storefrontOnly: true });

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const images = product.images ?? [];
  const primaryImage = images.find((img) => img.isPrimary) ?? images[0];
  const imageUrl = primaryImage?.url;

  const metadata: Metadata = {
    title: `${product.name} | Extreme Dept Kidz`,
    description: product.description ?? undefined,
    keywords: [
      product.name,
      product.category?.name ?? "Product",
      "luxury kids fashion",
      "premium children's clothing",
      ...(product.tags ?? []),
    ],
    alternates: {
      canonical: process.env.NEXT_PUBLIC_SITE_URL 
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`
        : `http://localhost:3000/products/${product.slug}`,
    },
  };

  if (imageUrl) {
    metadata.openGraph = {
      title: `${product.name} | Extreme Dept Kidz`,
      description: product.description ?? undefined,
      type: "website",
      images: [{ url: imageUrl, width: 1200, height: 1200, alt: product.name }],
    };
    metadata.twitter = {
      card: "summary_large_image",
      title: `${product.name} | Extreme Dept Kidz`,
      description: product.description ?? undefined,
      images: [imageUrl],
    };
  }

  return metadata;
}

/**
 * Product Detail Page — Server Component only.
 * Product fetched directly here; no ISR, no fallback, no client fetch.
 */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug, { storefrontOnly: true });

  if (!product) {
    notFound();
  }

  let allProducts: Product[] = [];
  let completeLooks: Awaited<ReturnType<typeof getCompleteLooksForProduct>> = [];
  try {
    [allProducts, completeLooks] = await Promise.all([
      getProducts({ storefrontOnly: true }),
      getCompleteLooksForProduct(product.id).catch(() => []),
    ]);
  } catch {
    // Non-fatal: render PDP with empty related data
  }

  const category = product.category ?? { name: "Product", slug: "all" };
  const productSchema = generateProductSchema(product);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Collections", url: "/collections" },
    { name: category.name, url: `/collections/${category.slug}` },
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
        <ProductPageClient product={product} allProducts={allProducts} completeLooks={completeLooks} />
      </Suspense>
    </>
  );
}

