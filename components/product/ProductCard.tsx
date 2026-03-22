"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Eye } from "lucide-react";
import { useToast } from "@/lib/stores/toast-store";

// ─── Types ────────────────────────────────────────────────────────
export interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  currency?: string;
  imageUrl: string;
  imageAlt?: string;
  badge?: "new" | "sale" | "sold-out" | null;
  isAvailable?: boolean;
  collectionSlug?: string;
  priority?: boolean;
  onQuickView?: (id: string) => void;
  onAddToCart?: (id: string) => void;
  index?: number;
}

// ─── Price formatter (expects display amount e.g. cedis) ───────────
function formatPrice(amount: number, currency = "₵"): string {
  return `${currency}${amount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ─── Badge component ──────────────────────────────────────────────
function CardBadge({
  type,
}: {
  type: NonNullable<ProductCardProps["badge"]>;
}) {
  const styles: Record<string, string> = {
    new: "bg-[var(--color-gold)] text-[var(--color-navy)]",
    sale: "bg-[var(--color-navy)] text-[var(--color-cream)]",
    "sold-out":
      "bg-[var(--bg-surface-2)] text-[var(--text-tertiary)] border border-[var(--border-default)]",
  };
  const labels: Record<string, string> = {
    new: "New",
    sale: "Sale",
    "sold-out": "Sold Out",
  };
  return (
    <span
      className={["absolute top-3 left-3 z-10", "px-2 py-1 text-label", styles[type]].join(" ")}
      style={{ fontSize: "10px", letterSpacing: "0.1em" }}
    >
      {labels[type]}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────
export default function ProductCard({
  id,
  slug,
  name,
  price,
  compareAtPrice,
  currency = "₵",
  imageUrl,
  imageAlt,
  badge,
  isAvailable = true,
  priority = false,
  onQuickView,
  onAddToCart,
  index = 0,
}: ProductCardProps) {
  const { success, error } = useToast();
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [adding, setAdding] = useState(false);

  const isSoldOut = !isAvailable || badge === "sold-out";
  const isOnSale = compareAtPrice != null && compareAtPrice > price;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut || adding) return;
    setAdding(true);
    try {
      await onAddToCart?.(id);
      success("Added to bag", name);
      setTimeout(() => setAdding(false), 1200);
    } catch {
      error("Could not add to bag", "Please try again.");
      setAdding(false);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(id);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="product-card group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={`/products/${slug}`}
        className="block"
        aria-label={`View ${name} — ${formatPrice(price, currency)}`}
      >
        <div className="product-card__image-wrap">
          {badge && badge !== "sold-out" && isAvailable && (
            <CardBadge type={badge} />
          )}
          {isSoldOut && <CardBadge type="sold-out" />}

          <AnimatePresence>
            {hovered && !isSoldOut && onQuickView && (
              <motion.button
                key="qv"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className={[
                  "absolute top-3 right-3 z-10",
                  "w-9 h-9 rounded-full",
                  "bg-[var(--bg-surface)]/90 backdrop-blur-sm",
                  "border border-[var(--border-default)]",
                  "flex items-center justify-center",
                  "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                  "transition-colors duration-150",
                  "hidden md:flex",
                ].join(" ")}
                onClick={handleQuickView}
                aria-label={`Quick view ${name}`}
                tabIndex={-1}
              >
                <Eye size={15} strokeWidth={1.5} />
              </motion.button>
            )}
          </AnimatePresence>

          <div
            className={["product-card__image", isSoldOut ? "opacity-60" : ""].join(" ")}
          >
            <Image
              src={imageUrl}
              alt={imageAlt ?? name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={[
                "object-cover object-center",
                "transition-all duration-500 ease-out",
                hovered && !isSoldOut ? "scale-[1.03]" : "scale-100",
                imgLoaded ? "opacity-100" : "opacity-0",
              ].join(" ")}
              onLoad={() => setImgLoaded(true)}
              priority={priority}
            />
            {!imgLoaded && (
              <div
                className="absolute inset-0 product-card__skeleton"
                aria-hidden="true"
              />
            )}
          </div>

          <AnimatePresence>
            {hovered && !isSoldOut && (
              <motion.div
                key="cta-overlay"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="product-card__hover-cta"
                aria-hidden="true"
              >
                <button
                  className="product-card__hover-btn"
                  onClick={handleAddToCart}
                  tabIndex={-1}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {adding ? (
                      <motion.span
                        key="added"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2"
                      >
                        <span
                          className="product-card__added-dot"
                          aria-hidden="true"
                        />
                        Added
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2"
                      >
                        <ShoppingBag size={14} strokeWidth={1.5} />
                        Add to Bag
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="product-card__info">
          <p className="product-card__name">{name}</p>

          <div className="product-card__price-row">
            <span
              className={[
                "product-card__price",
                isOnSale ? "text-[#c0392b]" : "",
              ].join(" ")}
            >
              {formatPrice(price, currency)}
            </span>
            {isOnSale && compareAtPrice != null && (
              <span className="product-card__compare-price">
                {formatPrice(compareAtPrice, currency)}
              </span>
            )}
          </div>

          {!isSoldOut && (
            <button
              className="product-card__mobile-cta"
              onClick={handleAddToCart}
              aria-label={`Add ${name} to bag`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {adding ? (
                  <motion.span
                    key="m-added"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-1.5"
                  >
                    <span className="product-card__added-dot" />
                    Added
                  </motion.span>
                ) : (
                  <motion.span
                    key="m-add"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag size={13} strokeWidth={1.5} />
                    Add
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )}
          {isSoldOut && (
            <p className="product-card__sold-out-label md:hidden">Sold out</p>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
