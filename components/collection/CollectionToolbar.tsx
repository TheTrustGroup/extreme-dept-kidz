"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, ChevronDown, X, Check } from "lucide-react";
import { slideInBottom, fadeIn } from "@/lib/motion";

// ─── Types ────────────────────────────────────────────────────────
export interface FilterState {
  sizes: string[];
  ageRanges: string[];
  priceMax: number;
  availability: boolean;
}

export interface SortOption {
  value: string;
  label: string;
}

interface CollectionToolbarProps {
  totalProducts: number;
  filters: FilterState;
  sortValue: string;
  onFiltersChange: (f: FilterState) => void;
  onSortChange: (v: string) => void;
  onClearAll: () => void;
}

// ─── Config ───────────────────────────────────────────────────────
const SORT_OPTIONS: SortOption[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "A – Z" },
];

const SIZE_OPTIONS = [
  "XS", "S", "M", "L", "XL", "XXL", "2T", "3T", "4T", "5T", "6", "8", "10", "12",
];

const AGE_OPTIONS = [
  { value: "0-2", label: "0–2 yrs" },
  { value: "2-4", label: "2–4 yrs" },
  { value: "4-6", label: "4–6 yrs" },
  { value: "6-8", label: "6–8 yrs" },
  { value: "8-10", label: "8–10 yrs" },
  { value: "10-12", label: "10–12 yrs" },
];

const MAX_PRICE = 1000;

function countActive(filters: FilterState): number {
  return (
    filters.sizes.length +
    filters.ageRanges.length +
    (filters.priceMax < MAX_PRICE ? 1 : 0) +
    (filters.availability ? 1 : 0)
  );
}

// ─── Active filter pills ───────────────────────────────────────────
function ActiveFilterPills({
  filters,
  onFiltersChange,
  onClearAll,
}: {
  filters: FilterState;
  sortValue: string;
  onFiltersChange: (f: FilterState) => void;
  onClearAll: () => void;
}) {
  const removeSize = (s: string) =>
    onFiltersChange({ ...filters, sizes: filters.sizes.filter((x) => x !== s) });
  const removeAge = (a: string) =>
    onFiltersChange({
      ...filters,
      ageRanges: filters.ageRanges.filter((x) => x !== a),
    });
  const removePrice = () =>
    onFiltersChange({ ...filters, priceMax: MAX_PRICE });
  const removeAvailability = () =>
    onFiltersChange({ ...filters, availability: false });

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden"
    >
      <div className="collection-filter-pills">
        {filters.sizes.map((s) => (
          <button
            key={s}
            type="button"
            className="filter-pill"
            onClick={() => removeSize(s)}
          >
            Size: {s} <X size={11} strokeWidth={2} />
          </button>
        ))}
        {filters.ageRanges.map((a) => {
          const label = AGE_OPTIONS.find((o) => o.value === a)?.label ?? a;
          return (
            <button
              key={a}
              type="button"
              className="filter-pill"
              onClick={() => removeAge(a)}
            >
              {label} <X size={11} strokeWidth={2} />
            </button>
          );
        })}
        {filters.priceMax < MAX_PRICE && (
          <button
            type="button"
            className="filter-pill"
            onClick={removePrice}
          >
            Under ₵{filters.priceMax} <X size={11} strokeWidth={2} />
          </button>
        )}
        {filters.availability && (
          <button
            type="button"
            className="filter-pill"
            onClick={removeAvailability}
          >
            In Stock <X size={11} strokeWidth={2} />
          </button>
        )}
        <button
          type="button"
          className="filter-pill-clear"
          onClick={onClearAll}
        >
          Clear all
        </button>
      </div>
    </motion.div>
  );
}

// ─── Sort dropdown (desktop) ───────────────────────────────────────
function SortDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = SORT_OPTIONS.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="collection-sort-btn"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span
          className="text-label"
          style={{ fontSize: "11px", letterSpacing: "0.1em" }}
        >
          {current?.label ?? "Sort"}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          className="flex items-center"
        >
          <ChevronDown size={13} strokeWidth={1.5} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scaleY: 0.96 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-52 bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-dropdown z-50 origin-top-right py-1"
            role="listbox"
            aria-label="Sort options"
          >
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={value === opt.value}
                className={[
                  "w-full flex items-center justify-between px-4 py-3",
                  "text-body-sm transition-colors duration-150",
                  "hover:bg-[var(--bg-surface-2)]",
                  value === opt.value
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)]",
                ].join(" ")}
                style={{ fontSize: "13px" }}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
                {value === opt.value && (
                  <Check
                    size={13}
                    strokeWidth={2}
                    className="text-[var(--color-gold)]"
                  />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Filter panel content (shared between sheet + sidebar) ────────
function FilterPanelContent({
  filters,
  onFiltersChange,
}: {
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
}) {
  const toggleSize = (s: string) => {
    const next = filters.sizes.includes(s)
      ? filters.sizes.filter((x) => x !== s)
      : [...filters.sizes, s];
    onFiltersChange({ ...filters, sizes: next });
  };

  const toggleAge = (a: string) => {
    const next = filters.ageRanges.includes(a)
      ? filters.ageRanges.filter((x) => x !== a)
      : [...filters.ageRanges, a];
    onFiltersChange({ ...filters, ageRanges: next });
  };

  return (
    <div className="filter-panel-content">
      <div className="filter-section">
        <p className="filter-section__label">Size</p>
        <div className="filter-size-grid">
          {SIZE_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSize(s)}
              aria-pressed={filters.sizes.includes(s)}
              className={[
                "filter-size-btn",
                filters.sizes.includes(s) ? "filter-size-btn--active" : "",
              ].join(" ")}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <p className="filter-section__label">Age Range</p>
        <div className="filter-check-list">
          {AGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleAge(opt.value)}
              aria-pressed={filters.ageRanges.includes(opt.value)}
              className={[
                "filter-check-item",
                filters.ageRanges.includes(opt.value)
                  ? "filter-check-item--active"
                  : "",
              ].join(" ")}
            >
              <span
                className={[
                  "filter-check-box",
                  filters.ageRanges.includes(opt.value)
                    ? "filter-check-box--active"
                    : "",
                ].join(" ")}
              >
                {filters.ageRanges.includes(opt.value) && (
                  <Check size={10} strokeWidth={2.5} />
                )}
              </span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <div className="flex items-center justify-between mb-3">
          <p className="filter-section__label" style={{ marginBottom: 0 }}>
            Max Price
          </p>
          <span
            className="text-label text-[var(--color-gold)]"
            style={{ fontSize: "12px" }}
          >
            ₵{filters.priceMax.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={MAX_PRICE}
          step={50}
          value={filters.priceMax}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              priceMax: Number(e.target.value),
            })
          }
          className="filter-range w-full"
          aria-label="Maximum price"
        />
        <div className="flex justify-between mt-1">
          <span
            className="text-label text-[var(--text-tertiary)]"
            style={{ fontSize: "10px" }}
          >
            ₵0
          </span>
          <span
            className="text-label text-[var(--text-tertiary)]"
            style={{ fontSize: "10px" }}
          >
            ₵1,000
          </span>
        </div>
      </div>

      <div
        className="filter-section"
        style={{ borderBottom: "none", paddingBottom: 0 }}
      >
        <button
          type="button"
          onClick={() =>
            onFiltersChange({
              ...filters,
              availability: !filters.availability,
            })
          }
          aria-pressed={filters.availability}
          className="flex items-center gap-3 w-full"
        >
          <span
            className={[
              "filter-check-box",
              filters.availability ? "filter-check-box--active" : "",
            ].join(" ")}
          >
            {filters.availability && (
              <Check size={10} strokeWidth={2.5} />
            )}
          </span>
          <span
            className="text-label-lg"
            style={{ fontSize: "12px", letterSpacing: "0.08em" }}
          >
            In Stock Only
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── Mobile bottom sheet ───────────────────────────────────────────
function MobileFilterSheet({
  open,
  onClose,
  filters,
  sortValue,
  onFiltersChange,
  onSortChange,
  onClearAll,
  totalProducts,
}: {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  sortValue: string;
  onFiltersChange: (f: FilterState) => void;
  onSortChange: (v: string) => void;
  onClearAll: () => void;
  totalProducts: number;
}) {
  const activeCount = countActive(filters);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-[180] bg-[var(--color-navy)]/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            onKeyDown={(e) => e.key === "Escape" && onClose()}
            aria-hidden="true"
          />

          <motion.div
            key="sheet"
            variants={slideInBottom}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed bottom-0 left-0 right-0 z-[190] bg-[var(--bg-page)] lg:hidden"
            style={{
              borderRadius: "16px 16px 0 0",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Filter and sort"
          >
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div
                className="w-10 h-1 rounded-full bg-[var(--border-strong)]"
                aria-hidden="true"
              />
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-default)] flex-shrink-0">
              <span
                className="text-label-lg"
                style={{ fontSize: "13px", letterSpacing: "0.1em" }}
              >
                Filter & Sort
                {activeCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-gold)] text-[var(--color-navy)] text-[10px] font-bold">
                    {activeCount}
                  </span>
                )}
              </span>
              <button
                type="button"
                className="icon-btn w-9 h-9"
                onClick={onClose}
                aria-label="Close filter panel"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div className="px-5 py-4 border-b border-[var(--border-default)] flex-shrink-0">
              <p className="filter-section__label">Sort By</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onSortChange(opt.value)}
                    className={[
                      "filter-sort-pill",
                      sortValue === opt.value ? "filter-sort-pill--active" : "",
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5">
              <FilterPanelContent
                filters={filters}
                onFiltersChange={onFiltersChange}
              />
            </div>

            <div className="flex-shrink-0 px-5 py-4 border-t border-[var(--border-default)] flex gap-3 pb-[max(16px,env(safe-area-inset-bottom))]">
              {activeCount > 0 && (
                <button
                  type="button"
                  className="btn-secondary h-12 flex-1"
                  style={{ fontSize: "11px" }}
                  onClick={() => {
                    onClearAll();
                    onClose();
                  }}
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                className="btn-primary flex-1 h-12"
                style={{ fontSize: "11px" }}
                onClick={onClose}
              >
                Show {totalProducts}{" "}
                {totalProducts === 1 ? "Product" : "Products"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function CollectionToolbar({
  totalProducts,
  filters,
  sortValue,
  onFiltersChange,
  onSortChange,
  onClearAll,
}: CollectionToolbarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const activeCount = countActive(filters);

  return (
    <>
      <div className="collection-toolbar">
        <p className="collection-toolbar__count">
          {totalProducts} {totalProducts === 1 ? "product" : "products"}
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="collection-filter-btn lg:hidden"
            onClick={() => setSheetOpen(true)}
            aria-label={`Filter and sort${activeCount > 0 ? `, ${activeCount} active` : ""}`}
          >
            <SlidersHorizontal size={14} strokeWidth={1.5} />
            <span>Filter & Sort</span>
            {activeCount > 0 && (
              <span className="collection-filter-badge">{activeCount}</span>
            )}
          </button>

          <div className="hidden lg:block">
            <SortDropdown value={sortValue} onChange={onSortChange} />
          </div>
        </div>
      </div>

      <div className="hidden lg:block">
        <AnimatePresence>
          {activeCount > 0 && (
            <ActiveFilterPills
              filters={filters}
              sortValue={sortValue}
              onFiltersChange={onFiltersChange}
              onClearAll={onClearAll}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="lg:hidden">
        <AnimatePresence>
          {activeCount > 0 && (
            <ActiveFilterPills
              filters={filters}
              sortValue={sortValue}
              onFiltersChange={onFiltersChange}
              onClearAll={onClearAll}
            />
          )}
        </AnimatePresence>
      </div>

      <MobileFilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        sortValue={sortValue}
        onFiltersChange={onFiltersChange}
        onSortChange={onSortChange}
        onClearAll={onClearAll}
        totalProducts={totalProducts}
      />
    </>
  );
}
