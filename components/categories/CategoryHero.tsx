"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CategoryHeroProps {
  title: string;
  description?: string;
  productCount: number;
  backgroundImage?: string;
}

/**
 * Luxury category hero: full-width image, overlay, Playfair title, product count, breadcrumbs.
 * Pure presentation; no data fetching.
 */
export function CategoryHero({
  title,
  description,
  productCount,
  backgroundImage,
}: CategoryHeroProps): JSX.Element {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Collections", href: "/collections" },
    { label: title, href: undefined },
  ];

  return (
    <section
      className="relative w-full min-h-[40vh] sm:min-h-[45vh] md:min-h-[50vh] lg:min-h-[55vh] flex items-center justify-center overflow-hidden"
      aria-label={`Category: ${title}`}
    >
      {/* Background image */}
      {backgroundImage ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-700"
            style={{ backgroundImage: `url(${backgroundImage})` }}
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-luxury-navy-950/60"
            aria-hidden
          />
        </>
      ) : (
        <div
          className="absolute inset-0 bg-luxury-navy-900"
          aria-hidden
        />
      )}

      {/* Glassmorphism overlay for text */}
      <div
        className={cn(
          "relative z-10 w-full max-w-5xl mx-auto px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20",
          "rounded-none md:rounded-lg",
          "backdrop-blur-md border border-white/10",
          "bg-white/5 md:bg-white/10",
          "shadow-glass"
        )}
      >
        <div className="flex flex-col items-center text-center">
          {/* Breadcrumbs */}
          <nav
            className="mb-4 sm:mb-6 flex flex-wrap items-center justify-center gap-1 text-xs sm:text-sm text-white/80"
            aria-label="Breadcrumb"
          >
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <ChevronRight
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-white/50"
                    aria-hidden
                  />
                )}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-luxury-gold transition-colors duration-200 uppercase tracking-wider"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-luxury-gold font-medium uppercase tracking-wider">
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Title — Playfair Display, large on desktop */}
          <h1
            className={cn(
              "font-serif font-semibold text-white",
              "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl",
              "leading-tight tracking-tight",
              "mb-2 sm:mb-3"
            )}
          >
            {title}
          </h1>

          {/* Description (optional) */}
          {description && (
            <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-white/90 mb-3 sm:mb-4">
              {description}
            </p>
          )}

          {/* Product count */}
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-white/70">
            {productCount} {productCount === 1 ? "product" : "products"}
          </p>
        </div>
      </div>
    </section>
  );
}
