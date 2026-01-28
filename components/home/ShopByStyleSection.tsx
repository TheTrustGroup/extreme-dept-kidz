"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { Container } from "@/components/ui/container";
import { H2, H3, Body } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

interface StyleCategory {
  id: string;
  name: string;
  href: string;
  image: string;
  icon?: string;
}

const styleCategories: StyleCategory[] = [
  {
    id: "street-essentials",
    name: "Street Essentials",
    href: "/collections/boys?style=street",
    image: "/4677.png", // Streetwear lifestyle shot
  },
  {
    id: "premium-basics",
    name: "Premium Basics",
    href: "/collections/boys?style=casual",
    image: "/4672.png", // Casual lifestyle shot
  },
  {
    id: "outerwear",
    name: "Outerwear",
    href: "/collections/boys?category=outerwear",
    image: "", // Image will be added later
  },
  {
    id: "activewear",
    name: "Activewear",
    href: "/collections/boys?style=sport",
    image: "/4680.png", // Activewear lifestyle shot
  },
];

export function ShopByStyleSection(): JSX.Element {
  return (
    <section 
      // Design System: Consistent spacing using 8px base scale
      className="section bg-cream-50"
      aria-labelledby="shop-by-style-heading"
    >
      <Container size="lg">
        {/* Design System: Consistent spacing using 8px base scale */}
        <div className="space-y-[var(--space-8)] lg:space-y-[var(--space-12)]">
          {/* Section Title */}
          <m.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <H2 
              id="shop-by-style-heading"
              className="text-charcoal-900"
            >
              Shop by Style
            </H2>
            <Body className="mt-[var(--space-4)] sm:mt-[var(--space-6)] text-charcoal-600">
              Curated collections for the modern boy
            </Body>
          </m.div>

          {/* Categories Grid - 2x2 Desktop, Stack Mobile - Consistent spacing */}
          <div 
            // Design System: Consistent spacing using 8px base scale
            className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--space-4)] sm:gap-[var(--space-5)] md:gap-[var(--space-6)] lg:gap-[var(--space-8)]"
            role="list"
            aria-label="Style categories"
          >
            {styleCategories.map((category, index) => (
              <StyleCategoryCard
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

interface StyleCategoryCardProps {
  category: StyleCategory;
  index: number;
}

function StyleCategoryCard({ category, index }: StyleCategoryCardProps): JSX.Element {
  return (
    <m.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut",
      }}
      role="listitem"
      // Prevent layout shift with consistent structure
      className="w-full"
    >
      <Link 
        href={category.href} 
        className="block group focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 focus:rounded-xl touch-manipulation"
        aria-label={`Shop ${category.name} collection`}
      >
        <m.div
          className={cn(
            "relative overflow-hidden rounded-xl",
            "bg-cream-100 shadow-md",
            "aspect-[4/5]",
            "transition-all duration-500"
          )}
          whileHover={{ scale: 1.02, y: -8 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Image - Fixed aspect ratio prevents layout shift */}
          <div className="relative w-full h-full">
            {category.image ? (
              <Image
                src={category.image}
                loading="lazy"
                quality={90}
                alt={`${category.name} style category - ${category.name} products`}
                fill
                className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                sizes="(max-width: 768px) 100vw, 50vw"
                aria-hidden="false"
              />
            ) : (
              <div 
                className="w-full h-full bg-cream-200" 
                aria-label={`${category.name} style category placeholder`}
                role="img"
              />
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-charcoal-900/40 to-transparent" />
            {/* Hover Overlay */}
            <m.div
              className="absolute inset-0 bg-navy-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              aria-hidden="true"
            />
          </div>

          {/* Category Name Overlay - Consistent spacing */}
          <div className="absolute bottom-0 left-0 right-0 p-[var(--space-4)] sm:p-[var(--space-6)] md:p-[var(--space-8)]">
            <m.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <H3 className="text-cream-50">
                {category.name}
              </H3>
            </m.div>
          </div>

          {/* Hover Shadow Effect */}
          <m.div
            className="absolute inset-0 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
            style={{
              boxShadow:
                "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.1)",
            }}
            aria-hidden="true"
          />
        </m.div>
      </Link>
    </m.div>
  );
}
