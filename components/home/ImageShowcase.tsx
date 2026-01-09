"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { getLifestyleBoysImages } from "@/lib/data/image-manifest";
import { Container } from "@/components/ui/container";
import { H2 } from "@/components/ui/typography";

/**
 * ImageShowcase Component
 * 
 * Split image showcase with lifestyle photography.
 */
export function ImageShowcase(): JSX.Element {
  const lifestyleImages = React.useMemo(() => getLifestyleBoysImages(2), []);

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <Container size="lg">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Image Block 1 - Casual */}
          {lifestyleImages[0] && (
            <m.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group relative aspect-[3/4] overflow-hidden bg-cream-100 rounded-xl cursor-pointer"
            >
              <Link href="/collections/boys?style=casual">
                <Image
                  src={lifestyleImages[0].src}
                  alt={lifestyleImages[0].alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  quality={85}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute inset-0 flex items-end p-6 md:p-8">
                  <div className="text-white">
                    <h3 className="text-2xl md:text-3xl font-serif font-bold mb-2">
                      Everyday Essentials
                    </h3>
                    <p className="text-white/90 mb-4 text-sm md:text-base">
                      Comfortable, versatile pieces for daily adventures
                    </p>
                    <span className="inline-flex items-center text-xs md:text-sm font-semibold uppercase tracking-wider">
                      Shop Casual
                      <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </m.div>
          )}

          {/* Image Block 2 - Active */}
          {lifestyleImages[1] && (
            <m.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative aspect-[3/4] overflow-hidden bg-cream-100 rounded-xl cursor-pointer"
            >
              <Link href="/collections/boys?style=active">
                <Image
                  src={lifestyleImages[1].src}
                  alt={lifestyleImages[1].alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  quality={85}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute inset-0 flex items-end p-6 md:p-8">
                  <div className="text-white">
                    <h3 className="text-2xl md:text-3xl font-serif font-bold mb-2">
                      Playground Ready
                    </h3>
                    <p className="text-white/90 mb-4 text-sm md:text-base">
                      Performance meets style for non-stop energy
                    </p>
                    <span className="inline-flex items-center text-xs md:text-sm font-semibold uppercase tracking-wider">
                      Shop Active
                      <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </m.div>
          )}
        </div>
      </Container>
    </section>
  );
}
