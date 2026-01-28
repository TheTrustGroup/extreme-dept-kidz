"use client";

import * as React from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Hero background video and poster (poster shows before video plays)
// In production, set NEXT_PUBLIC_HERO_VIDEO_URL to your CDN/Vercel Blob URL so the repo stays small
const HERO_VIDEO_SRC = process.env.NEXT_PUBLIC_HERO_VIDEO_URL || "/IMG_4474.mp4";
const HERO_POSTER = "/Extreme 1.png";

export function HeroSection(): JSX.Element {
  // Show content immediately so hero is never stuck blank (no waiting on video)
  const containerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  // Ensure video plays after mount and handles autoplay restrictions
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force play on mount (handles autoplay restrictions)
    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        // Autoplay was prevented, try again on user interaction
        console.warn("Video autoplay prevented, will play on interaction");
        const playOnInteraction = () => {
          video.play().catch(() => {});
          document.removeEventListener("click", playOnInteraction);
          document.removeEventListener("touchstart", playOnInteraction);
        };
        document.addEventListener("click", playOnInteraction, { once: true });
        document.addEventListener("touchstart", playOnInteraction, { once: true });
      }
    };

    // Play when video is ready
    if (video.readyState >= 2) {
      playVideo();
    } else {
      video.addEventListener("loadeddata", playVideo, { once: true });
    }

    // Ensure video continues playing if paused
    const handlePause = () => {
      if (video.paused && !video.ended) {
        video.play().catch(() => {});
      }
    };
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("loadeddata", playVideo);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

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
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        isolation: "isolate",
      }}
      aria-label="Hero section"
    >
      {/* Hero Video with Parallax */}
      <m.div
        className="absolute inset-0 z-0 overflow-hidden"
        style={{ y }}
      >
        <div 
          className="relative w-full h-full min-h-screen"
          style={{
            isolation: "isolate",
            contain: "layout style paint",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={HERO_POSTER}
            disablePictureInPicture
            disableRemotePlayback
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              objectPosition: "center center",
              minWidth: "100vw",
              minHeight: "100vh",
              width: "100%",
              height: "100%",
              transform: "scale(1.02)",
              willChange: "transform",
              WebkitTransform: "translateZ(0)",
              transformOrigin: "center center",
            }}
            aria-label="Hero background video showcasing Extreme Dept Kidz collection"
            onError={(e) => {
              console.error("Hero video failed to load:", e);
            }}
          >
            <source src={HERO_VIDEO_SRC} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
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

      {/* Hero Content */}
      <m.div
        className="relative z-10 w-full flex items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          minHeight: "100vh",
        }}
      >
        <div className="container">
          <div className="max-w-4xl mx-auto text-center stack">
          {/* Key message – Premium Streetwear for Young Legends */}
          <m.h1
            className={cn(
              "font-serif font-bold text-cream-50",
              "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl",
              "leading-[1.08] tracking-tight",
              "drop-shadow-2xl"
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
              "drop-shadow-lg"
            )}
            variants={itemVariants}
            style={{
              textShadow: "0 2px 12px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4)",
            }}
          >
            Elevated style for the modern boy. Built for adventure, designed for life.
          </m.p>

          {/* CTA Buttons */}
          <m.div
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-[var(--space-3)] sm:gap-[var(--space-4)] md:gap-[var(--space-5)] pt-[var(--space-2)] sm:pt-[var(--space-4)]"
            variants={itemVariants}
          >
            <Button
              variant="primary"
              size="lg"
              className={cn(
                "w-full max-w-[280px] sm:w-auto sm:min-w-[160px] md:min-w-[180px]",
                "bg-cream-50/95 text-charcoal-900 backdrop-blur-sm",
                "hover:bg-cream-50 hover:shadow-glass-lg hover:scale-[1.02]",
                "active:scale-[0.98] transition-all duration-300 ease-out",
                "text-sm sm:text-base md:text-lg",
                "px-6 sm:px-7 md:px-8 lg:px-10",
                "py-5 sm:py-5.5 md:py-6 lg:py-7",
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
                "w-full max-w-[280px] sm:w-auto sm:min-w-[160px] md:min-w-[180px]",
                "bg-cream-50/95 text-charcoal-900 backdrop-blur-sm",
                "hover:bg-cream-50 hover:shadow-glass-lg hover:scale-[1.02]",
                "active:scale-[0.98] transition-all duration-300 ease-out",
                "text-sm sm:text-base md:text-lg",
                "px-6 sm:px-7 md:px-8 lg:px-10",
                "py-5 sm:py-5.5 md:py-6 lg:py-7",
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
                "w-full max-w-[280px] sm:w-auto sm:min-w-[160px] md:min-w-[180px]",
                "bg-cream-50/10 border-2 border-cream-50 text-cream-50 backdrop-blur-md",
                "hover:bg-cream-50 hover:text-charcoal-900 hover:border-cream-50 hover:shadow-glass-lg hover:scale-[1.02]",
                "active:scale-[0.98] transition-all duration-300 ease-out",
                "text-sm sm:text-base md:text-lg",
                "px-6 sm:px-7 md:px-8 lg:px-10",
                "py-5 sm:py-5.5 md:py-6 lg:py-7",
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

