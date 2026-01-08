import type { Product } from "@/types";

/**
 * Generate Product structured data (JSON-LD)
 */
export function generateProductSchema(product: Product): Record<string, unknown> {
  const price = (product.price / 100).toFixed(2);
  const allImages = product.images.map((img) => img.url);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: allImages,
    brand: {
      "@type": "Brand",
      name: "Extreme Dept Kidz",
    },
    category: product.category.name,
    offers: {
      "@type": "Offer",
      url: `https://extremedeptkidz.com/products/${product.slug}`,
      priceCurrency: "GHS",
      price: price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      availabilityStarts: new Date().toISOString(),
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "127",
    },
    sku: product.id,
    mpn: product.id,
    ...(product.sizes && product.sizes.length > 0 && {
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "GH",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    }),
  };
}

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Extreme Dept Kidz",
    url: "https://extremedeptkidz.com",
    logo: "https://extremedeptkidz.com/logo.png",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-800-555-1234",
      contactType: "customer service",
      email: "hello@extremedeptkidz.com",
      areaServed: "GH",
      availableLanguage: ["en"],
    },
    sameAs: [
      "https://www.instagram.com/extremedeptkidz",
      "https://www.tiktok.com/@extremedeptkidz",
    ],
  };
}

/**
 * Generate Website structured data with search action
 */
export function generateWebsiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Extreme Dept Kidz",
    url: "https://extremedeptkidz.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://extremedeptkidz.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://extremedeptkidz.com${item.url}`,
    })),
  };
}

