"use client";

import { motion } from "framer-motion";

interface FreeShippingBarProps {
  subtotal: number;
  currency: string;
}

export function FreeShippingBar({ subtotal, currency }: FreeShippingBarProps) {
  const threshold = 500;
  const progress = Math.min((subtotal / threshold) * 100, 100);
  const remaining = Math.max(threshold - subtotal, 0);
  const achieved = subtotal >= threshold;

  return (
    <div className="free-shipping-bar">
      <p className="free-shipping-bar__text">
        {achieved ? (
          <span className="text-[var(--color-gold)]">
            🎉 You&apos;ve unlocked free shipping!
          </span>
        ) : (
          <>
            <span>Add </span>
            <span className="font-semibold text-[var(--text-primary)]">
              {`${currency}${remaining.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
            <span> more for free shipping</span>
          </>
        )}
      </p>
      <div className="free-shipping-bar__track" aria-hidden="true">
        <motion.div
          className="free-shipping-bar__fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
