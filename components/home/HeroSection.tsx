"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { heroLineReveal, staggerContainer } from "@/lib/motion";

// ─── Scroll cue chevron ───────────────────────────────────────────
function ScrollCue() {
  return (
    <motion.div
      className="hero-scroll-cue"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.4, duration: 0.6 }}
      aria-hidden="true"
    >
      <span className="hero-scroll-cue__label">DISCOVER</span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="hero-scroll-cue__icon"
      >
        <svg
          width="16"
          height="10"
          viewBox="0 0 16 10"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1 1L8 8L15 1"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// ─── Desktop scroll cue (left panel) ─────────────────────────────
function DesktopScrollCue() {
  return (
    <motion.div
      className="hidden lg:flex flex-col items-center gap-2 mt-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.6, duration: 0.6 }}
      aria-hidden="true"
    >
      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
          <path
            d="M1 1L7 7L13 1"
            stroke="var(--color-navy)"
            strokeOpacity="0.3"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────
export default function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const [mobileHeroLoaded, setMobileHeroLoaded] = useState(false);
  const [desktopHeroLoaded, setDesktopHeroLoaded] = useState(false);

  // Stagger timing for text lines
  const lineDelay = (i: number) => ({
    delay: shouldReduceMotion ? 0 : 0.3 + i * 0.12,
  });

  return (
    <section
      aria-label="Hero — Premium Streetwear for Young Legends"
      className="relative w-full"
    >
      {/* ════════════════════════════════════════════════════════════
          MOBILE LAYOUT  (< lg)
          Full-bleed image, gradient scrim, content bottom-anchored
          ════════════════════════════════════════════════════════════ */}
      <div
        className="relative lg:hidden"
        style={{
          height: "calc(100svh - 56px)",
          minHeight: "480px",
          maxHeight: "820px",
          backgroundColor: "var(--color-navy)",
        }}
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/hero.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            quality={85}
            className={[
              "object-cover object-center transition-opacity duration-700 hero-image-reveal",
              mobileHeroLoaded ? "opacity-100" : "opacity-0",
            ].join(" ")}
            onLoad={() => setMobileHeroLoaded(true)}
          />
        </div>

        {/* Gradient scrim — bottom-heavy so image reads clearly at top */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              "linear-gradient(",
              "  to top,",
              "  rgba(15,23,42,0.92) 0%,",
              "  rgba(15,23,42,0.75) 40%,",
              "  rgba(15,23,42,0.20) 65%,",
              "  rgba(15,23,42,0.0) 100%",
              ")",
            ].join(""),
          }}
          aria-hidden="true"
        />

        {/* Eyebrow top-left — brand location */}
        <motion.div
          className="absolute top-6 left-6"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <span
            className="text-label text-white/50"
            style={{ fontSize: "12px", letterSpacing: "0.2em" }}
          >
            ACCRA · GHANA
          </span>
        </motion.div>

        {/* Content — bottom anchored */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-28 hero-mobile-content">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.p
              variants={heroLineReveal}
              transition={lineDelay(0)}
              className="text-label mb-3"
              style={{
                color: "var(--color-gold)",
                fontSize: "12px",
                letterSpacing: "0.22em",
              }}
            >
              NEW SEASON · SS25
            </motion.p>

            <motion.h1
              variants={heroLineReveal}
              transition={lineDelay(1)}
              className="font-playfair text-white mb-2"
              style={{
                fontSize: "clamp(40px, 11vw, 60px)",
                lineHeight: "1.05",
                letterSpacing: "-0.02em",
                fontWeight: 400,
              }}
            >
              Premium
            </motion.h1>
            <motion.p
              variants={heroLineReveal}
              transition={lineDelay(2)}
              className="font-playfair text-white/90 mb-6"
              style={{
                fontSize: "clamp(40px, 11vw, 60px)",
                lineHeight: "1.05",
                letterSpacing: "-0.02em",
                fontWeight: 400,
                fontStyle: "italic",
              }}
            >
              Streetwear
            </motion.p>

            <motion.p
              variants={heroLineReveal}
              transition={lineDelay(3)}
              className="text-white/80 mb-8"
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                maxWidth: "280px",
              }}
            >
              Elevated style for young legends. Built for adventure, designed
              for life.
            </motion.p>

            <motion.div
              variants={heroLineReveal}
              transition={lineDelay(4)}
              className="flex flex-col gap-3"
            >
              <Link
                href="/collections/new-arrivals"
                className="btn-primary btn-primary-full hero-mobile-primary-cta"
                style={{
                  background: "var(--color-cream)",
                  color: "var(--color-navy)",
                  border: "none",
                  height: "52px",
                  letterSpacing: "0.16em",
                }}
              >
                Shop New Arrivals
              </Link>

              <div className="flex gap-3">
                <Link
                  href="/collections/boys"
                  className="hero-mobile-ghost-cta flex-1 flex items-center justify-center text-label border text-white/90 transition-all duration-200"
                  style={{
                    height: "48px",
                    borderColor: "rgba(255,255,255,0.5)",
                    fontSize: "11px",
                    letterSpacing: "0.18em",
                  }}
                >
                  Boys
                </Link>
                <Link
                  href="/collections/girls"
                  className="hero-mobile-ghost-cta flex-1 flex items-center justify-center text-label border text-white/90 transition-all duration-200"
                  style={{
                    height: "48px",
                    borderColor: "rgba(255,255,255,0.5)",
                    fontSize: "11px",
                    letterSpacing: "0.18em",
                  }}
                >
                  Girls
                </Link>
              </div>
            </motion.div>

            <ScrollCue />
          </motion.div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          DESKTOP LAYOUT  (lg+)
          Split: left = editorial text on cream, right = full image
          ════════════════════════════════════════════════════════════ */}
      <div
        className="hidden lg:grid"
        style={{
          gridTemplateColumns: "45fr 55fr",
          minHeight: "calc(100vh - 64px)",
          maxHeight: "900px",
        }}
      >
        {/* ── Left panel — cream editorial text ─────────────────── */}
        <div
          className="flex flex-col justify-between px-12 xl:px-16 py-16"
          style={{ backgroundColor: "var(--bg-page)" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.15,
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <span
              className="text-label hero-eyebrow-light"
              style={{
                fontSize: "12px",
                letterSpacing: "0.22em",
              }}
            >
              ACCRA · GHANA · SS25
            </span>
          </motion.div>

          <div className="flex-1 flex flex-col justify-center py-12">
            <motion.h1
              className="font-playfair text-[var(--text-primary)]"
              style={{
                fontSize: "clamp(44px, 4.5vw, 68px)",
                lineHeight: "1.02",
                letterSpacing: "-0.025em",
                fontWeight: 400,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              Premium
              <br />
              <em
                style={{
                  fontStyle: "italic",
                  color: "var(--text-secondary)",
                }}
              >
                Streetwear
              </em>
              <br />
              <span className="whitespace-nowrap">for Young Legends.</span>
            </motion.h1>

            <motion.p
              className="mt-6 text-[var(--text-secondary)]"
              style={{
                fontSize: "15px",
                lineHeight: "1.7",
                maxWidth: "340px",
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.5,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              Elevated style for young legends. Built for adventure, designed
              for life.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col gap-4 w-full max-w-[320px]"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.65,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Link
                href="/collections/new-arrivals"
                className="btn-primary w-full justify-center"
              >
                Shop New Arrivals
              </Link>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/collections/boys"
                  className="btn-secondary w-full justify-center"
                  style={{
                    height: "44px",
                    padding: "0 16px",
                    fontSize: "11px",
                  }}
                >
                  Boys
                </Link>
                <Link
                  href="/collections/girls"
                  className="btn-secondary w-full justify-center"
                  style={{
                    height: "44px",
                    padding: "0 16px",
                    fontSize: "11px",
                  }}
                >
                  Girls
                </Link>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="flex items-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            {[
              { value: "SS25", label: "Season" },
              { value: "GHS", label: "Local currency" },
              { value: "2–12", label: "Ages served" },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  className="font-playfair text-[var(--text-primary)]"
                  style={{
                    fontSize: "18px",
                    fontWeight: 400,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-label mt-1"
                  style={{
                    color: "var(--text-tertiary)",
                    fontSize: "10px",
                    letterSpacing: "0.1em",
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
            <DesktopScrollCue />
          </motion.div>
        </div>

        {/* ── Right panel — full-bleed image ────────────────────── */}
        <div
          className="relative overflow-hidden"
          style={{ backgroundColor: "var(--color-navy)" }}
        >
          <Image
            src="/hero.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            quality={85}
            className={[
              "object-cover object-[center_40%] transition-opacity duration-700 hero-image-reveal",
              desktopHeroLoaded ? "opacity-100" : "opacity-0",
            ].join(" ")}
            onLoad={() => setDesktopHeroLoaded(true)}
          />
          <div
            className="absolute inset-y-0 left-0 w-24 pointer-events-none hero-desktop-vignette"
            style={{
              background:
                "linear-gradient(to right, var(--vignette-color, var(--bg-page)) 0%, transparent 100%)",
            }}
            aria-hidden="true"
          />
          <motion.div
            className="absolute bottom-8 right-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <span
              className="text-label text-white/40"
              style={{
                fontSize: "10px",
                letterSpacing: "0.16em",
                writingMode: "vertical-rl",
              }}
            >
              EXTREME DEPT KIDZ · SS25
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
