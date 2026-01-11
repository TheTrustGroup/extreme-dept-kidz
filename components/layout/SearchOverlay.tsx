"use client";

import * as React from "react";
import { m } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

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

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps): JSX.Element {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Debounced search
  React.useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleResultClick = (slug: string) => {
    router.push(`/products/${slug}`);
    onClose();
    setSearchQuery("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <m.div
            className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-md z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <m.div
            className="fixed inset-0 z-[70] flex items-start justify-center pt-20 px-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-2xl">
              <div className="bg-cream-50 rounded-lg shadow-2xl p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <Search className="w-6 h-6 text-charcoal-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products, collections..."
                    className="flex-1 text-lg font-sans text-charcoal-900 placeholder:text-charcoal-400 bg-transparent border-none outline-none"
                    autoComplete="off"
                  />
                  <button
                    onClick={onClose}
                    className="p-2 text-charcoal-400 hover:text-charcoal-900 transition-colors"
                    aria-label="Close search"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {/* Search Results */}
                {searchQuery.length >= 2 && (
                  <div className="max-h-[60vh] overflow-y-auto">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
                        <span className="ml-2 text-charcoal-600">Searching...</span>
                      </div>
                    ) : results.length > 0 ? (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-charcoal-500 px-2 py-1">
                          {results.length} result{results.length !== 1 ? 's' : ''} found
                        </div>
                        {results.map((result) => (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result.slug)}
                            className="w-full flex items-center gap-4 p-4 hover:bg-cream-100 rounded-lg transition-colors text-left group"
                          >
                            <div className="relative w-16 h-16 flex-shrink-0 bg-cream-200 rounded-lg overflow-hidden">
                              <Image
                                src={result.image}
                                alt={result.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                                sizes="64px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-charcoal-900 group-hover:text-navy-900 transition-colors">
                                {result.name}
                              </div>
                              <div className="text-sm text-charcoal-500">{result.category}</div>
                              <div className="text-sm font-semibold text-navy-900 mt-1">
                                {formatPrice(result.price)}
                              </div>
                            </div>
                            <Search className="w-5 h-5 text-charcoal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    ) : hasSearched ? (
                      <div className="text-center py-12">
                        <p className="text-charcoal-600 mb-2">No products found</p>
                        <p className="text-sm text-charcoal-500">
                          Try a different search term
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}

                {searchQuery.length < 2 && searchQuery.length > 0 && (
                  <div className="text-sm text-charcoal-500 text-center py-4">
                    Type at least 2 characters to search
                  </div>
                )}

                {!searchQuery && (
                  <div className="text-sm text-charcoal-500 text-center py-4">
                    Start typing to search for products...
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
