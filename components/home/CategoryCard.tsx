"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: Category;
  index: number;
}

export function CategoryCard({ category, index }: CategoryCardProps): JSX.Element {
  const href = `/collections/${category.slug}`;
  
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
      <Link href={href} className="block group">
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
                quality={80}
                alt={category.name}
                fill
                className="object-cover transition-all duration-500 group-hover:brightness-110 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
              />
            ) : (
              <div className="w-full h-full bg-cream-200" />
            )}
            {/* Overlay - darkens on hover */}
            <div className="absolute inset-0 bg-charcoal-900/20 group-hover:bg-charcoal-900/30 transition-colors duration-300" />
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
