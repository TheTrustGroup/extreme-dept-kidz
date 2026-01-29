"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { Container } from "@/components/ui/container";
import { H1, Body } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { CartItemPage } from "@/components/cart/CartItemPage";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { CompleteYourLook } from "@/components/cart/CompleteYourLook";
import { AnimatePresence, m } from "framer-motion";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn, formatPrice } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

/**
 * Cart Page Client Component
 */
export function CartPageClient(): JSX.Element {
  const { theme } = useTheme();
  const items = useCartStore((state) => state.items);
  const getTotal = useCartStore((state) => state.getTotal);
  
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shopping Cart" },
  ];

  // Calculate totals for mobile sticky button
  const subtotal = getTotal();
  const FREE_SHIPPING_THRESHOLD = 80000;
  const SHIPPING_COST = 800;
  const TAX_RATE = 0.125;
  const shippingEstimate = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const taxEstimate = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shippingEstimate + taxEstimate;

  if (items.length === 0) {
    return (
      <div className={cn(
        "min-h-screen pt-16 xs:pt-18 sm:pt-20 md:pt-24 pb-12 sm:pb-16 transition-colors duration-300",
        theme === "dark" ? "bg-dark-bg-primary" : "bg-cream-50"
      )}>
        <Container size="lg">
          {/* Breadcrumb */}
          <div className="mb-6 sm:mb-8">
            <Breadcrumb items={breadcrumbItems} generateStructuredData={false} />
          </div>
          
          <div className="text-center py-12 xs:py-14 sm:py-16 md:py-20 lg:py-24">
            <div className="mb-6 xs:mb-7 sm:mb-8">
              <ShoppingBag className={cn(
                "w-16 xs:w-18 sm:w-20 h-16 xs:h-18 sm:h-20 mx-auto",
                theme === "dark" ? "text-dark-text-muted" : "text-charcoal-300"
              )} />
            </div>
            <H1 className={cn(
              "mb-3 xs:mb-4 text-2xl xs:text-3xl sm:text-4xl",
              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
            )}>
              Your Cart Awaits
            </H1>
            <Body className={cn(
              "text-base xs:text-lg mb-6 xs:mb-7 sm:mb-8 max-w-md mx-auto px-4",
              theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
            )}>
              Begin curating your collection. Explore our thoughtfully designed pieces, each crafted to become a cherished part of your family&apos;s story.
            </Body>
            <Link href="/collections">
              <Button variant="primary" size="lg" className="w-full xs:w-auto">
                Explore Collections
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <>
      <div className={cn(
        "min-h-screen pt-16 xs:pt-18 sm:pt-20 md:pt-24 pb-24 sm:pb-28 md:pb-16 transition-colors duration-300",
        theme === "dark" ? "bg-dark-bg-primary" : "bg-cream-50"
      )}>
        <Container size="lg">
          {/* Breadcrumb */}
          <div className="mb-6 sm:mb-8">
            <Breadcrumb items={breadcrumbItems} generateStructuredData={false} />
          </div>

          <div className="mb-6 xs:mb-7 sm:mb-8">
            <H1 className={cn(
              "text-2xl xs:text-3xl sm:text-4xl",
              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
            )}>
              Shopping Cart
            </H1>
            <Body className={cn(
              "mt-2 text-sm",
              theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
            )}>
              {items.length} {items.length === 1 ? "item" : "items"} in your cart
            </Body>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xs:gap-7 sm:gap-8 lg:gap-10 xl:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4 xs:space-y-5 sm:space-y-6 order-2 lg:order-1">
              <AnimatePresence>
                {items.map((item) => (
                  <CartItemPage key={item.id} item={item} />
                ))}
              </AnimatePresence>

              {/* Complete Your Look Recommendations */}
              <CompleteYourLook />
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="lg:sticky lg:top-20 xl:top-24">
                <OrderSummary />
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Mobile Sticky Checkout Button */}
      <m.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
          "border-t shadow-lg",
          theme === "dark"
            ? "bg-dark-surface border-dark-border-glass"
            : "bg-cream-50 border-cream-200"
        )}
      >
        <div className="px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Body className={cn(
                "text-xs font-medium",
                theme === "dark" ? "text-dark-text-muted" : "text-charcoal-500"
              )}>
                Total
              </Body>
              <Body className={cn(
                "font-serif text-xl font-semibold",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                {formatPrice(total)}
              </Body>
            </div>
            <Button variant="primary" size="lg" className="flex-1 ml-4 max-w-[200px]" asChild>
              <Link href="/checkout">Checkout</Link>
            </Button>
          </div>
          {subtotal < FREE_SHIPPING_THRESHOLD && (
            <Body className={cn(
              "text-xs text-center",
              theme === "dark" ? "text-dark-text-muted" : "text-charcoal-500"
            )}>
              Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
            </Body>
          )}
        </div>
      </m.div>
    </>
  );
}

