import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { H2 } from "@/components/ui/typography";
import { getAllCategories } from "@/lib/db";
import type { Category } from "@/types";
import { CategoryCard } from "./CategoryCard";

/**
 * ShopByCategory Component
 * 
 * Fetches real categories from database and displays them in a grid.
 * Only shows active categories.
 */
export async function ShopByCategory(): Promise<JSX.Element> {
  // Fetch categories from database
  let categories: Category[] = [];
  try {
    categories = await getAllCategories();
    // Filter to only active categories
    categories = categories.filter(cat => cat.isActive !== false);
    // Limit to first 4 categories for grid layout
    categories = categories.slice(0, 4);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    // Fallback to empty array - component will render empty section
    categories = [];
  }

  // Don't render section if no categories
  if (categories.length === 0) {
    return <></>;
  }

  return (
    <section className="py-12 xs:py-14 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-cream-50">
      <Container size="lg">
        <div className="space-y-8 xs:space-y-10 sm:space-y-12 md:space-y-14 lg:space-y-16">
          {/* Section Title */}
          <div className="text-center">
            <H2 className="text-charcoal-900 text-2xl xs:text-3xl sm:text-4xl">Shop by Category</H2>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}


