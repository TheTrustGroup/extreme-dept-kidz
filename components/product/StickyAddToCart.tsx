"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, Check } from "lucide-react";
import { stickyBarReveal } from "@/lib/motion";

interface StickyAddToCartProps {
  productName: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  selectedSize?: string;
  isAvailable?: boolean;
  onAddToCart: () => Promise<void>;
}

function fmt(n: number, cur = "₵") {
  return `${cur}${n.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function StickyAddToCart({
  productName,
  price,
  currency = "₵",
  imageUrl,
  selectedSize,
  isAvailable = true,
  onAddToCart,
}: StickyAddToCartProps) {
  const [visible, setVisible] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const mainBtn = document.getElementById("pdp-add-btn");
    if (!mainBtn) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px 0px -20px 0px" }
    );

    observer.observe(mainBtn);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const footer = document.getElementById("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(false);
      },
      { threshold: 0, rootMargin: "0px 0px 0px 0px" }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const handleAdd = async () => {
    if (adding || added) return;
    setAdding(true);
    try {
      await onAddToCart();
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } finally {
      setAdding(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && isAvailable && (
        <motion.div
          key="sticky"
          variants={stickyBarReveal}
          initial="initial"
          animate="animate"
          exit="exit"
          className="sticky-cart"
          role="complementary"
          aria-label="Quick add to bag"
        >
          <div className="container-luxury h-full flex items-center gap-4">
            {imageUrl != null && imageUrl !== "" && (
              <div className="sticky-cart__thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="sticky-cart__name">{productName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="sticky-cart__price">{fmt(price, currency)}</span>
                {selectedSize != null && selectedSize !== "" && (
                  <>
                    <span
                      className="text-[var(--text-tertiary)]"
                      aria-hidden="true"
                    >
                      ·
                    </span>
                    <span
                      className="text-label text-[var(--text-tertiary)]"
                      style={{ fontSize: "10px" }}
                    >
                      {selectedSize}
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={adding}
              className={[
                "sticky-cart__btn",
                added ? "sticky-cart__btn--added" : "",
              ].join(" ")}
              aria-label={added ? "Added to bag" : "Add to bag"}
            >
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span
                    key="done"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5"
                  >
                    <Check size={14} strokeWidth={2.5} />
                    Added
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5"
                  >
                    <ShoppingBag size={14} strokeWidth={1.5} />
                    Add to Bag
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
