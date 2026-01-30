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
import { cn } from "@/lib/utils";

interface GirlsCollectionSectionProps {
  products?: Product[];
}

/**
 * Shop Girls — Renders only when there are girls products.
 * World-class: clear purpose ("Shop Girls"), no empty or redundant block.
 */
export function GirlsCollectionSection({ products }: GirlsCollectionSectionProps): JSX.Element | null {
  const girlsProducts = React.useMemo(() => {
    const sourceProducts = Array.isArray(products) ? products : [];
    return sourceProducts
      .filter((p) => p.category?.slug === "girls")
      .slice(0, 4);
  }, [products]);

  // Only show section when we have girls products — no empty block
  if (girlsProducts.length === 0) return null;

  return (
    <section
      className={cn(
        "py-12 md:py-16 lg:py-24",
        "bg-cream-50 dark:bg-dark-bg-primary"
      )}
      aria-labelledby="shop-girls-heading"
    >
      <Container size="lg">
        <div className="space-y-6 lg:space-y-8">
          <m.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <H2
              id="shop-girls-heading"
              className="text-charcoal-900 dark:text-dark-text-primary"
            >
              Shop Girls
            </H2>
            <Body className="mt-2 sm:mt-4 text-charcoal-600 dark:text-dark-text-secondary">
              Curated for her
            </Body>
          </m.div>

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

          <div className="text-center">
            <Button
              variant="secondary"
              size="sm"
              className="inline-flex items-center gap-2 min-h-[44px]"
              asChild
            >
              <Link href="/collections/girls" aria-label="View girls collection">
                <span>View Girls Collection</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
