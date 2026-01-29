"use client";

import * as React from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { H3 } from "@/components/ui/typography";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import type { Collection } from "@/types";
import { cn } from "@/lib/utils";

interface CollectionCardProps {
  collection: Collection;
  index: number;
}

export function CollectionCard({ collection, index }: CollectionCardProps): JSX.Element {
  // Use collection slug for href, or fallback to category-based routing
  const href = `/collections/${collection.slug}`;
  
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
        href={href} 
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
                quality={80}
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
