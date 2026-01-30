"use client";

import * as React from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { Container } from "@/components/ui/container";
import { H2, Body } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/types";

interface GirlsCollectionSectionProps {
  products?: Product[];
}

export function GirlsCollectionSection({ products }: GirlsCollectionSectionProps): JSX.Element {
  // Use provided products only; never mock in production (empty if undefined)
  const girlsProducts = React.useMemo(() => {
    const sourceProducts = Array.isArray(products) ? products : [];
    return sourceProducts
      .filter((p) => p.category?.slug === "girls")
      .slice(0, 4);
  }, [products]);

  return (
    <section 
      // Design System: Large section spacing - 48px mobile, 64px tablet, 96px desktop
      className="py-12 md:py-16 lg:py-24 bg-cream-50"
      aria-labelledby="girls-collection-heading"
    >
      <Container size="lg">
        {/* Design System: Medium spacing between header and content - 24px mobile, 32px desktop */}
        <div className="space-y-6 lg:space-y-8">
          {/* Section Header */}
          <m.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <H2 
              id="girls-collection-heading"
              className="text-charcoal-900"
            >
              For Her
            </H2>
            <Body className="mt-2 sm:mt-4 text-charcoal-600">
              Select styles for girls
            </Body>
          </m.div>

          {/* Products Grid - Single Row, 4 Products */}
          {girlsProducts.length > 0 ? (
            <>
              <div 
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 md:gap-6"
                role="list"
                aria-label="Girls collection products"
              >
                {girlsProducts.map((product, index) => (
                  <m.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    role="listitem"
                  >
                    <ProductCard product={product} />
                  </m.div>
                ))}
              </div>

              {/* Link to Girls Collection */}
              <div className="text-center">
                <Button
                  variant="secondary"
                  size="sm"
                  className="inline-flex items-center space-x-2 min-h-[44px]"
                  asChild
                >
                  <Link href="/collections/girls" aria-label="View girls collection">
                    <span>View Girls Collection</span>
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-center py-12"
            >
              <Body className="text-charcoal-600 mb-6">
                Our Girls collection is launching soon. Be the first to know when it drops!
              </Body>
              <Button
                variant="primary"
                size="lg"
                className="inline-flex items-center space-x-2 min-h-[44px]"
                asChild
              >
                <Link href="/collections/girls" aria-label="View girls collection coming soon">
                  <span>Learn More</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </Button>
            </m.div>
          )}
        </div>
      </Container>
    </section>
  );
}
