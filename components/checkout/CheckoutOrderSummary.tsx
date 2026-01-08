"use client";

import * as React from "react";
import { useCartStore } from "@/lib/stores/cart-store";
import { H3, Body } from "@/components/ui/typography";
import { cn, formatPrice } from "@/lib/utils";
import type { ShippingMethod } from "@/types/checkout";
import type { ProductImage } from "@/types";

interface CheckoutOrderSummaryProps {
  shippingMethod?: ShippingMethod;
  className?: string;
}

const SHIPPING_COSTS: Record<ShippingMethod, number> = {
  standard: 800, // ₵8.00
  express: 1500, // ₵15.00
  overnight: 2500, // ₵25.00
};

/**
 * CheckoutOrderSummary Component
 * 
 * Order summary for checkout page.
 */
export function CheckoutOrderSummary({
  shippingMethod = "standard",
  className,
}: CheckoutOrderSummaryProps) {
  const items = useCartStore((state) => state.items);
  const getTotal = useCartStore((state) => state.getTotal);

  const subtotal = getTotal();
  const shippingCost = SHIPPING_COSTS[shippingMethod];
  const total = subtotal + shippingCost;

  return (
    <div
      className={cn(
        "bg-cream-50 rounded-lg border border-cream-200 p-6 space-y-6",
        className
      )}
    >
      <H3 className="text-charcoal-900">Order Summary</H3>

      {/* Items List */}
      <div className="space-y-4 max-h-[300px] overflow-y-auto">
        {items.map((item) => {
          const primaryImage =
            item.product.images.find((img) => (img as ProductImage).isPrimary) ||
            item.product.images[0];
          return (
            <div key={item.id} className="flex gap-3">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                <img
                  src={primaryImage.url}
                  alt={primaryImage.alt || item.product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Body className="font-semibold text-charcoal-900 line-clamp-1">
                  {item.product.name}
                </Body>
                <Body className="text-xs text-charcoal-600">
                  Size: {item.selectedSize} × {item.quantity}
                </Body>
                <Body className="text-sm font-semibold text-charcoal-900">
                  {formatPrice(item.product.price * item.quantity)}
                </Body>
              </div>
            </div>
          );
        })}
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
            {formatPrice(shippingCost)}
          </Body>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-cream-200">
          <Body className="font-semibold text-charcoal-900">Total</Body>
          <Body className="font-serif text-2xl font-semibold text-charcoal-900">
            {formatPrice(total)}
          </Body>
        </div>
      </div>
    </div>
  );
}

