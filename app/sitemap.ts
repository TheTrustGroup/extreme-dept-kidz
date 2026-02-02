import type { MetadataRoute } from "next";
import { getAllCategories } from "@/lib/db";
import { getProducts } from "@/lib/data/products";
import { getSiteUrl, getSiteUrlForPath } from "@/lib/config/site-url";

const SITE_URL = getSiteUrl();

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: getSiteUrlForPath('/about'), lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: getSiteUrlForPath('/contact'), lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: getSiteUrlForPath('/cart'), lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: getSiteUrlForPath('/collections'), lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  ];

  let collectionPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await getAllCategories();
    collectionPages = categories
      .filter((c) => c.isActive)
      .map((c) => ({
        url: getSiteUrlForPath(`/collections/${c.slug}`),
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      }));
  } catch (error) {
    console.error("Failed to fetch categories for sitemap:", error);
  }

  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts({ storefrontOnly: true });
    productPages = products.map((p) => ({
      url: getSiteUrlForPath(`/products/${p.slug}`),
      lastModified: p.updatedAt || p.createdAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Failed to fetch products for sitemap:", error);
  }

  return [...staticPages, ...collectionPages, ...productPages];
}


