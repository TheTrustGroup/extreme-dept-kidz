import type { MetadataRoute } from "next";
import { getAllCategories } from "@/lib/db";
import { getProducts } from "@/lib/data/products";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://extremedeptkidz.com";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/cart`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/collections`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  ];

  let collectionPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await getAllCategories();
    collectionPages = categories
      .filter((c) => c.isActive)
      .map((c) => ({
        url: `${SITE_URL}/collections/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      }));
  } catch (error) {
    console.error("Failed to fetch categories for sitemap:", error);
  }

  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts();
    productPages = products.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: p.updatedAt || p.createdAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Failed to fetch products for sitemap:", error);
  }

  return [...staticPages, ...collectionPages, ...productPages];
}


