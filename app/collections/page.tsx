import type { Metadata } from "next";
import { getAllCategories } from "@/lib/db";
import { CollectionsPageClient } from "./CollectionsPageClient";

export const metadata: Metadata = {
  title: "Collections | Extreme Dept Kidz",
  description:
    "Explore our curated collections of premium kids fashion. From new arrivals to timeless essentials, discover pieces designed for the modern family.",
  keywords: [
    "kids fashion collections",
    "premium children's clothing",
    "luxury kids fashion",
    "new arrivals",
    "kids clothing collections",
  ],
  alternates: {
    canonical: "https://extremedeptkidz.com/collections",
  },
  openGraph: {
    title: "Collections | Extreme Dept Kidz",
    description:
      "Explore our curated collections of premium kids fashion. From new arrivals to timeless essentials.",
    url: "https://extremedeptkidz.com/collections",
  },
};

/** Paths we treat as placeholder — do not show on collection cards. */
const PLACEHOLDER_IMAGE_PATHS = ["/4677.png", "/4671.png", "/4672.png", "/4674.png", "/4675.png", "/IMG_4673.png", "/IMG_4689.png"];

function isPlaceholderImage(url: string | undefined): boolean {
  if (!url) return true;
  return PLACEHOLDER_IMAGE_PATHS.some((p) => url === p || url.endsWith(p));
}

/** PHASE 9 — Safe ISR: Collections index revalidates every 60s. */
export const revalidate = 60;

/**
 * Collections Index Page - Premium Ralph Lauren-inspired design
 *
 * Shows admin-created categories (Boys, Girls, Premium Kidswear, etc.) so
 * categories you add in Admin → Categories appear here. Each card links to
 * /collections/[slug], which loads products by category slug.
 */
export default async function CollectionsPage(): Promise<JSX.Element> {
  const categories = await getAllCategories();
  const active = categories.filter((c) => c.isActive);

  const items = active.map((c) => {
    const image = c.image && !isPlaceholderImage(c.image) ? c.image : undefined;
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? undefined,
      image,
    };
  });

  return <CollectionsPageClient items={items} />;
}
