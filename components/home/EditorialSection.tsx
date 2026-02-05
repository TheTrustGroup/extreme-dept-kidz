"use client";

import * as React from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { Container } from "@/components/ui/container";
import { H2, Body, Caption } from "@/components/ui/typography";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { cn } from "@/lib/utils";

export function EditorialSection(): JSX.Element {
  return (
    <section 
      // Design System: Tighter bottom spacing so "Explore the Collection" sits closer to footer
      className="section bg-cream-50 pb-8 md:pb-10 lg:pb-12"
      aria-labelledby="editorial-heading"
    >
      <Container size="lg">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 lg:gap-0">
          {/* Image Side - 60% */}
          <m.div
            className="relative lg:col-span-3 h-[300px] xs:h-[350px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] overflow-hidden"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <OptimizedImage
              src="/editorial-cover-adventure-style.png"
              alt="Built for Adventure, Designed for Style - Premium streetwear for young legends"
              variant="gallery"
              className="object-cover object-[center_top] w-full h-full"
              fill
              quality={90}
              useIntersectionObserver={false}
              isLCP={false}
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          </m.div>

          {/* Text Side - 40% */}
          <m.div
            className="lg:col-span-2 bg-cream-50 flex items-center p-[var(--space-6)] sm:p-[var(--space-7)] md:p-[var(--space-8)] lg:p-[var(--space-10)] xl:p-[var(--space-13)]"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4, ease: "easeInOut", delay: 0.1 }}
          >
            <div className="max-w-lg space-y-[var(--space-6)] md:space-y-[var(--space-8)]">
              {/* Eyebrow Text */}
              <Caption className="text-charcoal-600 uppercase tracking-wider">
                THE COLLECTION
              </Caption>

              {/* Headline */}
              <H2 
                id="editorial-heading"
                className="text-charcoal-900"
              >
                Built for Adventure, Designed for Style
              </H2>

              {/* Body Paragraph */}
              <div className="space-y-[var(--space-4)]">
                <Body className="text-charcoal-700">
                  From the playground to the city streets, every piece is crafted for young legends who move with confidence.
                </Body>
                <Body className="text-charcoal-700">
                  Premium streetwear meets luxury essentials. Our collections celebrate both play and sophistication, designed for young legends who demand quality and style.
                </Body>
              </div>

              {/* CTA Link */}
              <m.div
                className="pt-[var(--space-4)]"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, ease: "easeInOut", delay: 0.2 }}
              >
                <Link
                  href="/collections/boys"
                  className={cn(
                    "inline-flex items-center font-sans text-base md:text-lg font-medium",
                    "text-charcoal-900 hover:text-navy-900",
                    "transition-colors duration-300",
                    "group relative min-h-[44px]",
                    "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 focus:rounded px-[var(--space-2)]"
                  )}
                  aria-label="Explore the boys collection"
                >
                  <span className="relative">
                    Explore the Collection
                    <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-navy-900 transition-all duration-300 group-hover:w-full" />
                  </span>
                  <svg
                    className="ml-[var(--space-2)] w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </m.div>
            </div>
          </m.div>
        </div>
      </Container>
    </section>
  );
}

