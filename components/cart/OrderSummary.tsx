"use client";

import * as React from "react";
import { m } from "framer-motion";
import { CheckCircle2, Shield, Lock, CreditCard, Truck, Calendar } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { Button } from "@/components/ui/button";
import { H3, Body } from "@/components/ui/typography";
import { cn, formatPrice } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import Link from "next/link";

interface OrderSummaryProps {
  className?: string;
}

const FREE_SHIPPING_THRESHOLD = 80000; // ₵800.00
const SHIPPING_COST = 800; // ₵8.00
const TAX_RATE = 0.125; // 12.5% VAT in Ghana

/**
 * Calculate estimated delivery date (5-7 business days)
 */
function getEstimatedDeliveryDate(): string {
  const today = new Date();
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + 7); // Add 7 days
  
  return deliveryDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * OrderSummary Component
 * 
 * Enhanced sidebar showing order totals, free shipping progress, tax, delivery date, and security badges.
 */
export function OrderSummary({ className }: OrderSummaryProps): JSX.Element {
  const { theme } = useTheme();
  const getTotal = useCartStore((state) => state.getTotal);
  const [promoCode, setPromoCode] = React.useState("");
  const [promoError, setPromoError] = React.useState<string | null>(null);
  const [promoApplied, setPromoApplied] = React.useState(false);

  const subtotal = getTotal();
  const shippingEstimate = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const taxEstimate = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shippingEstimate + taxEstimate;
  
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const estimatedDelivery = getEstimatedDeliveryDate();

  const handlePromoCode = (e: React.FormEvent): void => {
    e.preventDefault();
    setPromoError(null);
    
    // TODO: Validate promo code with backend
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }
    
    // Mock validation - replace with actual API call
    if (promoCode.toUpperCase() === "WELCOME10") {
      setPromoApplied(true);
      setPromoError(null);
    } else {
      setPromoError("Invalid promo code");
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-4 sm:p-6 space-y-4 sm:space-y-6",
        theme === "dark"
          ? "bg-dark-surface border-dark-border-glass"
          : "bg-cream-50 border-cream-200 glass-panel",
        className
      )}
    >
      <H3 className={cn(
        theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
      )}>
        Order Summary
      </H3>

      {/* Free Shipping Progress Bar */}
      {subtotal < FREE_SHIPPING_THRESHOLD && (
        <div className="space-y-2 p-3 rounded-lg bg-cream-100 dark:bg-dark-bg-secondary">
          <div className="flex items-center justify-between text-xs">
            <span className={cn(
              "font-medium",
              theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
            )}>
              Free shipping progress
            </span>
            <span className={cn(
              "font-semibold",
              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
            )}>
              {formatPrice(freeShippingRemaining)} to go
            </span>
          </div>
          <div className={cn(
            "h-2 rounded-full overflow-hidden",
            theme === "dark" ? "bg-dark-bg-primary" : "bg-cream-200"
          )}>
            <m.div
              className="h-full bg-forest-600 transition-all duration-300"
              initial={{ width: 0 }}
              animate={{ width: `${freeShippingProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <Body className={cn(
            "text-xs",
            theme === "dark" ? "text-dark-text-muted" : "text-charcoal-600"
          )}>
            Add {formatPrice(freeShippingRemaining)} more for free shipping
          </Body>
        </div>
      )}

      {/* Estimated Delivery */}
      <div className={cn(
        "flex items-center gap-2 p-3 rounded-lg",
        theme === "dark" ? "bg-dark-bg-secondary" : "bg-cream-100"
      )}>
        <Calendar className={cn(
          "w-4 h-4 flex-shrink-0",
          theme === "dark" ? "text-accent-primary" : "text-forest-600"
        )} />
        <div className="flex-1 min-w-0">
          <Body className={cn(
            "text-xs font-semibold mb-0.5",
            theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
          )}>
            Estimated Delivery
          </Body>
          <Body className={cn(
            "text-xs",
            theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
          )}>
            {estimatedDelivery}
          </Body>
        </div>
      </div>

      {/* Promo Code */}
      <div className="space-y-2">
        <label className={cn(
          "block font-serif text-sm font-semibold uppercase tracking-wider",
          theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
        )}>
          Promo Code
        </label>
        <form onSubmit={handlePromoCode} className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => {
              setPromoCode(e.target.value);
              setPromoError(null);
              setPromoApplied(false);
            }}
            placeholder="Enter code"
            className={cn(
              "flex-1 px-4 py-2 border rounded-lg text-sm font-sans",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              promoError
                ? theme === "dark"
                  ? "border-red-400 bg-dark-surface text-dark-text-primary focus:border-red-400 focus:ring-red-400/20"
                  : "border-red-400 bg-white text-charcoal-900 focus:border-red-400 focus:ring-red-400/20"
                : promoApplied
                  ? theme === "dark"
                    ? "border-green-400 bg-dark-surface text-dark-text-primary focus:border-green-400 focus:ring-green-400/20"
                    : "border-green-400 bg-white text-charcoal-900 focus:border-green-400 focus:ring-green-400/20"
                  : theme === "dark"
                    ? "border-dark-border-glass bg-dark-bg-secondary text-dark-text-primary placeholder:text-dark-text-muted focus:border-accent-primary focus:ring-accent-primary/20"
                    : "border-cream-200 bg-cream-50 text-charcoal-900 placeholder:text-charcoal-400 focus:border-navy-900 focus:ring-navy-500/20",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            disabled={promoApplied}
            aria-invalid={promoError ? "true" : "false"}
            aria-describedby={promoError ? "promo-error" : undefined}
          />
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            disabled={promoApplied || !promoCode.trim()}
            className="min-w-[80px]"
          >
            {promoApplied ? "Applied" : "Apply"}
          </Button>
        </form>
        {promoError && (
          <Body
            id="promo-error"
            className="text-xs text-red-600 dark:text-red-400"
            role="alert"
          >
            {promoError}
          </Body>
        )}
        {promoApplied && (
          <Body className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Promo code applied! 10% discount will be applied at checkout.
          </Body>
        )}
      </div>

      {/* Totals */}
      <div className="space-y-3 pt-4 border-t border-cream-200 dark:border-dark-border-glass">
        <div className="flex items-center justify-between">
          <Body className={cn(
            theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
          )}>
            Subtotal
          </Body>
          <Body className={cn(
            "font-semibold",
            theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
          )}>
            {formatPrice(subtotal)}
          </Body>
        </div>

        <div className="flex items-center justify-between">
          <Body className={cn(
            theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
          )}>
            Shipping
          </Body>
          <Body className={cn(
            "font-semibold",
            theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
          )}>
            {shippingEstimate === 0 ? (
              <span className="text-forest-600 dark:text-green-400">Free</span>
            ) : (
              formatPrice(shippingEstimate)
            )}
          </Body>
        </div>

        <div className="flex items-center justify-between">
          <Body className={cn(
            theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
          )}>
            Tax (VAT)
          </Body>
          <Body className={cn(
            "font-semibold",
            theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
          )}>
            {formatPrice(taxEstimate)}
          </Body>
        </div>

        <div className={cn(
          "flex items-center justify-between pt-4 border-t",
          theme === "dark" ? "border-dark-border-glass" : "border-cream-200"
        )}>
          <Body className={cn(
            "font-semibold text-lg",
            theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
          )}>
            Total
          </Body>
          <Body className={cn(
            "font-serif text-2xl font-semibold",
            theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
          )}>
            {formatPrice(total)}
          </Body>
        </div>
      </div>

      {/* Security Badges */}
      <div className="pt-4 border-t border-cream-200 dark:border-dark-border-glass">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <Shield className={cn(
              "w-4 h-4",
              theme === "dark" ? "text-accent-primary" : "text-forest-600"
            )} />
            <span className={cn(
              "text-xs font-medium",
              theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
            )}>
              Secure Checkout
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className={cn(
              "w-4 h-4",
              theme === "dark" ? "text-accent-primary" : "text-forest-600"
            )} />
            <span className={cn(
              "text-xs font-medium",
              theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
            )}>
              SSL Encrypted
            </span>
          </div>
        </div>
        
        {/* Payment Icons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            "text-xs",
            theme === "dark" ? "text-dark-text-muted" : "text-charcoal-500"
          )}>
            We accept:
          </span>
          <div className="flex items-center gap-1.5">
            <CreditCard className={cn(
              "w-4 h-4",
              theme === "dark" ? "text-dark-text-muted" : "text-charcoal-400"
            )} />
            <span className={cn(
              "text-xs font-medium",
              theme === "dark" ? "text-dark-text-muted" : "text-charcoal-500"
            )}>
              Cards
            </span>
          </div>
          <span className={cn(
            "text-xs",
            theme === "dark" ? "text-dark-text-muted" : "text-charcoal-400"
          )}>
            •
          </span>
          <span className={cn(
            "text-xs font-medium",
            theme === "dark" ? "text-dark-text-muted" : "text-charcoal-500"
          )}>
            Mobile Money
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      <Button variant="primary" size="lg" className="w-full" asChild>
        <Link href="/checkout">Proceed to Checkout</Link>
      </Button>

      {/* Continue Shopping */}
      <Link
        href="/collections"
        className={cn(
          "block text-center font-sans text-sm transition-colors duration-200",
          theme === "dark"
            ? "text-dark-text-secondary hover:text-dark-text-primary"
            : "text-charcoal-600 hover:text-charcoal-900"
        )}
      >
        Continue Shopping
      </Link>
    </div>
  );
}
