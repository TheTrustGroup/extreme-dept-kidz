"use client";

import * as React from "react";
import { m, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn, formatPrice } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useFocusTrap } from "@/lib/hooks/use-keyboard-navigation";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  category: string;
}

const MAX_RESULTS = 6; // Show 6 results, then "View All Results"

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps): JSX.Element {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [allResults, setAllResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const resultsRef = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Focus trap for accessibility
  useFocusTrap(overlayRef, isOpen);

  // Focus input when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        setSearchQuery("");
        setResults([]);
        setAllResults([]);
        setHasSearched(false);
        setSelectedIndex(-1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keyboard shortcuts: Cmd/Ctrl + K and Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Cmd/Ctrl + K to toggle search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // This will be handled by Header component
        }
      }
      
      // Escape to close
      if (e.key === "Escape" && isOpen) {
        onClose();
      }

      // Arrow keys for navigation
      if (isOpen && results.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => 
            prev < results.length - 1 ? prev + 1 : prev
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === "Enter" && selectedIndex >= 0) {
          e.preventDefault();
          handleResultClick(results[selectedIndex].slug);
        }
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, results, selectedIndex]);

  // Scroll selected item into view
  React.useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  // Debounced search via server action — no client fetch to /api/search
  React.useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setAllResults([]);
      setHasSearched(false);
      setSelectedIndex(-1);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setSelectedIndex(-1);

    const timeoutId = setTimeout(async () => {
      try {
        const { searchProductsAction } = await import("@/app/actions/search");
        const searchResults = await searchProductsAction(searchQuery);
        setAllResults(searchResults);
        setResults(searchResults.slice(0, MAX_RESULTS));
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
        setAllResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleResultClick = (slug: string): void => {
    router.push(`/products/${slug}`);
    onClose();
    setSearchQuery("");
  };

  // Get search suggestions for "No results" state
  const getSuggestions = (): string[] => {
    const commonTerms = [
      "Boys",
      "Girls",
      "New Arrivals",
      "T-Shirts",
      "Hoodies",
      "Jeans",
      "Sneakers",
      "Accessories",
    ];
    return commonTerms.slice(0, 4);
  };

  const displayedResults = results.slice(0, MAX_RESULTS);
  const hasMoreResults = allResults.length > MAX_RESULTS;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            className={cn(
              "fixed inset-0 backdrop-blur-md z-[9998]",
              theme === "dark" ? "bg-dark-bg-primary/80" : "bg-charcoal-900/60"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Search Modal */}
          <m.div
            ref={overlayRef}
            className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 px-4 pointer-events-none"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
          >
            <div className="w-full max-w-2xl pointer-events-auto glass rounded-xl shadow-2xl">
              {/* Search Input */}
              <div className={cn(
                "flex items-center gap-4 p-6 border-b",
                theme === "dark" ? "border-dark-border-glass" : "border-cream-200"
              )}>
                <Search className={cn(
                  "w-6 h-6 flex-shrink-0",
                  theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-400"
                )} />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, collections..."
                  className={cn(
                    "flex-1 text-lg font-sans bg-transparent border-none outline-none",
                    "placeholder:text-charcoal-400",
                    theme === "dark" 
                      ? "text-dark-text-primary placeholder:text-dark-text-muted" 
                      : "text-charcoal-900"
                  )}
                  autoComplete="off"
                  aria-label="Search products"
                />
                {/* Keyboard Shortcut Hint */}
                <div className={cn(
                  "hidden sm:flex items-center gap-1 px-2 py-1 rounded text-xs font-medium",
                  theme === "dark"
                    ? "bg-dark-bg-secondary text-dark-text-muted border border-dark-border-glass"
                    : "bg-cream-100 text-charcoal-500 border border-cream-200"
                )}>
                  <kbd className="font-mono">⌘</kbd>
                  <span>+</span>
                  <kbd className="font-mono">K</kbd>
                </div>
                <button
                  onClick={onClose}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    "hover:bg-cream-100",
                    theme === "dark" && "hover:bg-dark-bg-secondary",
                    theme === "dark" ? "text-dark-text-secondary hover:text-dark-text-primary" : "text-charcoal-400 hover:text-charcoal-900"
                  )}
                  aria-label="Close search"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {searchQuery.length >= 2 ? (
                  <>
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className={cn(
                          "w-6 h-6 animate-spin",
                          theme === "dark" ? "text-accent-primary" : "text-navy-900"
                        )} />
                        <span className={cn(
                          "ml-3 font-sans",
                          theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                        )}>
                          Searching...
                        </span>
                      </div>
                    ) : displayedResults.length > 0 ? (
                      <div ref={resultsRef} className="divide-y divide-cream-200 dark:divide-dark-border-glass">
                        {/* Results Count */}
                        <div 
                          className={cn(
                            "px-6 py-3 text-xs font-semibold uppercase tracking-wider",
                            theme === "dark" ? "text-dark-text-muted" : "text-charcoal-500"
                          )}
                          role="status"
                          aria-live="polite"
                          aria-atomic="true"
                        >
                          {allResults.length} result{allResults.length !== 1 ? 's' : ''} found
                        </div>

                        {/* Results List */}
                        {displayedResults.map((result, index) => (
                          <m.button
                            key={result.id}
                            onClick={() => handleResultClick(result.slug)}
                            className={cn(
                              "w-full flex items-center gap-4 p-4 text-left transition-colors",
                              "hover:bg-cream-100 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
                              theme === "dark" && "hover:bg-dark-bg-secondary",
                              selectedIndex === index && (
                                theme === "dark" ? "bg-dark-bg-secondary" : "bg-cream-100"
                              )
                            )}
                            whileHover={{ x: 2 }}
                            transition={{ duration: 0.2 }}
                            aria-label={`${result.name}, ${formatPrice(result.price)}, ${result.category}`}
                          >
                            {/* Product Thumbnail */}
                            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-cream-200">
                              {result.image ? (
                                <OptimizedImage
                                  src={result.image}
                                  alt={result.name}
                                  variant="product-card"
                                  className="object-cover w-full h-full"
                                  fill
                                />
                              ) : (
                                <div className={cn(
                                  "w-full h-full flex items-center justify-center",
                                  theme === "dark" ? "bg-dark-bg-secondary" : "bg-cream-200"
                                )}>
                                  <Search className={cn(
                                    "w-5 h-5",
                                    theme === "dark" ? "text-dark-text-muted" : "text-charcoal-400"
                                  )} />
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <div className={cn(
                                "font-serif text-base font-semibold mb-1 truncate",
                                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                              )}>
                                {result.name}
                              </div>
                              <div className={cn(
                                "text-xs font-medium uppercase tracking-wider mb-1",
                                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-500"
                              )}>
                                {result.category}
                              </div>
                              <div className={cn(
                                "font-serif text-sm font-semibold",
                                theme === "dark" ? "text-accent-primary" : "text-navy-900"
                              )}>
                                {formatPrice(result.price)}
                              </div>
                            </div>

                            {/* Arrow Icon */}
                            <ArrowRight className={cn(
                              "w-5 h-5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
                              theme === "dark" ? "text-dark-text-muted" : "text-charcoal-400"
                            )} />
                          </m.button>
                        ))}

                        {/* View All Results Link */}
                        {hasMoreResults && (
                          <Link
                            href={`/collections?search=${encodeURIComponent(searchQuery)}`}
                            onClick={onClose}
                            className={cn(
                              "flex items-center justify-between gap-4 p-4 transition-colors",
                              "hover:bg-cream-100",
                              theme === "dark" && "hover:bg-dark-bg-secondary",
                              theme === "dark" ? "text-accent-primary hover:text-accent-primary/80" : "text-navy-900 hover:text-navy-700"
                            )}
                          >
                            <span className="font-sans text-sm font-semibold">
                              View All {allResults.length} Results
                            </span>
                            <ArrowRight className="w-5 h-5" />
                          </Link>
                        )}
                      </div>
                    ) : hasSearched ? (
                      /* No Results State */
                      <div 
                        className="px-6 py-12 text-center"
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                      >
                        <div className={cn(
                          "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
                          theme === "dark" ? "bg-dark-bg-secondary" : "bg-cream-100"
                        )}>
                          <Search className={cn(
                            "w-8 h-8",
                            theme === "dark" ? "text-dark-text-muted" : "text-charcoal-400"
                          )} />
                        </div>
                        <h3 className={cn(
                          "font-serif text-lg font-semibold mb-2",
                          theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                        )}>
                          No products found
                        </h3>
                        <p className={cn(
                          "text-sm mb-6",
                          theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                        )}>
                          Try searching with different keywords
                        </p>
                        
                        {/* Suggestions */}
                        <div>
                          <p className={cn(
                            "text-xs font-semibold uppercase tracking-wider mb-3",
                            theme === "dark" ? "text-dark-text-muted" : "text-charcoal-500"
                          )}>
                            Popular Searches
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {getSuggestions().map((suggestion) => (
                              <button
                                key={suggestion}
                                onClick={() => setSearchQuery(suggestion)}
                                className={cn(
                                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                  theme === "dark"
                                    ? "bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-surface hover:text-dark-text-primary"
                                    : "bg-cream-100 text-charcoal-700 hover:bg-cream-200 hover:text-charcoal-900"
                                )}
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : searchQuery.length > 0 ? (
                  /* Minimum Characters Message */
                  <div className={cn(
                    "px-6 py-8 text-center text-sm",
                    theme === "dark" ? "text-dark-text-muted" : "text-charcoal-500"
                  )}>
                    Type at least 2 characters to search
                  </div>
                ) : (
                  /* Empty State */
                  <div className="px-6 py-12 text-center">
                    <div className={cn(
                      "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
                      theme === "dark" ? "bg-dark-bg-secondary" : "bg-cream-100"
                    )}>
                      <TrendingUp className={cn(
                        "w-8 h-8",
                        theme === "dark" ? "text-dark-text-muted" : "text-charcoal-400"
                      )} />
                    </div>
                    <p className={cn(
                      "font-serif text-lg font-semibold mb-2",
                      theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                    )}>
                      Start typing to search
                    </p>
                    <p className={cn(
                      "text-sm",
                      theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                    )}>
                      Search for products, collections, and more
                    </p>
                  </div>
                )}
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
