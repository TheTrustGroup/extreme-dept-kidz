"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CartItem } from "@/components/cart/CartDrawer";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping?: number | "free" | null;
  currency?: string;
}

function fmt(n: number, cur = "₵") {
  return `${cur}${n.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function ItemsList({
  items,
  currency,
}: {
  items: CartItem[];
  currency: string;
}) {
  return (
    <ul className="order-summary__item-list">
      {items.map((item) => (
        <li key={item.id} className="order-summary__item">
          <div className="order-summary__item-thumb">
            <Image
              src={item.imageUrl}
              alt={item.imageAlt ?? item.name}
              fill
              sizes="56px"
              className="object-cover"
            />
            {item.quantity > 1 && (
              <span className="order-summary__item-qty">{item.quantity}</span>
            )}
          </div>
          <div className="order-summary__item-info">
            <p className="order-summary__item-name">{item.name}</p>
            {item.variantName && (
              <p className="order-summary__item-variant">{item.variantName}</p>
            )}
          </div>
          <span className="order-summary__item-price">
            {`${item.currency ?? currency}${(item.price * item.quantity).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function OrderSummary({
  items,
  subtotal,
  shipping = null,
  currency = "₵",
}: OrderSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const total =
    subtotal + (typeof shipping === "number" ? shipping : 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="order-summary">
      <button
        className="order-summary__toggle md:hidden"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <span className="order-summary__toggle-label">
            Order summary
          </span>
          <span className="order-summary__toggle-count">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center text-[var(--text-tertiary)]"
          >
            <ChevronDown size={15} strokeWidth={1.5} />
          </motion.span>
        </div>
        <span className="order-summary__toggle-total">
          {fmt(total, currency)}
        </span>
      </button>

      <div
        className={["order-summary__items", "hidden md:block"].join(" ")}
      >
        <ItemsList items={items} currency={currency} />
      </div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="mobile-items"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden md:hidden"
          >
            <ItemsList items={items} currency={currency} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="order-summary__totals">
        <div className="order-summary__row">
          <span className="order-summary__row-label">Subtotal</span>
          <span className="order-summary__row-value">
            {fmt(subtotal, currency)}
          </span>
        </div>
        <div className="order-summary__row">
          <span className="order-summary__row-label">Shipping</span>
          <span
            className={[
              "order-summary__row-value",
              shipping === "free" ? "text-[var(--color-gold)]" : "",
            ].join(" ")}
          >
            {shipping === null
              ? "Calculated next"
              : shipping === "free"
                ? "Free"
                : fmt(shipping, currency)}
          </span>
        </div>
        <div className="order-summary__row order-summary__row--total">
          <span className="order-summary__total-label">Total</span>
          <span className="order-summary__total-value">
            {fmt(total, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
