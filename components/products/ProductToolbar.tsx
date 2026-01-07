"use client";

import * as React from "react";
import { Filter, Grid3x3, List, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Body } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export type SortOption =
  | "featured"
  | "price-low"
  | "price-high"
  | "newest";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

interface ProductToolbarProps {
  resultCount: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
  onFilterClick?: () => void;
  className?: string;
}

/**
 * ProductToolbar Component
 * 
 * Toolbar for product listing pages with sorting, view toggle, and filter button.
 * Minimal, clean design with custom-styled dropdown.
 */
export function ProductToolbar({
  resultCount,
  sortBy,
  onSortChange,
  viewMode = "grid",
  onViewModeChange,
  onFilterClick,
  className,
}: ProductToolbarProps): JSX.Element {
  const [isSortOpen, setIsSortOpen] = React.useState(false);
  const sortRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };

    if (isSortOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return (): void => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSortOpen]);

  const selectedSort = SORT_OPTIONS.find((option) => option.value === sortBy);

  return (
    <div
      className={cn(
        "flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-4",
        "py-4 xs:py-5 sm:py-6 border-b border-cream-200",
        className
      )}
    >
      {/* Left Side: Result Count & Mobile Filter */}
      <div className="flex items-center gap-3 xs:gap-4 w-full xs:w-auto">
        {/* Mobile Filter Button */}
        {onFilterClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onFilterClick}
            className="lg:hidden flex items-center gap-2 text-charcoal-700 hover:text-charcoal-900"
          >
            <Filter className="w-4 h-4" />
            <span className="font-sans text-sm">Filters</span>
          </Button>
        )}

        {/* Result Count */}
        <Body className="text-charcoal-600 text-xs xs:text-sm sm:text-base">
          {resultCount} {resultCount === 1 ? "product" : "products"}
        </Body>
      </div>

      {/* Right Side: Sort & View Toggle */}
      <div className="flex items-center gap-3 xs:gap-4 w-full xs:w-auto justify-end">
        {/* Sort Dropdown */}
        <div className="relative flex-1 xs:flex-none" ref={sortRef}>
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className={cn(
              "flex items-center gap-2 px-3 xs:px-4 py-2 w-full xs:w-auto",
              "bg-cream-50 border border-cream-200 rounded-lg",
              "font-sans text-xs xs:text-sm text-charcoal-700",
              "hover:border-charcoal-300 hover:bg-cream-100",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
              "xs:min-w-[160px] sm:min-w-[180px] justify-between"
            )}
            aria-label="Sort products"
            aria-expanded={isSortOpen}
          >
            <span className="text-charcoal-900 font-medium truncate">
              {selectedSort?.label || "Sort"}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-charcoal-600 transition-transform duration-200 flex-shrink-0",
                isSortOpen && "transform rotate-180"
              )}
            />
          </button>

          {/* Dropdown Menu */}
          {isSortOpen && (
            <div
              className={cn(
                "absolute right-0 xs:right-0 mt-2 w-full xs:w-auto xs:min-w-[200px]",
                "bg-cream-50 border border-cream-200 rounded-lg shadow-lg",
                "z-50 overflow-hidden"
              )}
            >
              <div className="py-1">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value);
                      setIsSortOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2.5",
                      "font-sans text-sm text-charcoal-700",
                      "hover:bg-cream-100 hover:text-charcoal-900",
                      "transition-colors duration-200",
                      "focus:outline-none focus:bg-cream-100",
                      sortBy === option.value &&
                        "bg-cream-100 text-charcoal-900 font-medium"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* View Mode Toggle (Optional) */}
        {onViewModeChange && (
          <div className="hidden sm:flex items-center gap-1 p-1 bg-cream-50 border border-cream-200 rounded-lg">
            <button
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "p-2 rounded transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
                viewMode === "grid"
                  ? "bg-charcoal-900 text-cream-50"
                  : "text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-100"
              )}
              aria-label="Grid view"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={cn(
                "p-2 rounded transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
                viewMode === "list"
                  ? "bg-charcoal-900 text-cream-50"
                  : "text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-100"
              )}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

