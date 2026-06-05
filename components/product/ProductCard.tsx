"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useToast } from "@/lib/stores/toast-store";

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
  defaultSize?: string;
  collectionSlug?: string;
  priority?: boolean;
  onAddToCart?: (id: string) => void;
  index?: number;
}

function formatPrice(amount: number, currency = "₵"): string {
  return `${currency}${amount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

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
      className={[
        "product-card__badge",
        "absolute z-10",
        "top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 md:top-3 md:left-3",
        "inline-flex max-w-[min(72px,calc(100%-8px))] sm:max-w-[min(88px,calc(100%-12px))]",
        "items-center justify-center",
        "px-2 py-0.5 sm:px-2.5 md:px-3",
        "text-compact-sm leading-compact-tight",
        "font-semibold uppercase tracking-compact-label",
        "truncate",
        styles[type],
      ].join(" ")}
    >
      {labels[type]}
    </span>
  );
}

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
  defaultSize,
  priority = false,
  onAddToCart,
  index = 0,
}: ProductCardProps) {
  const { success, error } = useToast();
  const shouldReduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [adding, setAdding] = useState(false);

  const isSoldOut = !isAvailable || badge === "sold-out";
  const isOnSale = compareAtPrice != null && compareAtPrice > price;
  const imageUnoptimized =
    imageUrl.startsWith("data:") || imageUrl.startsWith("blob:");
  const addLabel = defaultSize ? `Add · ${defaultSize}` : "Add";

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

  const motionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 } as const,
        animate: { opacity: 1, y: 0 } as const,
        transition: {
          duration: 0.45,
          delay: index * 0.07,
          ease: [0.16, 1, 0.3, 1] as const,
        },
      };

  return (
    <motion.article
      {...motionProps}
      className="product-card group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="product-card__media">
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

            <div
              className={[
                "product-card__image",
                isSoldOut ? "opacity-60" : "",
              ].join(" ")}
            >
              <Image
                src={imageUrl}
                alt={imageAlt ?? name}
                fill
                unoptimized={imageUnoptimized}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={[
                  "product-card__photo",
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
          </div>
        </Link>

        <AnimatePresence>
          {hovered && !isSoldOut && (
            <motion.div
              key="cta-overlay"
              initial={shouldReduceMotion ? false : { y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { y: "100%", opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="product-card__hover-cta"
            >
              <button
                type="button"
                className="product-card__hover-btn"
                onClick={handleAddToCart}
                aria-label={`Add ${name}${defaultSize ? `, size ${defaultSize}` : ""} to bag`}
              >
                {adding ? (
                  <span className="flex items-center gap-2">
                    <span className="product-card__added-dot" aria-hidden="true" />
                    Added
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShoppingBag size={14} strokeWidth={1.5} />
                    {defaultSize ? `Add · ${defaultSize}` : "Add to Bag"}
                  </span>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="product-card__info">
        <Link
          href={`/products/${slug}`}
          className="product-card__info-link block"
        >
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
        </Link>

        {!isSoldOut && (
          <button
            type="button"
            className="product-card__mobile-cta"
            onClick={handleAddToCart}
            aria-label={`Add ${name}${defaultSize ? `, size ${defaultSize}` : ""} to bag`}
          >
            {adding ? (
              <span className="flex items-center justify-center gap-1.5">
                <span className="product-card__added-dot" />
                Added
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <ShoppingBag size={13} strokeWidth={1.5} />
                {addLabel}
              </span>
            )}
          </button>
        )}
        {isSoldOut && (
          <p className="product-card__sold-out-label md:hidden">Sold out</p>
        )}
      </div>
    </motion.article>
  );
}
