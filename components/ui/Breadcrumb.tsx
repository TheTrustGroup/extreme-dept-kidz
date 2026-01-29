"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  /** Generate structured data for SEO (optional) */
  generateStructuredData?: boolean;
}

/**
 * Breadcrumb Component
 * 
 * Navigation breadcrumb with small text, proper spacing, and SEO support.
 * - Small, unobtrusive (12-14px text)
 * - Last item is current page (not clickable)
 * - All previous items are clickable links
 * - Mobile: Truncates long paths (shows Home > ... > Last)
 * - Includes structured data markup for SEO
 */
export function Breadcrumb({ items, className, generateStructuredData = false }: BreadcrumbProps): JSX.Element {
  const { theme } = useTheme();
  
  // Generate structured data for SEO
  const structuredData = React.useMemo(() => {
    if (!generateStructuredData) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        item: item.href ? `https://extremedeptkidz.com${item.href}` : undefined,
      })),
    };
  }, [items, generateStructuredData]);

  // Truncate on mobile if too many items (show first, ellipsis, last)
  const shouldTruncate = items.length > 4;
  const truncatedItems = React.useMemo(() => {
    if (!shouldTruncate || items.length <= 2) return items;
    
    // Show: Home > ... > Last
    return [
      items[0], // Home
      { label: "...", href: undefined },
      items[items.length - 1], // Last
    ];
  }, [items, shouldTruncate]);

  const renderBreadcrumbItem = (item: BreadcrumbItem, index: number, itemList: BreadcrumbItem[]) => {
    const isLast = index === itemList.length - 1;
    const isEllipsis = item.label === "...";

    return (
      <li key={index} className="flex items-center gap-1.5 sm:gap-2">
        {isEllipsis ? (
          <span
            className={cn(
              "text-xs sm:text-sm",
              theme === "dark" ? "text-dark-text-muted" : "text-charcoal-400"
            )}
            aria-hidden="true"
          >
            ...
          </span>
        ) : item.href && !isLast ? (
          <Link
            href={item.href}
            className={cn(
              "transition-colors duration-200",
              "hover:underline",
              theme === "dark"
                ? "text-dark-text-secondary hover:text-dark-text-primary"
                : "text-charcoal-600 hover:text-charcoal-900"
            )}
          >
            {item.label}
          </Link>
        ) : (
          <span
            className={cn(
              "font-medium",
              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
            )}
            aria-current={isLast ? "page" : undefined}
          >
            {item.label}
          </span>
        )}
        {!isLast && !isEllipsis && (
          <ChevronRight
            className={cn(
              "w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0",
              theme === "dark" ? "text-dark-text-muted" : "text-charcoal-400"
            )}
            aria-hidden="true"
          />
        )}
      </li>
    );
  };

  return (
    <>
      {/* Structured Data for SEO */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      <nav
        className={cn(
          "flex items-center gap-1.5 sm:gap-2",
          "text-xs sm:text-sm", // 12px mobile, 14px desktop
          className
        )}
        aria-label="Breadcrumb"
      >
        {/* Desktop: Show full breadcrumb */}
        <ol className="hidden sm:flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {items.map((item, index) => renderBreadcrumbItem(item, index, items))}
        </ol>
        
        {/* Mobile: Show truncated version if needed */}
        <ol className={cn(
          "flex items-center gap-1.5 sm:hidden",
          !shouldTruncate && "hidden" // Hide if no truncation needed
        )}>
          {truncatedItems.map((item, index) => renderBreadcrumbItem(item, index, truncatedItems))}
        </ol>
        
        {/* Mobile: Show full version if no truncation needed */}
        {!shouldTruncate && (
          <ol className="flex sm:hidden items-center gap-1.5">
            {items.map((item, index) => renderBreadcrumbItem(item, index, items))}
          </ol>
        )}
      </nav>
    </>
  );
}
