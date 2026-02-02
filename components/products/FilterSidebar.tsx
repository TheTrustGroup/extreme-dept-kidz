"use client";

import * as React from "react";
import { m } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { H3 } from "@/components/ui/typography";

/**
 * Filter State Interface
 */
export interface FilterState {
  categories: string[];
  sizes: string[];
  ageRanges: string[];
  colors: string[];
  priceRange: {
    min: number;
    max: number;
  };
  inStockOnly: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  categories: [],
  sizes: [],
  ageRanges: [],
  colors: [],
  priceRange: { min: 0, max: 100000 }, // ₵0 - ₵1000 in pesewas
  inStockOnly: false,
};

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "2T", "3T", "4T", "5T", "6", "8", "10", "12"];

const AGE_RANGES = [
  { label: "0-2 years", value: "0-2" },
  { label: "2-4 years", value: "2-4" },
  { label: "4-6 years", value: "4-6" },
  { label: "6-8 years", value: "6-8" },
  { label: "8-10 years", value: "8-10" },
  { label: "10-12 years", value: "10-12" },
];

const COLORS = [
  { label: "Black", value: "black" },
  { label: "White", value: "white" },
  { label: "Navy", value: "navy" },
  { label: "Gray", value: "gray" },
  { label: "Beige", value: "beige" },
  { label: "Red", value: "red" },
  { label: "Blue", value: "blue" },
  { label: "Green", value: "green" },
];

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  isOpen?: boolean;
  onClose?: () => void;
  categories?: string[];
  availableColors?: string[];
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
  availableColors = [],
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = React.useState({
    category: true,
    ageRange: true,
    size: true,
    color: true,
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


  const handleAgeRangeToggle = (ageRange: string) => {
    const newAgeRanges = filters.ageRanges.includes(ageRange)
      ? filters.ageRanges.filter((a) => a !== ageRange)
      : [...filters.ageRanges, ageRange];
    onFiltersChange({ ...filters, ageRanges: newAgeRanges });
  };

  const handleColorToggle = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    onFiltersChange({ ...filters, colors: newColors });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    onFiltersChange({
      ...filters,
      priceRange: { min, max },
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
    filters.ageRanges.length > 0 ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
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

        {/* Age Range Filter */}
        <FilterSection
          title="Age Range"
          isExpanded={expandedSections.ageRange}
          onToggle={() => toggleSection("ageRange")}
        >
          <div className="space-y-3">
            {AGE_RANGES.map((ageRange) => (
              <Checkbox
                key={ageRange.value}
                label={ageRange.label}
                checked={filters.ageRanges.includes(ageRange.value)}
                onChange={() => handleAgeRangeToggle(ageRange.value)}
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

        {/* Color Filter */}
        {availableColors.length > 0 && (
          <FilterSection
            title="Color"
            isExpanded={expandedSections.color}
            onToggle={() => toggleSection("color")}
          >
            <div className="grid grid-cols-2 gap-3">
              {COLORS.filter((color) => availableColors.includes(color.value)).map((color) => (
                <Checkbox
                  key={color.value}
                  label={color.label}
                  checked={filters.colors.includes(color.value)}
                  onChange={() => handleColorToggle(color.value)}
                />
              ))}
            </div>
          </FilterSection>
        )}

        {/* Price Range Filter */}
        <FilterSection
          title="Price"
          isExpanded={expandedSections.price}
          onToggle={() => toggleSection("price")}
        >
          <PriceSlider
            min={0}
            max={100000}
            value={filters.priceRange}
            onChange={handlePriceRangeChange}
          />
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
            <m.div
              className="fixed inset-0 bg-charcoal-900/20 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Drawer */}
            <m.div
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-cream-50 shadow-2xl z-50 lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="h-full p-6">{sidebarContent}</div>
            </m.div>
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
      <div className="bg-white/90 backdrop-blur-md rounded-lg border border-cream-200/50 shadow-sm p-6">
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
}: FilterSectionProps): JSX.Element {
  return (
    <div>
      <m.button
        onClick={onToggle}
        className="flex items-center justify-between w-full mb-4 group"
        whileHover={{ x: 2 }}
        transition={{ duration: 0.2 }}
      >
        <h4 className="font-serif text-sm font-semibold text-charcoal-900 uppercase tracking-wider">
          {title}
        </h4>
        <m.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-charcoal-600 group-hover:text-charcoal-900 transition-colors duration-200" />
        </m.div>
      </m.button>
      <AnimatePresence>
        {isExpanded && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {children}
          </m.div>
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

function Checkbox({ label, checked, onChange }: CheckboxProps): JSX.Element {
  return (
    <m.label
      className="flex items-center gap-3 min-h-[44px] py-2 cursor-pointer group touch-manipulation"
      whileHover={{ x: 2 }}
      transition={{ duration: 0.2 }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 rounded border-cream-300 text-navy-900 focus:ring-navy-500 focus:ring-offset-2 cursor-pointer transition-all duration-200 shrink-0"
      />
      <span className="font-sans text-sm text-charcoal-700 group-hover:text-charcoal-900 transition-colors duration-200">
        {label}
      </span>
    </m.label>
  );
}

/**
 * PriceSlider Component
 * Range slider for price filtering
 */
interface PriceSliderProps {
  min: number;
  max: number;
  value: { min: number; max: number };
  onChange: (min: number, max: number) => void;
}

function PriceSlider({ min, max, value, onChange }: PriceSliderProps): JSX.Element {
  const [localMin, setLocalMin] = React.useState(value.min);
  const [localMax, setLocalMax] = React.useState(value.max);

  React.useEffect(() => {
    setLocalMin(value.min);
    setLocalMax(value.max);
  }, [value.min, value.max]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), localMax);
    setLocalMin(newMin);
    onChange(newMin, localMax);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), localMin);
    setLocalMax(newMax);
    onChange(localMin, newMax);
  };

  const minPercent = ((localMin - min) / (max - min)) * 100;
  const maxPercent = ((localMax - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      {/* Price Display */}
      <div className="flex items-center justify-between text-sm font-sans">
        <span className="text-charcoal-700 font-medium">
          {formatPrice(localMin)}
        </span>
        <span className="text-charcoal-400">-</span>
        <span className="text-charcoal-700 font-medium">
          {formatPrice(localMax)}
        </span>
      </div>      {/* Slider Track */}
      <div className="relative h-2 bg-cream-200 rounded-full">
        {/* Active Range */}
        <div
          className="absolute h-2 bg-navy-900 rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />
        {/* Min Slider */}
        <input
          type="range"
          min={min}
          max={max}
          value={localMin}
          onChange={handleMinChange}
          className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer z-10"
        />
        {/* Max Slider */}
        <input
          type="range"
          min={min}
          max={max}
          value={localMax}
          onChange={handleMaxChange}
          className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer z-10"
        />
      </div>
    </div>
  );
}