"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { m } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const HERO_IMAGE = "/Extreme 1.png";

export interface HeroSectionProps {
  /** Optional background video URL (auto-play, muted, loop). Falls back to image when not set. */
  videoSrc?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/**
 * Luxury homepage hero: full-screen video/image, glassmorphism overlay,
 * Shop Boys / Shop Girls CTAs, smooth scroll indicator. Ralph Lauren–inspired.
 */
export function HeroSection({ videoSrc }: HeroSectionProps = {}): JSX.Element {
  const scrollRef = React.useRef<HTMLButtonElement>(null);

  const scrollToNext = React.useCallback(() => {
    const main = document.getElementById("main-content");
    if (main) {
      main.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
    }
  }, []);

  return (
    <section
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        "min-h-[70vh] sm:min-h-[80vh] md:min-h-screen",
        "pt-[4.5rem] md:pt-[4.5rem]"
      )}
      aria-label="Hero section"
    >
      {/* Background: video (if available) or image */}
      <div className="absolute inset-0 z-0">
        {videoSrc ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : null}
        <div className="absolute inset-0 bg-luxury-navy-950">
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
        {videoSrc ? <div className="absolute inset-0 bg-luxury-navy-950/40" aria-hidden /> : null}
        <div
          className="absolute inset-0 bg-luxury-navy-950/50"
          aria-hidden
        />
      </div>

      {/* Centered content with glassmorphism overlay */}
      <m.div
        className={cn(
          "relative z-10 w-full max-w-4xl mx-auto px-4 py-12 md:py-16",
          "rounded-none md:rounded-xl",
          "backdrop-blur-md border border-white/10",
          "bg-white/5 md:bg-white/10",
          "shadow-glass"
        )}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center">
          <m.h1
            className={cn(
              "font-serif font-semibold text-white",
              "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl",
              "leading-tight tracking-tight",
              "mb-3 sm:mb-4"
            )}
            variants={itemVariants}
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
          >
            Premium Streetwear for Young Legends
          </m.h1>

          <m.p
            className={cn(
              "font-sans text-white/90 text-sm sm:text-base md:text-lg max-w-xl mx-auto",
              "leading-snug mb-6 sm:mb-8"
            )}
            variants={itemVariants}
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}
          >
            Elevated style for young legends. Built for adventure, designed for life.
          </m.p>

          {/* CTAs: Shop Boys / Shop Girls */}
          <m.div
            className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4"
            variants={itemVariants}
          >
            <Link
              href="/collections/boys"
              className={cn(
                "inline-flex items-center justify-center min-w-[160px] sm:min-w-[180px] px-6 py-3",
                "rounded-none border-2 border-luxury-gold bg-luxury-gold",
                "text-sm font-medium uppercase tracking-[0.2em] text-luxury-navy-900",
                "hover:bg-luxury-gold/90 hover:border-luxury-gold/90 transition-colors duration-200",
                "touch-target-min"
              )}
            >
              Shop Boys
            </Link>
            <Link
              href="/collections/girls"
              className={cn(
                "inline-flex items-center justify-center min-w-[160px] sm:min-w-[180px] px-6 py-3",
                "rounded-none border-2 border-white/80 bg-transparent text-white",
                "text-sm font-medium uppercase tracking-[0.2em]",
                "hover:bg-white/10 hover:border-white transition-colors duration-200",
                "touch-target-min"
              )}
            >
              Shop Girls
            </Link>
          </m.div>
        </div>
      </m.div>

      {/* Smooth scroll indicator — pixel-perfect horizontal center */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
        <button
          ref={scrollRef}
          type="button"
          onClick={scrollToNext}
          className={cn(
            "flex flex-col items-center gap-2 text-white hover:text-gold transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
            "touch-target-min"
          )}
          aria-label="Scroll to content"
        >
          <span className="text-sm font-display tracking-widest uppercase">
            Discover
          </span>
          <ChevronDown className="w-6 h-6 animate-bounce" aria-hidden />
        </button>
      </div>
    </section>
  );
}
