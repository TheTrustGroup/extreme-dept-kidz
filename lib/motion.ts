// lib/motion.ts — Centralised Framer Motion variants (same easing site-wide)
import type { Variants } from "framer-motion";

// Luxury easing: cubic-bezier(0.16, 1, 0.3, 1)
const EASE_LUXURY = [0.16, 1, 0.3, 1] as const;

// ── Page sections & cards fading up on scroll ─────────────────
export const fadeUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_LUXURY },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// ── Staggered children (e.g. product grid) ────────────────────
export const staggerContainer: Variants = {
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_LUXURY },
  },
};

// ── Drawers (cart, mobile nav) ────────────────────────────────
export const slideInRight: Variants = {
  initial: { x: "100%", opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: EASE_LUXURY },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.25, ease: [0.7, 0, 1, 1] },
  },
};

export const slideInBottom: Variants = {
  initial: { y: "100%", opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: EASE_LUXURY },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: 0.25, ease: [0.7, 0, 1, 1] },
  },
};

// ── Modals ────────────────────────────────────────────────────
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: EASE_LUXURY },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.18, ease: "easeIn" },
  },
};

// ── Overlays (backdrops) ──────────────────────────────────────
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// ── Dropdown menus ────────────────────────────────────────────
export const dropdownIn: Variants = {
  initial: { opacity: 0, y: -6, scaleY: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scaleY: 1,
    transition: { duration: 0.2, ease: EASE_LUXURY },
  },
  exit: {
    opacity: 0,
    y: -4,
    scaleY: 0.98,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

// ── Hero text reveal (stagger letters or lines) ───────────────
export const heroLineReveal: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_LUXURY },
  },
};

// ── Sticky add-to-cart bar ─────────────────────────────────────
export const stickyBarReveal: Variants = {
  initial: { y: "100%", opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: EASE_LUXURY },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};
