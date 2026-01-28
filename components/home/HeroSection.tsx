"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { m } from "framer-motion";
import { useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Hero background image
const HERO_IMAGE = "/Extreme 1.png";

export function HeroSection(): JSX.Element {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Parallax scroll effect - Optimized with RAF throttling
  // Performance: Use passive scroll listener with requestAnimationFrame throttling
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
    layoutEffect: false, // Performance: Use effect instead of layoutEffect for better performance
  });

  // Performance: Throttle transform updates with useTransform (already optimized by framer-motion)
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  // Fade-in animation variants – smooth, staggered reveal on load
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.14,
        delayChildren: 0.08,
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

  return (
    <section
      ref={containerRef}
      className="relative flex items-center justify-center overflow-hidden"
      style={{
        isolation: "isolate",
        minHeight: "calc(100vh - 2rem - 3.5rem)", // Full viewport minus TopBar (2rem) + Header (3.5rem mobile)
        paddingTop: "calc(2rem + 3.5rem)", // Account for fixed header
      }}
      aria-label="Hero section"
    >
      {/* Hero Image with Parallax */}
      <m.div
        className="absolute inset-0 z-0 overflow-hidden"
        style={{ y }}
      >
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            isolation: "isolate",
            contain: "layout style paint",
            minHeight: "100%",
          }}
        >
          {/* Hero Background Image */}
          <div className="absolute inset-0 w-full h-full bg-charcoal-900 overflow-hidden">
            <Image
              src={HERO_IMAGE}
              alt="Hero background - Extreme Dept Kidz"
              fill
              priority
              quality={90}
              className="object-cover"
              sizes="100vw"
              decoding="async"
              // CRITICAL FIX: Remove redundant fetchPriority - priority already sets it to "high"
              style={{
                objectPosition: "center center",
              }}
              aria-hidden="true"
            />
          </div>
          
          {/* Soft gradient overlay – premium, breathable depth */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(26,26,26,0.55) 0%, rgba(26,26,26,0.35) 40%, rgba(26,26,26,0.45) 100%)",
            }}
            aria-hidden="true"
          />
        </div>
      </m.div>

      {/* Hero Content - Perfectly centered vertically and horizontally */}
      <m.div
        className="relative z-10 w-full flex items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          minHeight: "100%",
          paddingTop: "var(--space-6)",
          paddingBottom: "var(--space-6)",
        }}
      >
        <div className="container w-full">
          <div className="max-w-4xl mx-auto text-center">
            {/* Key message – Premium Streetwear for Young Legends */}
            <m.h1
              className={cn(
                "font-serif font-bold text-cream-50",
                "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl",
                "leading-[1.08] tracking-tight",
                "drop-shadow-2xl mb-[var(--space-6)]"
              )}
              variants={itemVariants}
              style={{
                textShadow:
                  "0 4px 20px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              Premium Streetwear for Young Legends
            </m.h1>

            {/* Supporting line – elegant, refined */}
            <m.p
              className={cn(
                "font-serif font-medium text-cream-100/95",
                "text-lg sm:text-xl md:text-2xl lg:text-3xl",
                "leading-snug tracking-tight max-w-2xl mx-auto",
                "drop-shadow-lg mb-[var(--space-10)]"
              )}
              variants={itemVariants}
              style={{
                textShadow: "0 2px 12px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4)",
              }}
            >
              Elevated style for the modern boy. Built for adventure, designed for life.
            </m.p>

            {/* CTA Buttons - Perfectly centered */}
            <m.div
              className="flex flex-col sm:flex-row items-center justify-center gap-[var(--space-4)] sm:gap-[var(--space-5)]"
              variants={itemVariants}
            >
            <Button
              variant="primary"
              size="lg"
              className={cn(
                "w-full max-w-[240px] sm:w-auto sm:min-w-[160px] md:min-w-[180px]",
                "bg-cream-50/95 text-charcoal-900 backdrop-blur-sm",
                "hover:bg-cream-50 hover:shadow-glass-lg hover:scale-[1.02]",
                "active:scale-[0.98] transition-all duration-300 ease-out",
                "text-sm sm:text-base md:text-lg",
                "px-[var(--space-6)] py-[var(--space-4)]",
                "shadow-glass min-h-[44px] border border-cream-200/50"
              )}
              asChild
            >
              <Link href="/collections/boys" aria-label="Shop boys collection">SHOP BOYS</Link>
            </Button>
            <Button
              variant="primary"
              size="lg"
              className={cn(
                "w-full max-w-[240px] sm:w-auto sm:min-w-[160px] md:min-w-[180px]",
                "bg-cream-50/95 text-charcoal-900 backdrop-blur-sm",
                "hover:bg-cream-50 hover:shadow-glass-lg hover:scale-[1.02]",
                "active:scale-[0.98] transition-all duration-300 ease-out",
                "text-sm sm:text-base md:text-lg",
                "px-[var(--space-6)] py-[var(--space-4)]",
                "shadow-glass min-h-[44px] border border-cream-200/50"
              )}
              asChild
            >
              <Link href="/collections/girls" aria-label="Shop girls collection">SHOP GIRLS</Link>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className={cn(
                "w-full max-w-[240px] sm:w-auto sm:min-w-[160px] md:min-w-[180px]",
                "bg-cream-50/10 border-2 border-cream-50 text-cream-50 backdrop-blur-md",
                "hover:bg-cream-50 hover:text-charcoal-900 hover:border-cream-50 hover:shadow-glass-lg hover:scale-[1.02]",
                "active:scale-[0.98] transition-all duration-300 ease-out",
                "text-sm sm:text-base md:text-lg",
                "px-[var(--space-6)] py-[var(--space-4)]",
                "min-h-[44px]"
              )}
              asChild
            >
              <Link href="/collections/new-arrivals" aria-label="View new arrivals">NEW ARRIVALS</Link>
            </Button>
          </m.div>
          </div>
        </div>
      </m.div>

      {/* Scroll Indicator */}
      <m.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        style={{
          filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.8))",
        }}
        aria-hidden="true"
      >
        <m.div
          className="w-6 h-10 border-2 border-cream-50/90 rounded-full flex items-start justify-center p-2 bg-charcoal-900/20 backdrop-blur-md"
          animate={{ y: [0, 8, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <m.div
            className="w-1.5 h-1.5 bg-cream-50 rounded-full"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </m.div>
      </m.div>
    </section>
  );
}

