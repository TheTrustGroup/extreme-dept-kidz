"use client";

import * as React from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { Container } from "@/components/ui/container";
import { H2, H3 } from "@/components/ui/typography";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { cn } from "@/lib/utils";

interface Collection {
  id: string;
  name: string;
  href: string;
  image: string;
}

const collections: Collection[] = [
  {
    id: "1",
    name: "Boys Collection",
    href: "/collections/boys",
    image: "", // Image will be added later
  },
  {
    id: "2",
    name: "New Arrivals",
    href: "/collections/new-arrivals",
    image: "", // Image will be added later
  },
  {
    id: "3",
    name: "Street Essentials",
    href: "/collections/boys?style=street",
    image: "", // Image will be added later
  },
];

export function FeaturedCollections(): JSX.Element | null {
  // Only render if collections exist
  if (!collections || collections.length === 0) {
    return null;
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

// Collection Card Component
interface CollectionCardProps {
  collection: Collection;
  index: number;
}

function CollectionCard({ collection, index }: CollectionCardProps): JSX.Element {
  return (
    <m.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: "easeInOut",
      }}
      role="listitem"
    >
      <Link 
        href={collection.href} 
        className="block group focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 focus:rounded-xl"
        aria-label={`View ${collection.name} collection`}
      >
        <m.div
          className={cn(
            "relative overflow-hidden rounded-xl",
            "bg-cream-100 shadow-sm",
            "aspect-[4/5] md:aspect-[3/4]",
            "transition-all duration-300"
          )}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Image - Ultra-optimized with IntersectionObserver */}
          <div className="relative w-full h-full">
            {collection.image ? (
              <OptimizedImage
                src={collection.image}
                alt={`${collection.name} collection - ${collection.name} products`}
                variant="gallery"
                isLCP={false}
                useIntersectionObserver={true}
                enablePrefetch={true}
                quality={85}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                fill
              />
            ) : (
              <div 
                className="w-full h-full bg-cream-200" 
                aria-label={`${collection.name} collection placeholder`}
                role="img"
              />
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 via-charcoal-900/20 to-transparent" />
          </div>

          {/* Collection Name Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <H3 className="text-cream-50">
              {collection.name}
            </H3>
          </div>

          {/* Hover Shadow Effect */}
          <m.div
            className="absolute inset-0 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none"
            transition={{ duration: 0.3 }}
            style={{
              boxShadow:
                "0 25px 50px -12px rgba(28, 28, 28, 0.25), 0 0 0 1px rgba(28, 28, 28, 0.05)", // brand-text shadows
            }}
          />
        </m.div>
      </Link>
    </m.div>
  );
}

