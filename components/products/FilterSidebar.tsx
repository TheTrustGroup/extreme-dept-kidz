"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { H3 } from "@/components/ui/typography";

/**
 * Filter State Interface
 */
export interface FilterState {
  categories: string[];
  sizes: string[];
  priceRange: {
    min: number;
    max: number;
  };
  inStockOnly: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  categories: [],
  sizes: [],
  priceRange: { min: 0, max: 18000 }, // $0 - $180 in cents
  inStockOnly: false,
};

const ALL_SIZES = ["2T", "3T", "4T", "5T", "6", "8", "10", "12"];

const PRICE_RANGES = [
  { label: "Under $50", min: 0, max: 5000 },
  { label: "$50 - $100", min: 5000, max: 10000 },
  { label: "$100 - $150", min: 10000, max: 15000 },
  { label: "$150+", min: 15000, max: 18000 },
];

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  isOpen?: boolean;
  onClose?: () => void;
  categories?: string[];
}

/**
 * FilterSidebar Component
 * 
 * Refined filter sidebar with collapsible sections.
 * Sticky on desktop, drawer on mobile.
 */
export function FilterSidebar({
  filters,
  onFiltersChange,
  isOpen = true,
  onClose,
  categories = ["Boys", "Girls", "Accessories"],
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = React.useState({
    category: true,
    size: true,
    price: true,
    availability: true,
  });

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleSizeToggle = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onFiltersChange({ ...filters, sizes: newSizes });
  };

  const handlePriceRangeSelect = (range: { min: number; max: number }) => {
    onFiltersChange({
      ...filters,
      priceRange: range,
    });
  };

  const handleInStockToggle = () => {
    onFiltersChange({
      ...filters,
      inStockOnly: !filters.inStockOnly,
    });
  };

  const handleClearAll = () => {
    onFiltersChange(DEFAULT_FILTERS);
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.sizes.length > 0 ||
    filters.priceRange.min !== DEFAULT_FILTERS.priceRange.min ||
    filters.priceRange.max !== DEFAULT_FILTERS.priceRange.max ||
    filters.inStockOnly;

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-cream-200">
        <H3 className="text-charcoal-900">Filters</H3>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-2 text-charcoal-700 hover:text-charcoal-900 transition-colors duration-200"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter Content */}
      <div className="flex-1 overflow-y-auto py-6 space-y-8">
        {/* Category Filter */}
        <FilterSection
          title="Category"
          isExpanded={expandedSections.category}
          onToggle={() => toggleSection("category")}
        >
          <div className="space-y-3">
            {categories.map((category) => (
              <Checkbox
                key={category}
                label={category}
                checked={filters.categories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Size Filter */}
        <FilterSection
          title="Size"
          isExpanded={expandedSections.size}
          onToggle={() => toggleSection("size")}
        >
          <div className="grid grid-cols-3 gap-3">
            {ALL_SIZES.map((size) => (
              <Checkbox
                key={size}
                label={size}
                checked={filters.sizes.includes(size)}
                onChange={() => handleSizeToggle(size)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Price Range Filter */}
        <FilterSection
          title="Price"
          isExpanded={expandedSections.price}
          onToggle={() => toggleSection("price")}
        >
          <div className="space-y-3">
            {PRICE_RANGES.map((range, index) => {
              const isSelected =
                filters.priceRange.min === range.min &&
                filters.priceRange.max === range.max;
              return (
                <button
                  key={index}
                  onClick={() => handlePriceRangeSelect(range)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 rounded-lg",
                    "font-sans text-sm text-charcoal-700",
                    "border transition-all duration-200",
                    isSelected
                      ? "border-charcoal-900 bg-cream-100 text-charcoal-900"
                      : "border-cream-300 hover:border-charcoal-400 hover:bg-cream-50"
                  )}
                >
                  {range.label}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Availability Filter */}
        <FilterSection
          title="Availability"
          isExpanded={expandedSections.availability}
          onToggle={() => toggleSection("availability")}
        >
          <Checkbox
            label="In Stock Only"
            checked={filters.inStockOnly}
            onChange={handleInStockToggle}
          />
        </FilterSection>
      </div>

      {/* Footer with Clear All */}
      {hasActiveFilters && (
        <div className="pt-6 border-t border-cream-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="w-full justify-center text-charcoal-700 hover:text-charcoal-900"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );

  // Mobile: Drawer
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-charcoal-900/20 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Drawer */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-cream-50 shadow-2xl z-50 lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="h-full p-6">{sidebarContent}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop: Sticky Sidebar
  return (
    <aside
      className={cn(
        "w-64 flex-shrink-0",
        "lg:sticky lg:top-24 lg:self-start",
        "hidden lg:block"
      )}
    >
      <div className="bg-cream-50 rounded-lg border border-cream-200 p-6">
        {sidebarContent}
      </div>
    </aside>
  );
}

/**
 * FilterSection Component
 * Collapsible filter section
 */
interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({
  title,
  isExpanded,
  onToggle,
  children,
}: FilterSectionProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full mb-4 group"
      >
        <h4 className="font-serif text-sm font-semibold text-charcoal-900 uppercase tracking-wider">
          {title}
        </h4>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-charcoal-600 group-hover:text-charcoal-900 transition-colors duration-200" />
        ) : (
          <ChevronDown className="w-4 h-4 text-charcoal-600 group-hover:text-charcoal-900 transition-colors duration-200" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Checkbox Component
 * Minimal checkbox with label
 */
interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-cream-300 text-navy-900 focus:ring-navy-500 focus:ring-offset-2 cursor-pointer"
      />
      <span className="font-sans text-sm text-charcoal-700 group-hover:text-charcoal-900 transition-colors duration-200">
        {label}
      </span>
    </label>
  );
}

