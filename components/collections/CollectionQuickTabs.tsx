"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "All", href: "/collections/all" },
  { label: "Boys", href: "/collections/boys" },
  { label: "Girls", href: "/collections/girls" },
  { label: "New Arrivals", href: "/collections/new-arrivals" },
] as const;

interface CollectionQuickTabsProps {
  className?: string;
}

/**
 * Quick collection tabs (All / Boys / Girls / New Arrivals).
 * Sticky with toolbar for mobile so users can switch without scrolling up.
 */
export function CollectionQuickTabs({ className }: CollectionQuickTabsProps): JSX.Element {
  const pathname = usePathname();

  return (
    <nav
      role="tablist"
      aria-label="Collections"
      className={cn(
        "flex gap-1 overflow-x-auto scrollbar-hide py-2 -mx-4 px-4 sm:mx-0 sm:px-0",
        "border-b border-cream-200 bg-cream-50",
        className
      )}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {TABS.map((tab) => {
        const isActive =
          pathname === tab.href ||
          (tab.href !== "/collections/all" && pathname?.startsWith(tab.href));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center px-4 py-2.5 rounded-lg",
              "font-sans text-sm font-medium whitespace-nowrap touch-manipulation",
              "transition-colors duration-200",
              isActive
                ? "bg-charcoal-900 text-cream-50"
                : "text-charcoal-700 hover:bg-cream-200 hover:text-charcoal-900"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
