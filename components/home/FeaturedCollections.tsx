import * as React from "react";
import { getAllCategories } from "@/lib/db";
import type { Category } from "@/types";
import { FeaturedCategoryCard } from "./FeaturedCategoryCard";

const FEATURED_SLUGS = ["boys", "girls"] as const;

/**
 * FeaturedCollections
 *
 * Fetches active categories from the database and displays Boys and Girls
 * in a luxury 2-column (desktop) / 1-column (mobile) grid with large hero
 * images, overlay, glassmorphism hover, and Shop CTAs.
 */
export async function FeaturedCollections(): Promise<JSX.Element> {
  let categories: Category[] = [];
  try {
    const all = await getAllCategories();
    const active = all.filter((c) => c.isActive !== false);
    // Prefer Boys and Girls by slug; fallback to first two active categories
    const featured = FEATURED_SLUGS.map(
      (slug) => active.find((c) => c.slug.toLowerCase() === slug) as Category | undefined
    ).filter(Boolean) as Category[];
    categories =
      featured.length >= 2 ? featured : active.slice(0, 2);
  } catch (error) {
    console.error("Failed to fetch categories for FeaturedCollections:", error);
    categories = [];
  }

  if (categories.length === 0) {
    return <></>;
  }

  return (
    <section
      className="section-padding bg-luxury-cream"
      aria-labelledby="featured-collections-heading"
    >
      <div className="container-luxury">
        <div className="space-y-8 lg:space-y-12">
          <div className="text-center">
            <h2
              id="featured-collections-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-semibold text-luxury-navy tracking-tight font-[family-name:var(--font-playfair),'Playfair_Display',Georgia,serif]"
            >
              Featured Collections
            </h2>
          </div>

          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8"
            role="list"
            aria-label="Featured collections"
          >
            {categories.map((category, index) => (
              <FeaturedCategoryCard
                key={category.id}
                category={category}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
