"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { Container } from "@/components/ui/container";
import { H2 } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  href: string;
  image: string;
}

const categories: Category[] = [
  {
    id: "boys",
    name: "Boys",
    href: "/collections/boys",
    image: "", // Image will be added later
  },
  {
    id: "new-arrivals",
    name: "New Arrivals",
    href: "/collections/new-arrivals",
    image: "", // Image will be added later
  },
  {
    id: "outerwear",
    name: "Outerwear",
    href: "/collections/boys?category=outerwear",
    image: "", // Image will be added later
  },
  {
    id: "accessories",
    name: "Accessories",
    href: "/collections/boys?category=accessories",
    image: "", // Image will be added later
  },
];

export function ShopByCategory(): JSX.Element {
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

// Category Card Component
interface CategoryCardProps {
  category: Category;
  index: number;
}

function CategoryCard({ category, index }: CategoryCardProps): JSX.Element {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: "easeInOut",
      }}
    >
      <Link href={category.href} className="block group">
        <m.div
          className={cn(
            "relative overflow-hidden rounded-lg",
            "bg-cream-100 shadow-sm",
            "aspect-square",
            "transition-all duration-300"
          )}
          whileHover={{ scale: 1.01, y: -2 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Image */}
          <div className="relative w-full h-full">
            {category.image ? (
              <Image
                src={category.image}
                loading="lazy"
                quality={85}
                alt={category.name}
                fill
                className="object-cover transition-all duration-500 group-hover:brightness-110 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
              />
            ) : (
              <div className="w-full h-full bg-cream-200" />
            )}
            {/* Overlay - darkens on hover */}
            <div className="absolute inset-0 bg-charcoal-900/20 group-hover:bg-charcoal-900/30 transition-colors duration-500" />
          </div>

          {/* Category Name - Centered */}
          <div className="absolute inset-0 flex items-center justify-center">
            <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-cream-50 tracking-tight drop-shadow-lg transition-transform duration-300 group-hover:scale-105">
              {category.name}
            </h3>
          </div>
        </m.div>
      </Link>
    </m.div>
  );
}

