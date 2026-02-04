"use client";

/** Displays store price (pesewas) in the user's selected currency. */
import * as React from "react";
import { useFormattedPrice } from "@/components/providers/CurrencyProvider";

export interface FormattedPriceProps {
  value: number;
  originalValue?: number;
  className?: string;
  as?: "span" | "p";
  showOriginal?: boolean;
}

export function FormattedPrice({
  value,
  originalValue,
  className,
  as: Component = "span",
  showOriginal = true,
}: FormattedPriceProps): JSX.Element {
  const formatPrice = useFormattedPrice();
  const formatted = formatPrice(value);
  const formattedOriginal =
    originalValue != null && originalValue !== value ? formatPrice(originalValue) : null;

  return (
    <Component className={className}>
      {formatted}
      {showOriginal && formattedOriginal && (
        <span className="ml-2 text-base font-normal text-charcoal-500 dark:text-dark-text-muted line-through">
          {formattedOriginal}
        </span>
      )}
    </Component>
  );
}
