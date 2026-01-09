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
import { AnimatePresence } from "framer-motion";

/**
 * Cart Page Client Component
 */
export function CartPageClient(): JSX.Element {
  const items = useCartStore((state) => state.items);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 pt-16 xs:pt-18 sm:pt-20 md:pt-24 pb-12 sm:pb-16">
        <Container size="lg">
          <div className="text-center py-12 xs:py-14 sm:py-16 md:py-20 lg:py-24">
            <div className="mb-6 xs:mb-7 sm:mb-8">
              <ShoppingBag className="w-16 xs:w-18 sm:w-20 h-16 xs:h-18 sm:h-20 text-charcoal-300 mx-auto" />
            </div>
            <H1 className="text-charcoal-900 mb-3 xs:mb-4 text-2xl xs:text-3xl sm:text-4xl">Your Cart Awaits</H1>
            <Body className="text-base xs:text-lg text-charcoal-600 mb-6 xs:mb-7 sm:mb-8 max-w-md mx-auto px-4">
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
    <div className="min-h-screen bg-cream-50 pt-16 xs:pt-18 sm:pt-20 md:pt-24 pb-12 sm:pb-16">
      <Container size="lg">
        <div className="mb-6 xs:mb-7 sm:mb-8">
          <H1 className="text-charcoal-900 text-2xl xs:text-3xl sm:text-4xl">Shopping Cart</H1>
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
  );
}

