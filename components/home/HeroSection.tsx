"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroSection(): JSX.Element {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  // Fade-in animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <m.div
        className="absolute inset-0 z-0"
        style={{ y }}
      >
        <div className="relative w-full h-[120%]">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
            alt="Premium kids fashion"
            fill
            priority
            className="object-cover"
            quality={85}
            onLoad={() => setIsLoaded(true)}
            sizes="100vw"
            fetchPriority="high"
          />
          {/* Overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/60 via-charcoal-900/50 to-charcoal-900/70" />
        </div>
      </m.div>

      {/* Content */}
      <m.div
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-20 sm:pt-24 md:pt-28 lg:pt-32 xl:pt-36 pb-16 sm:pb-20 md:pb-24 lg:pb-28 xl:pb-32"
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-7 md:space-y-8 lg:space-y-10">
          {/* Headline */}
          <m.h1
            className={cn(
              "font-serif font-bold text-cream-50",
              "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl",
              "leading-[1.1] tracking-tight",
              "drop-shadow-lg"
            )}
            variants={itemVariants}
          >
            Where Style Meets Substance
          </m.h1>

          {/* Subheadline */}
          <m.p
            className={cn(
              "font-sans text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl",
              "text-cream-100 leading-relaxed max-w-3xl mx-auto",
              "drop-shadow-md"
            )}
            variants={itemVariants}
          >
            Curated collections of premium fashion designed for the modern family. Timeless pieces that celebrate both play and sophistication.
          </m.p>

          {/* CTA Buttons */}
          <m.div
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 pt-2 sm:pt-4"
            variants={itemVariants}
          >
            <Button
              variant="primary"
              size="lg"
              className={cn(
                "w-full sm:w-auto sm:min-w-[160px] md:min-w-[180px]",
                "bg-cream-50 text-charcoal-900",
                "hover:bg-cream-100 hover:shadow-xl",
                "transition-all duration-300",
                "text-sm sm:text-base md:text-lg",
                "px-6 sm:px-7 md:px-8 lg:px-10",
                "py-5 sm:py-5.5 md:py-6 lg:py-7"
              )}
              asChild
            >
              <Link href="/collections/boys">Discover Boys&apos; Collection</Link>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className={cn(
                "w-full sm:w-auto sm:min-w-[160px] md:min-w-[180px]",
                "bg-transparent border-2 border-cream-50 text-cream-50",
                "hover:bg-cream-50 hover:text-charcoal-900 hover:border-cream-50",
                "transition-all duration-300",
                "text-sm sm:text-base md:text-lg",
                "px-6 sm:px-7 md:px-8 lg:px-10",
                "py-5 sm:py-5.5 md:py-6 lg:py-7"
              )}
              asChild
            >
              <Link href="/collections/girls">Explore Girls&apos; Collection</Link>
            </Button>
          </m.div>
        </div>
      </m.div>

      {/* Scroll Indicator */}
      <m.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <m.div
          className="w-6 h-10 border-2 border-cream-50/60 rounded-full flex items-start justify-center p-2"
          animate={{ y: [0, 8, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <m.div
            className="w-1.5 h-1.5 bg-cream-50/80 rounded-full"
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

