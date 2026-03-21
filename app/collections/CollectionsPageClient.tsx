"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { m } from "framer-motion";
import { Container } from "@/components/ui/container";
import { H1, H2, H3, Body, Caption } from "@/components/ui/typography";
import CollectionTabs from "@/components/collection/CollectionTabs";

interface CollectionItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

interface CollectionsPageClientProps {
  items: CollectionItem[];
}

/**
 * Premium Collections Page - Ralph Lauren-inspired aesthetic
 * 
 * Features:
 * - Sophisticated typography hierarchy
 * - Generous whitespace
 * - Elegant card designs with subtle animations
 * - Premium feel with refined details
 */
export function CollectionsPageClient({ items }: CollectionsPageClientProps): JSX.Element {
  return (
    <div className="min-h-screen bg-cream-50">
      <div className="pt-20 md:pt-24 pb-12">
        <div className="collection-header container-luxury">
          <m.h1
            className="text-h1 font-playfair text-[var(--text-primary)]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            Our Collections
          </m.h1>
          <m.p
            className="collection-header__desc"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Discover thoughtfully curated collections designed for every moment
            and occasion.
          </m.p>
        </div>

        <div className="container-luxury">
          <CollectionTabs />
        </div>
      </div>

      {/* Collections Grid */}
      <section className="pb-20 md:pb-28 lg:pb-32">
        <Container size="lg">
          {items.length === 0 ? (
            <div className="text-center py-20 px-6 rounded-lg bg-cream-100 border border-cream-200 max-w-md mx-auto">
              <p className="text-charcoal-700 text-lg font-medium mb-2">
                No collections yet
              </p>
              <p className="text-charcoal-600">
                Add categories in Admin → Categories. Each active category appears
                here and links to /collections/[slug].
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
              {items.map((item, index) => (
                <CollectionCard key={item.id} item={item} index={index} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Call to Action Section */}
      {items.length > 0 && (
        <section className="py-16 md:py-20 border-t border-cream-200">
          <Container size="lg">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto"
            >
              <H2 className="mb-4">
                Explore Premium Style
              </H2>
              <Body className="text-charcoal-600">
                Each collection represents our commitment to quality, style, and
                timeless design for young legends.
              </Body>
            </m.div>
          </Container>
        </section>
      )}
    </div>
  );
}

interface CollectionCardProps {
  item: CollectionItem;
  index: number;
}

function CollectionCard({ item, index }: CollectionCardProps): JSX.Element {
  return (
    <m.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group"
    >
      <Link
        href={`/collections/${item.slug}`}
        className="block focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 focus:ring-offset-cream-50 focus:rounded-xl"
        aria-label={`View ${item.name} collection`}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-cream-200 rounded-sm">
          {item.image ? (
            <>
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading={index < 3 ? "eager" : "lazy"}
                quality={85}
              />
              {/* Subtle overlay on hover */}
              <div className="absolute inset-0 bg-charcoal-900/0 group-hover:bg-charcoal-900/5 transition-colors duration-500" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cream-200 via-cream-100 to-cream-200 flex items-center justify-center">
              <span className="text-charcoal-400 text-sm font-medium uppercase tracking-wider">
                {item.name}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <H3 className="group-hover:text-navy-900 transition-colors duration-300">
            {item.name}
          </H3>
          {item.description && (
            <Body className="text-charcoal-600">
              {item.description}
            </Body>
          )}
          {/* Subtle underline on hover */}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-charcoal-500 text-xs uppercase tracking-wider font-medium">
              Explore
            </span>
            <svg
              className="w-4 h-4 text-charcoal-400 group-hover:text-charcoal-600 group-hover:translate-x-1 transition-all duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
              />
            </svg>
          </div>
        </div>
      </Link>
    </m.article>
  );
}
