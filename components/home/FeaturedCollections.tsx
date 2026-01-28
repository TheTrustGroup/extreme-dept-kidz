import * as React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { H2, H3 } from "@/components/ui/typography";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { getAllCollections } from "@/lib/db";
import type { Collection } from "@/types";
import { CollectionCard } from "./CollectionCard";

/**
 * FeaturedCollections Component
 * 
 * Fetches real collections from database and displays them in a grid.
 * Only shows active collections.
 */
export async function FeaturedCollections(): Promise<JSX.Element> {
  // Fetch collections from database
  let collections: Collection[] = [];
  try {
    collections = await getAllCollections();
    // Filter to only active collections
    collections = collections.filter(coll => coll.isActive !== false);
    // Limit to first 3 collections for grid layout
    collections = collections.slice(0, 3);
  } catch (error) {
    console.error('Failed to fetch collections:', error);
    // Fallback to empty array - component will render empty section
    collections = [];
  }

  // Don't render section if no collections
  if (collections.length === 0) {
    return <></>;
  }

  return (
    <section 
      // Design System: Consistent spacing using 8px base scale
      className="section bg-cream-50"
      aria-labelledby="collections-heading"
    >
      <Container size="lg">
        {/* Design System: Consistent spacing using 8px base scale */}
        <div className="space-y-[var(--space-8)] lg:space-y-[var(--space-12)]">
          {/* Section Title */}
          <div className="text-center">
            <H2 id="collections-heading" className="text-charcoal-900">
              Collections
            </H2>
          </div>

          {/* Collections Grid - Consistent spacing */}
          <div 
            // Design System: Consistent spacing using 8px base scale
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[var(--space-4)] sm:gap-[var(--space-5)] md:gap-[var(--space-6)] lg:gap-[var(--space-8)]"
            role="list"
            aria-label="Featured collections"
          >
            {collections.map((collection, index) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                index={index}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

