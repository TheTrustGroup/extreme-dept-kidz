"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { Container } from "@/components/ui/container";
import { H2 } from "@/components/ui/typography";
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
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "2",
    name: "New Arrivals",
    href: "/collections/new-arrivals",
    image:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "3",
    name: "Street Essentials",
    href: "/collections/boys?style=street",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1926&auto=format&fit=crop",
  },
];

export function FeaturedCollections() {
  return (
    <section className="py-12 xs:py-14 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-cream-50">
      <Container size="lg">
        <div className="space-y-8 xs:space-y-10 sm:space-y-12 md:space-y-14 lg:space-y-16">
          {/* Section Title */}
          <div className="text-center">
            <H2 className="text-charcoal-900 text-2xl xs:text-3xl sm:text-4xl">Collections</H2>
          </div>

          {/* Collections Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8 lg:gap-10">
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

function CollectionCard({ collection, index }: CollectionCardProps) {
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
    >
      <Link href={collection.href} className="block group">
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
          {/* Image */}
          <div className="relative w-full h-full">
            <Image
              src={collection.image}
              loading="lazy"
              quality={85}
              alt={collection.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 30vw"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 via-charcoal-900/20 to-transparent" />
          </div>

          {/* Collection Name Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl font-semibold text-cream-50 tracking-tight">
              {collection.name}
            </h3>
          </div>

          {/* Hover Shadow Effect */}
          <m.div
            className="absolute inset-0 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none"
            transition={{ duration: 0.3 }}
            style={{
              boxShadow:
                "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
            }}
          />
        </m.div>
      </Link>
    </m.div>
  );
}

