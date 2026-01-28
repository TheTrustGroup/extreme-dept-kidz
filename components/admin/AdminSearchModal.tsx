"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import { Search, X, Package, ShoppingBag, Users, FileText, ArrowRight } from "lucide-react";
import { AdminBody, AdminBodySmall, AdminCaption } from "@/components/admin/AdminTypography";

interface AdminSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  type: 'product' | 'order' | 'customer' | 'page';
  title: string;
  description?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

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
  const [isSearching, setIsSearching] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

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

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // This would be handled by parent component
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Mock search function - replace with actual API call
  const performSearch = React.useCallback(async (searchQuery: string): Promise<void> => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock results - replace with actual search API
    const mockResults: SearchResult[] = [
      {
        type: 'product',
        title: `Products matching "${searchQuery}"`,
        description: 'View all products',
        href: `/admin/products?search=${encodeURIComponent(searchQuery)}`,
        icon: Package,
      },
      {
        type: 'order',
        title: `Orders matching "${searchQuery}"`,
        description: 'View all orders',
        href: `/admin/orders?search=${encodeURIComponent(searchQuery)}`,
        icon: ShoppingBag,
      },
      {
        type: 'customer',
        title: `Customers matching "${searchQuery}"`,
        description: 'View all customers',
        href: `/admin/customers?search=${encodeURIComponent(searchQuery)}`,
        icon: Users,
      },
    ];

    setResults(mockResults);
    setIsSearching(false);
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
  };

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
                placeholder="Search products, orders, customers..."
                className="flex-1 bg-transparent border-none outline-none text-charcoal-900 placeholder-charcoal-400 text-base"
              />
              <button
                onClick={onClose}
                className="p-[var(--admin-space-1)] hover:bg-cream-100 rounded transition-colors duration-200 flex-shrink-0"
                aria-label="Close search"
              >
                <X className="w-4 h-4 text-charcoal-400" />
              </button>
            </div>
            <div className="mt-[var(--admin-space-2)] admin-flex-sm items-center">
              <AdminCaption className="text-xs text-charcoal-500">
                Press <kbd className="px-1.5 py-0.5 bg-cream-100 rounded text-xs font-mono">⌘K</kbd> to search, <kbd className="px-1.5 py-0.5 bg-cream-100 rounded text-xs font-mono">Esc</kbd> to close
              </AdminCaption>
            </div>
          </div>

          {/* Results */}
          <div className="admin-scroll-container max-h-[60vh] overflow-y-auto">
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
            ) : query.trim() ? (
              <div className="admin-rhythm-sm p-[var(--admin-space-2)]">
                {results.map((result, index) => {
                  const Icon = result.icon;
                  return (
                    <button
                      key={`${result.type}-${index}`}
                      onClick={() => handleResultClick(result.href)}
                      className="w-full admin-flex-md items-center justify-between px-[var(--admin-space-3)] py-[var(--admin-space-3)] rounded-lg hover:bg-cream-50 transition-all duration-200 text-left group border border-transparent hover:border-cream-200/50"
                    >
                      <div className="admin-flex-md items-center min-w-0 flex-1">
                        <div className="p-[var(--admin-space-2)] bg-navy-50 rounded-lg flex-shrink-0">
                          <Icon className="w-4 h-4 text-navy-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <AdminBody className="font-medium text-charcoal-900 truncate">{result.title}</AdminBody>
                          {result.description && (
                            <AdminBodySmall className="text-charcoal-600 truncate">{result.description}</AdminBodySmall>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-charcoal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                    </button>
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
                    { label: 'Activity', icon: FileText, href: '/admin/activity' },
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
