"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const MESSAGES = [
  "Free shipping on orders over ₵500 · Ghana-wide delivery",
  "New arrivals just dropped — Boys & Girls collections",
  "30-day easy returns · Secure checkout",
];

const TOPBAR_HEIGHT = 36; // px

export default function TopBar(): JSX.Element {
  const [dismissed, setDismissed] = useState(false);
  const [index, setIndex] = useState(0);

  // Publish height to CSS so Header can offset itself
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--topbar-height", dismissed ? "0px" : `${TOPBAR_HEIGHT}px`);
    return (): void => {
      root.style.setProperty("--topbar-height", "0px");
    };
  }, [dismissed]);

  // Rotate messages
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4000);
    return (): void => {
      clearInterval(id);
    };
  }, []);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          key="topbar"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: TOPBAR_HEIGHT, opacity: 1, transition: { duration: 0.3 } }}
          exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
          className="relative overflow-hidden bg-[var(--color-navy)] text-[var(--color-cream)]"
          style={{ zIndex: 101, flexShrink: 0 }}
        >
          <div
            className="container-luxury h-full flex items-center justify-center"
            style={{ height: TOPBAR_HEIGHT }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="text-label text-[var(--color-cream)]/80 text-center"
                style={{ fontSize: "11px", letterSpacing: "0.14em" }}
              >
                {MESSAGES[index]}
              </motion.p>
            </AnimatePresence>
            <button
              onClick={() => setDismissed(true)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded text-[var(--color-cream)]/60 hover:text-[var(--color-cream)] transition-colors"
              aria-label="Dismiss announcement"
              style={{ lineHeight: 1 }}
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
