"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import { Search, X, Package, ShoppingBag, Users, FolderOpen, ArrowRight, ChevronRight } from "lucide-react";
import { AdminBody, AdminBodySmall, AdminCaption } from "@/components/admin/AdminTypography";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface AdminSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  type: 'product' | 'order' | 'customer' | 'category';
  id: string;
  title: string;
  description?: string;
  href: string;
  thumbnail?: string;
  metadata?: Record<string, unknown>;
}

const typeIcons = {
  product: Package,
  order: ShoppingBag,
  customer: Users,
  category: FolderOpen,
};

const typeLabels = {
  product: 'Products',
  order: 'Orders',
  customer: 'Customers',
  category: 'Categories',
};

/**
 * Admin Search Modal
 * 
 * Global search functionality for admin dashboard
 * Search across products, orders, customers, and pages
 */
export function AdminSearchModal({ isOpen, onClose }: AdminSearchModalProps): JSX.Element | null {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [groupedResults, setGroupedResults] = React.useState<Record<string, SearchResult[]>>({});
  const [isSearching, setIsSearching] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [selectedGroup, setSelectedGroup] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const resultsRef = React.useRef<HTMLDivElement>(null);

  // Focus input when modal opens
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Keyboard shortcuts and navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const flatResults = Object.values(groupedResults).flat();
        if (flatResults.length > 0) {
          setSelectedIndex((prev) => 
            prev < flatResults.length - 1 ? prev + 1 : prev
          );
        }
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        return;
      }

      if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        const flatResults = Object.values(groupedResults).flat();
        const selectedResult = flatResults[selectedIndex];
        if (selectedResult) {
          handleResultClick(selectedResult.href);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, selectedIndex, groupedResults]);

  // Global search function
  const performSearch = React.useCallback(async (searchQuery: string): Promise<void> => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      setGroupedResults({});
      setSelectedIndex(-1);
      return;
    }

    setIsSearching(true);
    setSelectedIndex(-1);

    try {
      const response = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}&limit=5`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const searchResults = data.data?.results || [];
        const grouped = data.data?.grouped || {};

        setResults(searchResults);
        setGroupedResults(grouped);
      } else {
        setResults([]);
        setGroupedResults({});
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
      setGroupedResults({});
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleResultClick = (href: string): void => {
    router.push(href);
    onClose();
    setQuery("");
    setResults([]);
    setGroupedResults({});
    setSelectedIndex(-1);
  };

  // Get all results as flat array for keyboard navigation
  const flatResults = React.useMemo(() => {
    return Object.values(groupedResults).flat();
  }, [groupedResults]);

  // Scroll selected item into view
  React.useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.querySelector(
        `[data-result-index="${selectedIndex}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-[var(--admin-space-4)]">
        {/* Backdrop */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <m.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="admin-modal admin-dropdown relative w-full max-w-2xl bg-white rounded-xl overflow-hidden shadow-2xl z-[101]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="admin-section-md border-b border-cream-200/50">
            <div className="admin-flex-sm items-center">
              <Search className="w-5 h-5 text-charcoal-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, orders, customers, categories..."
                className="flex-1 bg-transparent border-none outline-none text-charcoal-900 placeholder-charcoal-400 text-base"
                autoComplete="off"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                    setGroupedResults({});
                    setSelectedIndex(-1);
                    inputRef.current?.focus();
                  }}
                  className="p-[var(--admin-space-1)] hover:bg-cream-100 rounded transition-colors duration-200 flex-shrink-0"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-charcoal-400" />
                </button>
              )}
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-cream-100 rounded text-xs text-charcoal-500">
                <kbd className="px-1 py-0.5 bg-white border border-cream-300 rounded text-xs font-mono">
                  {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
                </kbd>
                <span>+</span>
                <kbd className="px-1 py-0.5 bg-white border border-cream-300 rounded text-xs font-mono">K</kbd>
              </div>
            </div>
          </div>

          {/* Results */}
          <div 
            ref={resultsRef}
            className="admin-scroll-container max-h-[60vh] overflow-y-auto"
          >
            {isSearching ? (
              <div className="admin-section-lg text-center">
                <div className="w-8 h-8 border-2 border-navy-600 border-t-transparent rounded-full animate-spin mx-auto mb-[var(--admin-space-2)]" />
                <AdminBodySmall className="text-charcoal-600">Searching...</AdminBodySmall>
              </div>
            ) : query.trim() && results.length === 0 ? (
              <div className="admin-section-lg text-center">
                <Search className="w-12 h-12 mx-auto mb-[var(--admin-space-3)] text-charcoal-300" />
                <AdminBody className="text-charcoal-600 mb-[var(--admin-space-1)]">No results found</AdminBody>
                <AdminBodySmall className="text-charcoal-500">Try a different search term</AdminBodySmall>
              </div>
            ) : query.trim() && Object.keys(groupedResults).length > 0 ? (
              <div className="admin-rhythm-sm p-[var(--admin-space-2)]">
                {Object.entries(groupedResults).map(([type, typeResults]) => {
                  if (typeResults.length === 0) return null;
                  const Icon = typeIcons[type as keyof typeof typeIcons];
                  const label = typeLabels[type as keyof typeof typeLabels];
                  let resultIndex = 0;
                  
                  // Calculate starting index for this group
                  Object.entries(groupedResults).forEach(([t, r]) => {
                    if (t === type) return;
                    if (Object.keys(groupedResults).indexOf(t) < Object.keys(groupedResults).indexOf(type)) {
                      resultIndex += r.length;
                    }
                  });

                  return (
                    <div key={type} className="mb-[var(--admin-space-4)]">
                      <div className="admin-flex-sm items-center gap-2 px-[var(--admin-space-3)] py-[var(--admin-space-2)] text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                        <span className="text-charcoal-400">({typeResults.length})</span>
                      </div>
                      <div className="space-y-1">
                        {typeResults.map((result, idx) => {
                          const globalIndex = resultIndex + idx;
                          const isSelected = selectedIndex === globalIndex;
                          return (
                            <button
                              key={result.id}
                              data-result-index={globalIndex}
                              onClick={() => handleResultClick(result.href)}
                              className={cn(
                                "w-full admin-flex-md items-center justify-between px-[var(--admin-space-3)] py-[var(--admin-space-3)] rounded-lg transition-all duration-200 text-left group border",
                                isSelected
                                  ? "bg-navy-50 border-navy-200"
                                  : "hover:bg-cream-50 border-transparent hover:border-cream-200/50"
                              )}
                            >
                              <div className="admin-flex-md items-center min-w-0 flex-1 gap-3">
                                {result.thumbnail ? (
                                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                    <Image
                                      src={result.thumbnail}
                                      alt={result.title}
                                      width={40}
                                      height={40}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="p-[var(--admin-space-2)] bg-navy-50 rounded-lg flex-shrink-0">
                                    <Icon className="w-4 h-4 text-navy-600" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <AdminBody className="font-medium text-charcoal-900 truncate">{result.title}</AdminBody>
                                  {result.description && (
                                    <AdminBodySmall className="text-charcoal-600 truncate">{result.description}</AdminBodySmall>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className={cn(
                                "w-4 h-4 flex-shrink-0 transition-opacity duration-200",
                                isSelected ? "text-navy-600 opacity-100" : "text-charcoal-400 opacity-0 group-hover:opacity-100"
                              )} />
                            </button>
                          );
                        })}
                      </div>
                      {typeResults.length >= 5 && (
                        <button
                          onClick={() => handleResultClick(`/admin/${type}s?search=${encodeURIComponent(query)}`)}
                          className="w-full px-[var(--admin-space-3)] py-[var(--admin-space-2)] text-sm text-navy-600 hover:text-navy-700 hover:bg-navy-50 rounded-lg transition-colors duration-200 text-left"
                        >
                          View all {label.toLowerCase()} →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="admin-section-lg">
                <AdminBody className="text-charcoal-600 mb-[var(--admin-space-4)] text-center">Start typing to search...</AdminBody>
                <div className="admin-grid-sm grid grid-cols-2 sm:grid-cols-4 gap-[var(--admin-space-2)]">
                  {[
                    { label: 'Products', icon: Package, href: '/admin/products' },
                    { label: 'Orders', icon: ShoppingBag, href: '/admin/orders' },
                    { label: 'Customers', icon: Users, href: '/admin/customers' },
                    { label: 'Categories', icon: FolderOpen, href: '/admin/categories' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={() => handleResultClick(item.href)}
                        className="admin-flex-sm flex-col items-center justify-center px-[var(--admin-space-3)] py-[var(--admin-space-4)] rounded-lg hover:bg-cream-50 transition-all duration-200 border border-transparent hover:border-cream-200/50"
                      >
                        <Icon className="w-5 h-5 text-navy-600 mb-[var(--admin-space-1)]" />
                        <AdminBodySmall className="text-charcoal-700 text-xs">{item.label}</AdminBodySmall>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </m.div>
      </div>
    </AnimatePresence>
  );
}
