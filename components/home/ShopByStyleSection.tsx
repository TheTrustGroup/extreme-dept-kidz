"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { Container } from "@/components/ui/container";
import { H2 } from "@/components/ui/typography";
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
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "premium-basics",
    name: "Premium Basics",
    href: "/collections/boys?style=casual",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "outerwear",
    name: "Outerwear",
    href: "/collections/boys?category=outerwear",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "activewear",
    name: "Activewear",
    href: "/collections/boys?style=sport",
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop",
  },
];

export function ShopByStyleSection(): JSX.Element {
  return (
    <section className="py-12 xs:py-14 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-cream-50">
      <Container size="lg">
        <div className="space-y-8 xs:space-y-10 sm:space-y-12 md:space-y-14 lg:space-y-16">
          {/* Section Title */}
          <m.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <H2 className="text-charcoal-900 text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-serif font-bold">
              Shop by Style
            </H2>
            <p className="mt-4 text-charcoal-600 text-base sm:text-lg">
              Curated collections for the modern boy
            </p>
          </m.div>

          {/* Categories Grid - 2x2 Desktop, Stack Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-5 sm:gap-6 md:gap-8 lg:gap-10">
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
    >
      <Link href={category.href} className="block group">
        <m.div
          className={cn(
            "relative overflow-hidden rounded-xl",
            "bg-cream-100 shadow-lg",
            "aspect-[4/5] md:aspect-[3/4]",
            "transition-all duration-500"
          )}
          whileHover={{ scale: 1.02, y: -8 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Image */}
          <div className="relative w-full h-full">
            <Image
              src={category.image}
              loading="lazy"
              quality={90}
              alt={category.name}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-charcoal-900/40 to-transparent" />
            {/* Hover Overlay */}
            <m.div
              className="absolute inset-0 bg-navy-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              aria-hidden="true"
            />
          </div>

          {/* Category Name Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-10">
            <m.h3
              className="font-serif text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-cream-50 tracking-tight"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              {category.name}
            </m.h3>
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
