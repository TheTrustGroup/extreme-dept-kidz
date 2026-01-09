"use client";

import * as React from "react";
import Image from "next/image";
import { Lock, Shield, Truck } from "lucide-react";
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
        "bg-white/90 backdrop-blur-md rounded-lg border border-cream-200/50 shadow-sm p-6 space-y-6",
        className
      )}
    >
      <div className="flex items-center justify-between pb-4 border-b border-cream-200">
        <H3 className="text-charcoal-900 font-serif font-bold">Order Summary</H3>
        <Lock className="w-5 h-5 text-charcoal-400" />
      </div>

      {/* Items List */}
      <div className="space-y-4 max-h-[300px] overflow-y-auto">
        {items.map((item) => {
          const primaryImage =
            item.product.images.find((img) => (img as ProductImage).isPrimary) ||
            item.product.images[0];
          return (
            <div key={item.id} className="flex gap-3">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0 border border-cream-200">
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.alt || item.product.name}
                  fill
                  className="object-cover"
                  sizes="64px"
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

        <div className="flex items-center justify-between pt-4 border-t-2 border-cream-300">
          <Body className="font-bold text-lg text-charcoal-900">Total</Body>
          <Body className="font-serif text-2xl font-bold text-charcoal-900">
            {formatPrice(total)}
          </Body>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="space-y-3 pt-4 border-t border-cream-200">
        <div className="flex items-center gap-2 text-xs text-charcoal-600">
          <Shield className="w-4 h-4 text-forest-600 flex-shrink-0" />
          <span>SSL Encrypted</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-charcoal-600">
          <Lock className="w-4 h-4 text-forest-600 flex-shrink-0" />
          <span>Secure Payment</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-charcoal-600">
          <Truck className="w-4 h-4 text-forest-600 flex-shrink-0" />
          <span>Free Returns</span>
        </div>
      </div>

      {/* Payment Icons */}
      <div className="pt-4 border-t border-cream-200">
        <p className="text-xs text-charcoal-500 mb-2">We accept:</p>
        <div className="flex items-center gap-2 flex-wrap">
          {["Visa", "Mastercard", "Amex", "PayPal"].map((method) => (
            <div
              key={method}
              className="px-2 py-1 bg-cream-100 rounded text-[10px] font-semibold text-charcoal-600"
            >
              {method}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

