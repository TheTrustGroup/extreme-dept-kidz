import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPageClient } from "./ProductPageClient";
import { mockProducts } from "@/lib/mock-data";
import { generateProductSchema, generateBreadcrumbSchema } from "@/lib/seo/structured-data";
import type { Product } from "@/types";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

/**
 * Get product by slug
 */
function getProductBySlug(slug: string): Product | undefined {
  return mockProducts.find((product) => product.slug === slug);
}

/**
 * Generate metadata for product page
 */
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = getProductBySlug(params.slug);

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
export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  // Generate structured data
  const productSchema = generateProductSchema(product);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Collections", url: "/collections" },
    { name: product.category.name, url: `/categories/${product.category.slug}` },
    { name: product.name, url: `/products/${product.slug}` },
  ]);

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
      <ProductPageClient product={product} />
    </>
  );
}

