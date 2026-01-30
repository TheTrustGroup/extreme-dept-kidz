"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HERO_IMAGE = "/Extreme 1.png";

/** PHASE 4 — Hero: Headline, value prop, Primary CTA, optional Secondary CTA, Hero Image. No UI overload. */
export function HeroSection(): JSX.Element {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.12,
        delayChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden min-h-[calc(100vh-4.5rem)] pt-[4.5rem] md:min-h-[calc(100vh-4.5rem)]"
      aria-label="Hero section"
    >
      {/* Hero Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[var(--brand-text)]">
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            priority
            quality={85}
            className="object-cover object-center"
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/50" aria-hidden />
      </div>

      {/* Content */}
      <m.div
        className="relative z-10 w-full flex items-center justify-center px-4 py-12 md:py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-3xl mx-auto text-center">
          <m.h1
            className={cn(
              "font-serif font-bold text-cream-50",
              "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
              "leading-[1.1] tracking-tight",
              "mb-4 md:mb-5"
            )}
            variants={itemVariants}
            style={{ textShadow: "var(--hero-text-shadow)" }}
          >
            Premium Streetwear for Young Legends
          </m.h1>

          <m.p
            className={cn(
              "font-sans text-cream-100/95 text-base md:text-lg lg:text-xl max-w-xl mx-auto",
              "leading-snug mb-8 md:mb-10"
            )}
            variants={itemVariants}
            style={{ textShadow: "var(--hero-text-shadow-subtle)" }}
          >
            Elevated style for young legends. Built for adventure, designed for life.
          </m.p>

          <m.div
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
            variants={itemVariants}
          >
            <Button
              variant="primary"
              size="lg"
              className={cn(
                "min-w-[140px] md:min-w-[160px]",
                "bg-cream-50 text-charcoal-900 border border-cream-200/50",
                "hover:bg-cream-50 hover:shadow-lg"
              )}
              asChild
            >
              <Link href="/collections/all">Shop All</Link>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className={cn(
                "min-w-[140px] md:min-w-[160px]",
                "bg-transparent border-2 border-cream-50 text-cream-50",
                "hover:bg-cream-50 hover:text-charcoal-900"
              )}
              asChild
            >
              <Link href="/collections/new-arrivals">New Arrivals</Link>
            </Button>
          </m.div>
        </div>
      </m.div>
    </section>
  );
}
