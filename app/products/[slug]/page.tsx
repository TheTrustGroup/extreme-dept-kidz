import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductPageClient } from "./ProductPageClient";
import { getProductBySlug, getAllProducts } from "@/lib/db";
import { generateProductSchema, generateBreadcrumbSchema } from "@/lib/seo/structured-data";
import { CACHE_TAGS } from "@/lib/utils/cache-revalidation";
import { CACHE_REVALIDATE_PRODUCTS } from "@/lib/utils/cache-constants";
import { unstable_cache } from "next/cache";
import type { Product } from "@/types";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// ISR: Align with cache-constants so new products show immediately
export const revalidate = CACHE_REVALIDATE_PRODUCTS;

// Allow dynamic generation for slugs not pre-generated (new products)
export const dynamicParams = true;

/**
 * Pre-generate a subset of product pages at build; others generated on demand (dynamicParams = true)
 */
export async function generateStaticParams() {
  try {
    const products = await getAllProducts();
    const slugs = products.slice(0, 50).map((p) => ({ slug: p.slug }));
    if (process.env.NODE_ENV === "development") {
      console.log("[ProductPage] generateStaticParams: pre-generating", slugs.length, "product slugs");
    }
    return slugs;
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[ProductPage] generateStaticParams failed, all product pages will be generated on demand:", e);
    }
    return [];
  }
}

/**
 * Fetch product with cache tags so on-demand revalidation (admin create/update) invalidates correctly.
 * SEV-1 FIX: When cache returns null, bypass cache and read from DB once. Prevents false
 * "no longer available" when product was just created but a stale null was cached (e.g. prefetch
 * before create, or revalidation not yet propagated to edge).
 */
async function getCachedProduct(slug: string): Promise<Product | null> {
  if (process.env.NODE_ENV === "development") {
    console.log("[ProductPage] Fetching product with slug:", slug);
  }
  const getProduct = unstable_cache(
    async () => getProductBySlug(slug),
    ["product", slug],
    { tags: [CACHE_TAGS.product(slug), CACHE_TAGS.products], revalidate: CACHE_REVALIDATE_PRODUCTS }
  );
  let product = await getProduct();
  // CRITICAL: Bypass stale null — product may have been created after cache was populated
  if (product === null) {
    const fresh = await getProductBySlug(slug);
    if (fresh) {
      product = fresh;
      if (process.env.NODE_ENV === "development") {
        console.log("[ProductPage] Bypassed stale null, product found in DB:", fresh.name);
      }
    }
  }
  if (process.env.NODE_ENV === "development") {
    console.log("[ProductPage] Product found:", !!product, product ? product.name : "(none)");
  }
  return product;
}

/**
 * Generate metadata for product page
 */
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCachedProduct(slug);

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
 * Uses same cache tags as list so admin create/update revalidation shows new products immediately.
 */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getCachedProduct(slug);

  if (!product) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[ProductPage] Product not found for slug:", slug);
    }
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

