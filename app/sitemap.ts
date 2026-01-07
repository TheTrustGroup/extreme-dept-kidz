import type { MetadataRoute } from "next";
import { mockProducts, mockCollections } from "@/lib/mock-data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://extremedeptkidz.com";

export default function sitemap(): MetadataRoute.Sitemap {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/cart`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  // Collection pages
  const collectionPages: MetadataRoute.Sitemap = mockCollections.map(
    (collection) => ({
      url: `${SITE_URL}/collections/${collection.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    })
  );

  // Product pages
  const productPages: MetadataRoute.Sitemap = mockProducts.map((product) => ({
    url: `${SITE_URL}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...collectionPages, ...productPages];
}

