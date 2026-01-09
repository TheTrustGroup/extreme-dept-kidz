"use client";

import * as React from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { Container } from "@/components/ui/container";
import { H2, Body } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { mockProducts } from "@/lib/mock-data";
import type { Product } from "@/types";

interface GirlsCollectionSectionProps {
  products?: Product[];
}

export function GirlsCollectionSection({ products }: GirlsCollectionSectionProps): JSX.Element {
  // Use provided products or fallback to mock data filtered by girls category
  const girlsProducts = React.useMemo(() => {
    const sourceProducts = products || mockProducts;
    return sourceProducts
      .filter((p) => p.category.slug === "girls")
      .slice(0, 4);
  }, [products]);

  return (
    <section className="py-12 xs:py-14 sm:py-16 md:py-20 lg:py-24 bg-cream-50">
      <Container size="lg">
        <div className="space-y-6 xs:space-y-8 sm:space-y-10">
          {/* Section Header */}
          <m.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <H2 className="text-charcoal-900 text-xl xs:text-2xl sm:text-3xl font-serif font-semibold">
              For Her
            </H2>
            <Body className="mt-2 text-charcoal-600 text-sm sm:text-base">
              Select styles for girls
            </Body>
          </m.div>

          {/* Products Grid - Single Row, 4 Products */}
          {girlsProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {girlsProducts.map((product, index) => (
                <m.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </m.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-charcoal-500 text-sm">
              <p>Girls collection coming soon</p>
            </div>
          )}

          {/* Link to Girls Collection */}
          <div className="text-center">
            <Button
              variant="secondary"
              size="sm"
              className="inline-flex items-center space-x-2"
              asChild
            >
              <Link href="/collections/girls">
                <span>View Girls Collection</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
