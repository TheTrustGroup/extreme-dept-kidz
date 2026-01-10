"use client";

import * as React from "react";
import { useCartStore } from "@/lib/stores/cart-store";
import { Button } from "@/components/ui/button";
import { H3, Body } from "@/components/ui/typography";
import { cn, formatPrice } from "@/lib/utils";
import Link from "next/link";

interface OrderSummaryProps {
  className?: string;
}

/**
 * OrderSummary Component
 * 
 * Sidebar showing order totals and checkout button.
 */
export function OrderSummary({ className }: OrderSummaryProps): JSX.Element {
  const getTotal = useCartStore((state) => state.getTotal);

  const subtotal = getTotal();
  const shippingEstimate = subtotal >= 80000 ? 0 : 800; // Free shipping over ₵800
  const total = subtotal + shippingEstimate;

  return (
    <div
      className={cn(
        "bg-cream-50 rounded-lg border border-cream-200 p-6 space-y-6",
        className
      )}
    >
      <H3 className="text-charcoal-900">Order Summary</H3>

      {/* Promo Code */}
      <div className="space-y-2">
        <label className="font-serif text-sm font-semibold text-charcoal-900 uppercase tracking-wider">
          Promo Code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter code"
            className="flex-1 px-4 py-2 border border-cream-200 rounded-lg bg-cream-50 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 font-sans text-sm"
            disabled
          />
          <Button variant="ghost" size="sm" disabled>
            Apply
          </Button>
        </div>
        <Body className="text-xs text-charcoal-500">
          Promo codes coming soon
        </Body>
      </div>

      {/* Totals */}
      <div className="space-y-3 pt-4 border-t border-cream-200">
        <div className="flex items-center justify-between">
          <Body className="text-charcoal-700">Subtotal</Body>
          <Body className="font-semibold text-charcoal-900">
            {formatPrice(subtotal)}
          </Body>
        </div>

        <div className="flex items-center justify-between">
          <Body className="text-charcoal-700">Shipping</Body>
          <Body className="font-semibold text-charcoal-900">
            {shippingEstimate === 0 ? (
              <span className="text-forest-600">Free</span>
            ) : (
              formatPrice(shippingEstimate)
            )}
          </Body>
        </div>

        {subtotal < 80000 && (
          <Body className="text-xs text-charcoal-500">
            Add {formatPrice(80000 - subtotal)} more for free shipping
          </Body>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-cream-200">
          <Body className="font-semibold text-charcoal-900">Total</Body>
          <Body className="font-serif text-2xl font-semibold text-charcoal-900">
            {formatPrice(total)}
          </Body>
        </div>
      </div>

      {/* Checkout Button */}
      <Button variant="primary" size="lg" className="w-full" asChild>
        <Link href="/checkout">Proceed to Checkout</Link>
      </Button>

      {/* Continue Shopping */}
      <Link
        href="/collections"
        className="block text-center font-sans text-sm text-charcoal-600 hover:text-charcoal-900 transition-colors duration-200"
      >
        Continue Exploring
      </Link>
    </div>
  );
}

