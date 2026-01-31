import Link from "next/link";
import { Container } from "@/components/ui/container";
import { H2 } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/types";
import {
  type JustDroppedFilter,
  JUST_DROPPED_FILTERS,
} from "@/lib/utils/just-dropped";
import { cn } from "@/lib/utils";

interface JustDroppedSectionProps {
  /** Products already sorted and filtered by page (server). */
  products: Product[];
  /** Current filter from URL (?filter=). */
  currentFilter: JustDroppedFilter;
}

/** Placeholder when fewer than 4 products. Not a product — no link, no Quick View. */
function PlaceholderCard(): JSX.Element {
  return (
    <div
      className={cn(
        "product-card-placeholder w-full flex flex-col items-center justify-center p-8 rounded-xl",
        "bg-cream-50 dark:bg-dark-surface border-2 border-dashed border-cream-200 dark:border-dark-border-glass",
        "text-charcoal-600 dark:text-dark-text-secondary cursor-default select-none",
        "min-h-[280px] sm:min-h-[320px]"
      )}
      style={{ aspectRatio: "4 / 5" }}
      aria-hidden="true"
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-cream-100 dark:bg-dark-bg-secondary">
          <ChevronRight className="w-8 h-8 rotate-[-90deg] text-charcoal-400 dark:text-dark-text-muted" />
        </div>
        <p className="font-serif text-lg font-semibold text-charcoal-900 dark:text-dark-text-primary">
          More Styles Coming Soon
        </p>
        <p className="text-sm text-charcoal-600 dark:text-dark-text-secondary">
          Check back for new arrivals
        </p>
      </div>
    </div>
  );
}

function viewAllHref(filter: JustDroppedFilter): string {
  switch (filter) {
    case "boys":
      return "/collections/boys";
    case "girls":
      return "/collections/girls";
    case "new":
      return "/collections/new-arrivals";
    default:
      return "/collections/new-arrivals";
  }
}

/**
 * Just dropped section — Server Component.
 * World-class: server-rendered content, URL-based filters (Link), no client state.
 */
export function JustDroppedSection({
  products,
  currentFilter,
}: JustDroppedSectionProps): JSX.Element {
  const displayCount = products.length >= 6 ? 6 : products.length >= 4 ? products.length : 4;
  const displayed = products.slice(0, displayCount);
  const placeholdersNeeded = Math.max(0, 4 - displayed.length);

  return (
    <section
      className={cn(
        "section transition-colors duration-300 min-h-[320px] py-10 sm:py-12",
        "bg-cream-50 dark:bg-dark-bg-primary"
      )}
      aria-labelledby="just-dropped-heading"
    >
      <Container size="lg">
        <div className="space-y-[var(--space-8)] lg:space-y-[var(--space-12)]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[var(--space-4)] sm:gap-[var(--space-6)]">
            <H2
              id="just-dropped-heading"
              className="text-charcoal-900 dark:text-dark-text-primary"
            >
              JUST DROPPED
            </H2>
            <Button
              variant="secondary"
              size="sm"
              className="hidden sm:flex items-center gap-2 min-h-[44px] touch-manipulation"
              asChild
            >
              <Link
                href={viewAllHref(currentFilter)}
                aria-label={`View all ${currentFilter === "all" ? "new arrivals" : currentFilter} products`}
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          {/* Filter tabs — Links for reliability, speed, clarity (no client JS) */}
          <nav
            className="flex flex-wrap items-center gap-[var(--space-2)] sm:gap-[var(--space-3)]"
            role="tablist"
            aria-label="Filter products"
          >
            {JUST_DROPPED_FILTERS.map(({ id, label }) => {
              const isActive = currentFilter === id;
              const href = id === "all" ? "/" : `/?filter=${id}`;
              return (
                <Link
                  key={id}
                  href={href}
                  role="tab"
                  aria-selected={isActive}
                  className={cn(
                    "px-4 py-2 rounded-lg font-sans text-sm font-semibold uppercase tracking-wider transition-all duration-300",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2",
                    isActive
                      ? "bg-navy-900 text-cream-50 focus:ring-navy-500 dark:bg-accent-primary dark:text-dark-bg-primary dark:focus:ring-accent-primary"
                      : "bg-cream-100 text-charcoal-700 hover:bg-cream-200 hover:text-charcoal-900 focus:ring-navy-500 dark:bg-dark-surface dark:text-dark-text-secondary dark:hover:bg-dark-bg-secondary dark:hover:text-dark-text-primary dark:focus:ring-accent-primary"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Product grid — Server-rendered; ProductCard is client for wishlist + hover image */}
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[var(--space-4)] sm:gap-[var(--space-5)] lg:gap-[var(--space-6)]"
            role="list"
            aria-label={`${currentFilter === "all" ? "New arrivals" : currentFilter} products`}
          >
            {displayed.map((product, index) => (
              <div key={product.id} className="w-full" role="listitem">
                <ProductCard product={product} priority={index < 2} />
              </div>
            ))}
            {Array.from({ length: placeholdersNeeded }, (_, i) => (
              <div key={`placeholder-${i}`} className="w-full" role="listitem">
                <PlaceholderCard />
              </div>
            ))}
          </div>

          {/* Mobile View All */}
          <div className="lg:hidden text-center pt-[var(--space-4)]">
            <Button
              variant="secondary"
              size="md"
              className="min-h-[48px] w-full sm:w-auto touch-manipulation"
              asChild
            >
              <Link
                href={viewAllHref(currentFilter)}
                aria-label={`View all ${currentFilter === "all" ? "new arrivals" : currentFilter} products`}
              >
                View All{" "}
                {currentFilter === "all"
                  ? "New Arrivals"
                  : JUST_DROPPED_FILTERS.find((f) => f.id === currentFilter)?.label}
                <ChevronRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
