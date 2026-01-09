"use client";

import * as React from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { Container } from "@/components/ui/container";
import { H2 } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface NewArrivalsSectionProps {
  products?: Product[];
}

export function NewArrivalsSection({ products = [] }: NewArrivalsSectionProps): JSX.Element {
  // Mock products for now - will be replaced with real data
  const newArrivals = products.length > 0 
    ? products.slice(0, 8)
    : [];

  return (
    <section className="py-12 xs:py-14 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-cream-50">
      <Container size="lg">
        <div className="space-y-8 xs:space-y-10 sm:space-y-12 md:space-y-14 lg:space-y-16">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <H2 className="text-charcoal-900 text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-serif font-bold">
                JUST DROPPED
              </H2>
            </m.div>
            <m.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Button
                variant="secondary"
                size="sm"
                className="hidden sm:flex items-center space-x-2"
                asChild
              >
                <Link href="/collections/new-arrivals">
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </m.div>
          </div>

          {/* Horizontal Scrollable Carousel (Desktop) / Grid (Mobile) */}
          <div className="relative">
            {/* Desktop: Horizontal Scroll */}
            <div className="hidden lg:flex overflow-x-auto scrollbar-hide pb-6 -mx-4 px-4 gap-6 xl:gap-8">
              {newArrivals.length > 0 ? (
                newArrivals.map((product, index) => (
                  <m.div
                    key={product.id}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="flex-shrink-0 w-[280px] xl:w-[320px]"
                  >
                    <ProductCard product={product} />
                  </m.div>
                ))
              ) : (
                <div className="text-center py-16 text-charcoal-600">
                  <p>New arrivals coming soon</p>
                </div>
              )}
            </div>

            {/* Mobile/Tablet: Grid */}
            <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {newArrivals.length > 0 ? (
                newArrivals.slice(0, 6).map((product, index) => (
                  <m.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </m.div>
                ))
              ) : (
                <div className="col-span-full text-center py-16 text-charcoal-600">
                  <p>New arrivals coming soon</p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile View All Button */}
          <div className="lg:hidden text-center">
            <Button variant="secondary" size="sm" asChild>
              <Link href="/collections/new-arrivals">
                View All New Arrivals
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
