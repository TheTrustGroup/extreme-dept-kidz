"use client";

import * as React from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

interface FeaturedCategoryCardProps {
  category: Category;
  index: number;
}

/**
 * Luxury featured category card: large image, overlay, glassmorphism on hover,
 * Playfair title and Shop CTA. Used in FeaturedCollections.
 */
export function FeaturedCategoryCard({
  category,
  index,
}: FeaturedCategoryCardProps): JSX.Element {
  const href = `/collections/${category.slug}`;
  // Use cover images for Boys and Girls collections
  const imageUrl = category.slug.toLowerCase() === "boys"
    ? "/collections-boys-cover.png"
    : category.slug.toLowerCase() === "girls"
    ? "/collections-girls-cover.png"
    : category.image ?? undefined;

  return (
    <m.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative overflow-hidden rounded-lg aspect-[4/5] md:aspect-[5/6] min-h-[320px]"
      role="listitem"
    >
      <Link
        href={href}
        className={cn(
          "absolute inset-0 block group focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:ring-offset-2 focus:ring-offset-luxury-cream focus:rounded-lg"
        )}
        aria-label={`Shop ${category.name}`}
      >
        {/* Background image */}
        <div className="absolute inset-0">
          {imageUrl ? (
            <OptimizedImage
              src={imageUrl}
              alt=""
              variant="gallery"
              isLCP={index === 0}
              useIntersectionObserver={index > 0}
              enablePrefetch={true}
              quality={85}
              className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
              fill
            />
          ) : (
            <div
              className="w-full h-full bg-luxury-navy-800"
              aria-hidden
            />
          )}
          {/* Dark gradient overlay for text legibility */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-luxury-navy-950/85 via-luxury-navy-900/40 to-transparent"
            aria-hidden
          />
        </div>

        {/* Content overlay: title + CTA */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 md:p-10">
          {/* Glassmorphism bar on hover */}
          <m.div
            className={cn(
              "absolute inset-x-0 bottom-0 top-auto h-full min-h-[60%] -z-0",
              "bg-gradient-to-t from-glass-dark-strong via-glass-dark to-transparent",
              "backdrop-blur-sm border-t border-white/10 rounded-t-lg",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            )}
            aria-hidden
          />
          <div className="relative z-10 flex flex-col items-start gap-4">
            <h3
              className={cn(
                "text-2xl sm:text-3xl md:text-4xl font-semibold text-white tracking-tight",
                "font-[family-name:var(--font-playfair),'Playfair_Display',Georgia,serif]"
              )}
            >
              {category.name}
            </h3>
            <span
              className={cn(
                "inline-flex items-center justify-center px-6 py-3",
                "bg-white/15 backdrop-blur-md border border-white/25 rounded-none",
                "text-white text-sm font-medium tracking-wider uppercase",
                "transition-all duration-300 group-hover:bg-luxury-gold group-hover:border-luxury-gold group-hover:text-luxury-navy-950"
              )}
            >
              Shop
            </span>
          </div>
        </div>

        {/* Subtle glass border on hover */}
        <div
          className={cn(
            "absolute inset-0 pointer-events-none rounded-lg",
            "border-2 border-transparent group-hover:border-white/20",
            "transition-colors duration-300"
          )}
          aria-hidden
        />
      </Link>
    </m.article>
  );
}
