"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
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
  const [videoLoaded, setVideoLoaded] = React.useState(false);
  const [videoError, setVideoError] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = React.useState(true);

  // Parallax scroll effect - Optimized with RAF throttling
  // Performance: Use passive scroll listener with requestAnimationFrame throttling
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
    layoutEffect: false, // Performance: Use effect instead of layoutEffect for better performance
  });

  // Performance: Throttle transform updates with useTransform (already optimized by framer-motion)
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  // Intersection Observer for lazy loading on mobile (performance optimization)
  React.useEffect(() => {
    // On mobile, only load video when section is visible
    if (typeof window === "undefined") return;
    
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      setShouldLoadVideo(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoadVideo(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px", // Start loading slightly before visible
        threshold: 0.1,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Enhanced video loading and playback logic
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoadVideo) return;

    // Track video loading state
    const handleLoadedData = () => {
      setVideoLoaded(true);
    };

    const handleCanPlay = () => {
      setVideoLoaded(true);
    };

    const handleLoadedMetadata = () => {
      setVideoLoaded(true);
    };

    const handleError = (e: Event) => {
      console.error("Hero video failed to load:", e);
      setVideoError(true);
      setVideoLoaded(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
      // Auto-resume if paused unintentionally (but not if ended)
      if (!video.ended && video.paused) {
        video.play().catch(() => {
          // Silently handle autoplay restrictions
        });
      }
    };

    const handleEnded = () => {
      // Restart loop
      video.currentTime = 0;
      video.play().catch(() => {});
    };

    // Attach event listeners
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("error", handleError);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    // Attempt to play video
    const attemptPlay = async () => {
      try {
        // Ensure video is muted for autoplay
        video.muted = true;
        video.playsInline = true;
        
        // Try to play
        await video.play();
        setIsPlaying(true);
      } catch (error) {
        // Autoplay was prevented - will play on user interaction
        console.log("Video autoplay prevented, will play on interaction");
        
        const playOnInteraction = () => {
          video.play()
            .then(() => setIsPlaying(true))
            .catch(() => {});
          document.removeEventListener("click", playOnInteraction);
          document.removeEventListener("touchstart", playOnInteraction);
          document.removeEventListener("scroll", playOnInteraction);
        };
        
        // Try multiple interaction types for better mobile support
        document.addEventListener("click", playOnInteraction, { once: true, passive: true });
        document.addEventListener("touchstart", playOnInteraction, { once: true, passive: true });
        document.addEventListener("scroll", playOnInteraction, { once: true, passive: true });
      }
    };

    // Check if video is already loaded
    if (video.readyState >= 2) {
      setVideoLoaded(true);
      attemptPlay();
    } else {
      // Wait for video to load
      video.addEventListener("canplaythrough", attemptPlay, { once: true });
    }

    // Cleanup
    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("error", handleError);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("canplaythrough", attemptPlay);
    };
  }, [shouldLoadVideo]);

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
      {/* Hero Video with Parallax */}
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
          {/* Poster Image - Shows immediately, prevents CLS */}
          {(!videoLoaded || videoError) && (
            <div className="absolute inset-0 w-full h-full bg-charcoal-900 overflow-hidden">
              <Image
                src={HERO_POSTER}
                alt="Hero background - Extreme Dept Kidz"
                fill
                priority
                quality={90}
                className="object-cover"
                sizes="100vw"
                decoding="async"
                fetchPriority="high"
                style={{
                  objectPosition: "center center",
                }}
                aria-hidden="true"
              />
            </div>
          )}

          {/* Hero Video - Only render if no error and should load */}
          {!videoError && shouldLoadVideo && (
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster={HERO_POSTER}
              disablePictureInPicture
              disableRemotePlayback
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out",
                videoLoaded && isPlaying ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
              style={{
                objectPosition: "center center",
                minWidth: "100vw",
                minHeight: "100vh",
                width: "100%",
                height: "100%",
                transform: "scale(1.02)",
                willChange: "transform, opacity",
                WebkitTransform: "translateZ(0)",
                transformOrigin: "center center",
              }}
              aria-label="Hero background video showcasing Extreme Dept Kidz collection"
            >
              <source src={HERO_VIDEO_SRC} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
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

