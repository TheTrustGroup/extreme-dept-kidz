"use client";

import * as React from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { Container } from "@/components/ui/container";
import { H2 } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { ScrollIndicator } from "@/components/home/ScrollIndicator";
import { mockProducts } from "@/lib/mock-data";
import type { Product } from "@/types";

interface NewArrivalsSectionProps {
  products?: Product[];
}

export function NewArrivalsSection({ products }: NewArrivalsSectionProps): JSX.Element {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  
  // Use provided products or fallback to mock data
  // Show products with "new" tag first, then fallback to most recent products
  const newArrivals = React.useMemo(() => {
    const sourceProducts = products || mockProducts;
    
    // First, try to get products with "new" tag
    const taggedNew = sourceProducts.filter((product) => product.tags?.includes("new"));
    
    // If we have products with "new" tag, use those
    if (taggedNew.length > 0) {
      return taggedNew.slice(0, 8);
    }
    
    // Otherwise, show the most recent products (sorted by createdAt if available, otherwise by order in array)
    const sorted = [...sourceProducts].sort((a, b) => {
      // Sort by createdAt if available (newest first)
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // Fallback: keep original order (newest products are typically added last)
      return 0;
    });
    
    return sorted.slice(0, 8);
  }, [products]);

  return (
    <section 
      className="section reveal bg-cream-50 [data-theme='dark']:bg-dark-bg-primary"
      aria-labelledby="new-arrivals-heading"
    >
      <Container size="lg">
        {/* Design System: Consistent spacing using 8px base scale */}
        <div className="space-y-[var(--space-8)] lg:space-y-[var(--space-12)]">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[var(--space-4)] sm:gap-[var(--space-6)]">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <H2 
                id="new-arrivals-heading"
                className="text-charcoal-900"
              >
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
                className="hidden sm:flex items-center gap-2 min-h-[44px] touch-manipulation"
                asChild
              >
                <Link href="/collections/new-arrivals" aria-label="View all new arrivals">
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </Button>
            </m.div>
          </div>

          {/* Horizontal Scrollable Carousel (Desktop) / Grid (Mobile) */}
          <div className="relative" role="region" aria-label="New arrivals products">
            {/* Desktop: Horizontal Scroll */}
            <div 
              ref={carouselRef}
              // Design System: Consistent spacing using 8px base scale
              className="hidden lg:flex overflow-x-auto scrollbar-hide pb-[var(--space-6)] -mx-[var(--space-4)] px-[var(--space-4)] gap-[var(--space-6)]"
              data-scroll-container
              style={{
                WebkitOverflowScrolling: 'touch',
                transform: 'translateZ(0)',
                willChange: 'scroll-position',
                contain: 'layout style paint',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(61, 61, 61, 0.3) transparent',
              }}
              role="list"
              aria-label="New arrivals carousel"
            >
              {newArrivals.length > 0 ? (
                newArrivals.map((product, index) => (
                  <m.div
                    key={product.id}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    // Fixed width to prevent layout shift
                    className="flex-shrink-0 w-[280px]"
                    role="listitem"
                  >
                    <ProductCard product={product} />
                  </m.div>
                ))
              ) : (
                <div className="text-center py-16 text-charcoal-600" role="status" aria-live="polite">
                  <p>New arrivals coming soon</p>
                </div>
              )}
            </div>
            
            {/* Scroll Indicators - Design System: Tier 3 */}
            <ScrollIndicator containerRef={carouselRef} className="hidden lg:block" />

            {/* Mobile/Tablet: Grid - Touch-friendly spacing */}
            <div 
              // Design System: Consistent spacing using 8px base scale
              className="lg:hidden grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-[var(--space-4)] sm:gap-[var(--space-5)] md:gap-[var(--space-6)]"
              role="list"
              aria-label="New arrivals grid"
            >
              {newArrivals.length > 0 ? (
                newArrivals.slice(0, 6).map((product, index) => (
                  <m.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    // Prevent layout shift with consistent structure
                    className="w-full"
                    role="listitem"
                  >
                    <ProductCard product={product} />
                  </m.div>
                ))
              ) : (
                <div className="col-span-full text-center py-16 text-charcoal-600" role="status" aria-live="polite">
                  <p>New arrivals coming soon</p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile View All Button - Touch-friendly */}
          <div className="lg:hidden text-center pt-[var(--space-4)]">
            <Button 
              variant="secondary" 
              size="md" 
              className="min-h-[48px] w-full sm:w-auto touch-manipulation" 
              asChild
            >
              <Link href="/collections/new-arrivals" aria-label="View all new arrivals">
                View All New Arrivals
                <ChevronRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
