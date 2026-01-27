import type { MetadataRoute } from "next";
import { getAllProducts, getAllCategories } from "@/lib/db";
import { mockCollections } from "@/lib/mock-data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://extremedeptkidz.com";

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // Fetch collections (using mock for now as collections aren't in DB yet)
  // TODO: Replace with database query when collections are stored in DB
  const collectionPages: MetadataRoute.Sitemap = mockCollections.map(
    (collection) => ({
      url: `${SITE_URL}/collections/${collection.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    })
  );

  // Fetch products from database
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await getAllProducts();
    productPages = products.map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: product.updatedAt || product.createdAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Failed to fetch products for sitemap:', error);
    // Continue with empty product pages if database query fails
  }

  // Fetch categories from database
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await getAllCategories();
    categoryPages = categories
      .filter(cat => cat.isActive)
      .map((category) => ({
        url: `${SITE_URL}/collections/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      }));
  } catch (error) {
    console.error('Failed to fetch categories for sitemap:', error);
    // Continue without category pages if database query fails
  }

  return [...staticPages, ...collectionPages, ...categoryPages, ...productPages];
}


