"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { Container } from "@/components/ui/container";
import { H2, Body, Caption } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export function EditorialSection() {
  return (
    <section className="py-12 xs:py-14 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-cream-50">
      <Container size="lg">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 lg:gap-0">
          {/* Image Side - 60% */}
          <m.div
            className="relative lg:col-span-3 h-[300px] xs:h-[350px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px]"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className="relative w-full h-full">
              <Image
                src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=2086&auto=format&fit=crop"
                alt="Modern family in premium fashion"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
                loading="lazy"
                quality={85}
              />
            </div>
          </m.div>

          {/* Text Side - 40% */}
          <m.div
            className="lg:col-span-2 bg-cream-50 flex items-center p-6 xs:p-7 sm:p-8 md:p-10 lg:p-14 xl:p-16 2xl:p-20"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4, ease: "easeInOut", delay: 0.1 }}
          >
            <div className="max-w-lg space-y-6 md:space-y-8">
              {/* Eyebrow Text */}
              <Caption className="text-charcoal-600 uppercase tracking-wider">
                Our Philosophy
              </Caption>

              {/* Headline */}
              <H2 className="text-charcoal-900 leading-tight">
                Crafted for Life&apos;s Most Precious Moments
              </H2>

              {/* Body Paragraph */}
              <div className="space-y-4">
                <Body className="text-lg md:text-xl text-charcoal-700 leading-relaxed">
                  We believe exceptional style transcends age. Our thoughtfully curated collections unite timeless sophistication with contemporary sensibility, speaking directly to families who value both quality and design.
                </Body>
                <Body className="text-lg md:text-xl text-charcoal-700 leading-relaxed">
                  Every piece is meticulously crafted with uncompromising attention to detail, using only the finest materials. We create for the moments that define childhood—from playground adventures to family celebrations, ensuring elegance meets everyday life.
                </Body>
              </div>

              {/* Learn More Link */}
              <m.div
                className="pt-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, ease: "easeInOut", delay: 0.2 }}
              >
                <Link
                  href="/about"
                  className={cn(
                    "inline-flex items-center font-sans text-base md:text-lg font-medium",
                    "text-charcoal-900 hover:text-navy-900",
                    "transition-colors duration-300",
                    "group relative"
                  )}
                >
                  <span className="relative">
                    Discover Our Story
                    <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-navy-900 transition-all duration-300 group-hover:w-full" />
                  </span>
                  <svg
                    className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
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
              </m.div>
            </div>
          </m.div>
        </div>
      </Container>
    </section>
  );
}

