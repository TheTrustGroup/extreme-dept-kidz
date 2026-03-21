import Link from "next/link";
import { Container } from "@/components/ui/container";
import { H2 } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { JustDroppedGrid } from "@/components/home/JustDroppedGrid";
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

/** Only show products that have a valid slug so links go to /products/{slug}, not error pages. */
function hasValidSlug(p: Product): boolean {
  return Boolean(p?.slug && String(p.slug).trim());
}

/**
 * Just dropped section — Server Component.
 * World-class: server-rendered content, URL-based filters (Link), no client state.
 * CRITICAL: Uses /products/{slug} (same as Boys section); only products with valid slug are shown.
 */
export function JustDroppedSection({
  products,
  currentFilter,
}: JustDroppedSectionProps): JSX.Element {
  const withValidSlug = products.filter(hasValidSlug);
  const displayCount = withValidSlug.length >= 6 ? 6 : withValidSlug.length >= 4 ? withValidSlug.length : 4;
  const displayed = withValidSlug.slice(0, displayCount);
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

          {/* Product grid — new ProductCard, add-to-cart, quick-view; placeholders when < 4 */}
          <JustDroppedGrid
            products={displayed}
            placeholdersNeeded={placeholdersNeeded}
          />

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
