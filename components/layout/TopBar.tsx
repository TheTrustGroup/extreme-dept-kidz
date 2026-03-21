"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const MESSAGES = [
  "Free shipping on orders over GHS ₵500 · Ghana-wide delivery",
  "New arrivals just dropped — Boys & Girls collections",
  "30-day easy returns · Secure checkout",
];

export default function TopBar() {
  const [dismissed, setDismissed] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 36, opacity: 1, transition: { duration: 0.3 } }}
          exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
          className="relative overflow-hidden bg-[var(--color-navy)] text-[var(--color-cream)]"
          style={{ zIndex: 101 }}
        >
          <div className="container-luxury h-full flex items-center justify-center">
            <p className="text-label text-[var(--color-cream)]/80 text-center">
              {MESSAGES[index]}
            </p>
            <button
              onClick={() => setDismissed(true)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded text-[var(--color-cream)]/60 hover:text-[var(--color-cream)] transition-colors"
              aria-label="Dismiss announcement"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
