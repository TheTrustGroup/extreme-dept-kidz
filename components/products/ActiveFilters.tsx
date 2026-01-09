"use client";

import * as React from "react";
import { m, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { FilterState } from "./FilterSidebar";
import { cn, formatPrice } from "@/lib/utils";

interface ActiveFiltersProps {
  filters: FilterState;
  onRemoveCategory: (category: string) => void;
  onRemoveSize: (size: string) => void;
  onClearPrice: () => void;
  onClearStock: () => void;
  onClearAll: () => void;
}

export function ActiveFilters({
  filters,
  onRemoveCategory,
  onRemoveSize,
  onClearPrice,
  onClearStock,
  onClearAll,
}: ActiveFiltersProps): JSX.Element {
  const activeFilters: Array<{ id: string; label: string; onRemove: () => void }> = [];

  // Add category filters
  filters.categories.forEach((category) => {
    activeFilters.push({
      id: `category-${category}`,
      label: category,
      onRemove: () => onRemoveCategory(category),
    });
  });

  // Add size filters
  filters.sizes.forEach((size) => {
    activeFilters.push({
      id: `size-${size}`,
      label: `Size: ${size}`,
      onRemove: () => onRemoveSize(size),
    });
  });

  // Add price filter
  if (filters.priceRange.min !== 0 || filters.priceRange.max !== 18000) {
    activeFilters.push({
      id: "price",
      label: `${formatPrice(filters.priceRange.min)} - ${formatPrice(filters.priceRange.max)}`,
      onRemove: onClearPrice,
    });
  }

  // Add stock filter
  if (filters.inStockOnly) {
    activeFilters.push({
      id: "stock",
      label: "In Stock Only",
      onRemove: onClearStock,
    });
  }

  if (activeFilters.length === 0) {
    return <></>;
  }

  return (
    <m.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-cream-200"
    >
      <span className="text-xs font-semibold text-charcoal-600 uppercase tracking-wider mr-2">
        Active Filters:
      </span>
      <AnimatePresence mode="popLayout">
        {activeFilters.map((filter) => (
          <m.button
            key={filter.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={filter.onRemove}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5",
              "bg-navy-900 text-cream-50 rounded-full",
              "text-xs font-medium",
              "hover:bg-navy-800 transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
            )}
            aria-label={`Remove ${filter.label} filter`}
          >
            <span>{filter.label}</span>
            <X className="w-3 h-3" />
          </m.button>
        ))}
      </AnimatePresence>
      {activeFilters.length > 1 && (
        <button
          onClick={onClearAll}
          className={cn(
            "text-xs text-charcoal-600 hover:text-charcoal-900",
            "underline transition-colors duration-200",
            "ml-2"
          )}
        >
          Clear all
        </button>
      )}
    </m.div>
  );
}
