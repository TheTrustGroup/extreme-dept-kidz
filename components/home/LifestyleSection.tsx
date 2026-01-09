"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { modelImages } from "@/lib/data/image-manifest";
import { responsiveSizes } from "@/lib/utils/image-utils";
import { Container } from "@/components/ui/container";
import { H2 } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

/**
 * LifestyleSection Component
 * 
 * Split-screen lifestyle editorial section showcasing the brand story.
 */
export function LifestyleSection(): JSX.Element {
  return (
    <section className="py-12 md:py-16 lg:py-20 xl:py-24 bg-cream-50">
      <Container size="lg">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Image Side */}
          <m.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[4/5] lg:aspect-[3/4] overflow-hidden rounded-xl bg-cream-100"
          >
            <Image
              src={modelImages.boyStreet1.src}
              alt={modelImages.boyStreet1.alt}
              fill
              sizes={responsiveSizes.lifestyle}
              className="object-cover"
              quality={85}
              priority={false}
            />
          </m.div>

          {/* Content Side */}
          <m.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <span className="text-sm uppercase tracking-widest text-charcoal-600 font-semibold">
              The Collection
            </span>

            <H2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold text-charcoal-900">
              Built for Adventure,
              <br />
              Designed for Style
            </H2>

            <p className="text-lg text-charcoal-600 leading-relaxed max-w-lg">
              From the playground to the city streets, every piece is crafted
              for the modern boy who moves with confidence. Premium materials,
              thoughtful design, and styles that grow with them.
            </p>

            <Button variant="secondary" size="lg" asChild>
              <Link href="/about" className="inline-flex items-center gap-2">
                Discover Our Story
                <svg
                  className="w-5 h-5 group-hover:translate-x-2 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </Button>
          </m.div>
        </div>
      </Container>
    </section>
  );
}
