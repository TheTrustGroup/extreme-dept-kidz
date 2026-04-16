"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Search, MoreVertical, FolderOpen, X, ArrowUpDown, Loader2, CheckSquare, Square, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CategoryFormModal } from "@/components/admin/CategoryFormModal";
import { cn } from "@/lib/utils";
import { m, AnimatePresence } from "framer-motion";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image?: string | null;
  parentId?: string | null;
  isActive: boolean;
  products?: Array<{ id: string }>;
  _count?: { products: number };
}

// Simple Tooltip Component
function Tooltip({ children, text }: { children: React.ReactNode; text: string }): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-lg whitespace-nowrap bottom-full left-1/2 -translate-x-1/2 mb-2">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

type StatusFilter = 'all' | 'active' | 'inactive';
type SortOption = 'name-asc' | 'name-desc' | 'products-asc' | 'products-desc';

export function CategoryManagement(): JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState<string[] | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(-1);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [bulkActionProgress, setBulkActionProgress] = useState<{ current: number; total: number; action: string } | null>(null);
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tableRef = useRef<HTMLTableElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  // Refresh categories after successful creation/update
  const handleCategorySuccess = (): void => {
    fetchCategories();
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  // Handle edit category
  const handleEditCategory = (category: Category): void => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  // Handle add category button click
  const handleAddCategoryClick = (): void => {
    setButtonLoading(true);
    setTimeout(() => {
      setButtonLoading(false);
      setEditingCategory(null);
      setShowCategoryModal(true);
    }, 150); // Small delay for button press feedback
  };

  // Refresh categories after successful creation (handled by parent or via event)
  useEffect(() => {
    const handleCategoryCreated = () => {
      fetchCategories();
    };
    
    // Listen for custom event when category is created
    window.addEventListener('category-created', handleCategoryCreated);
    return () => {
      window.removeEventListener('category-created', handleCategoryCreated);
    };
  }, []);

  // Debounce search term (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter and sort categories (declared before useEffects that depend on it)
  const filteredCategories = useMemo(() => {
    let filtered = categories.filter((category) => {
      if (statusFilter === 'active' && !category.isActive) return false;
      if (statusFilter === 'inactive' && category.isActive) return false;
      if (debouncedSearchTerm) {
        const query = debouncedSearchTerm.toLowerCase();
        return (
          category.name.toLowerCase().includes(query) ||
          category.slug.toLowerCase().includes(query) ||
          (category.description && category.description.toLowerCase().includes(query))
        );
      }
      return true;
    });
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'products-asc':
          return (a._count?.products ?? a.products?.length ?? 0) - (b._count?.products ?? b.products?.length ?? 0);
        case 'products-desc':
          return (b._count?.products ?? b.products?.length ?? 0) - (a._count?.products ?? a.products?.length ?? 0);
        default:
          return 0;
      }
    });
    return filtered;
  }, [categories, debouncedSearchTerm, statusFilter, sortOption]);

  // Clear selection when filters change (to avoid selecting items that are no longer visible)
  useEffect(() => {
    const visibleIds = new Set(filteredCategories.map(c => c.id));
    setSelectedIds(prev => {
      const filtered = new Set(Array.from(prev).filter(id => visibleIds.has(id)));
      return filtered.size === prev.size ? prev : filtered;
    });
  }, [filteredCategories]);

  // Keyboard shortcuts (Ctrl/Cmd + A to select all)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Ctrl/Cmd + A to select all visible items
      if ((e.metaKey || e.ctrlKey) && e.key === 'a' && tableRef.current) {
        e.preventDefault();
        const allVisibleIds = new Set(filteredCategories.map(c => c.id));
        setSelectedIds(allVisibleIds);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCategories]);

  // Select/deselect all
  const handleSelectAll = (checked: boolean): void => {
    if (checked) {
      const allIds = new Set(filteredCategories.map(c => c.id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  // Toggle single item selection
  const handleToggleSelect = (id: string, index: number, e?: React.MouseEvent): void => {
    if (e?.shiftKey && lastSelectedIndex >= 0) {
      // Shift+Click: select range
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const rangeIds = filteredCategories.slice(start, end + 1).map(c => c.id);
      const newSelection = new Set(selectedIds);
      rangeIds.forEach(id => newSelection.add(id));
      setSelectedIds(newSelection);
    } else {
      // Regular click: toggle single
      const newSelection = new Set(selectedIds);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      setSelectedIds(newSelection);
      setLastSelectedIndex(index);
    }
  };

  // Check if all visible items are selected
  const allSelected = filteredCategories.length > 0 && filteredCategories.every(c => selectedIds.has(c.id));
  const someSelected = filteredCategories.some(c => selectedIds.has(c.id));
  const selectedCount = selectedIds.size;

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (showActionsMenu) {
        const menuRef = menuRefs.current[showActionsMenu];
        if (menuRef && !menuRef.contains(event.target as Node)) {
          setShowActionsMenu(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionsMenu]);

  // Highlight matching text
  const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 text-charcoal-900 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  async function fetchCategories(): Promise<void> {
    try {
      const response = await fetch("/api/admin/categories", {
        credentials: 'include',
        cache: 'no-store', // Prevent caching
      });
      if (response.ok) {
        const data = await response.json();
        // Handle apiSuccess format: { success: true, data: { categories: [...], count: ... } }
        // Or direct format: { categories: [...] }
        // Or array format: [...]
        let categories: Category[] = [];
        
        if (data.success && data.data) {
          // apiSuccess format
          categories = Array.isArray(data.data.categories) 
            ? data.data.categories 
            : Array.isArray(data.data) 
              ? data.data 
              : [];
        } else if (Array.isArray(data.categories)) {
          categories = data.categories;
        } else if (Array.isArray(data)) {
          categories = data;
        } else if (Array.isArray(data.data)) {
          categories = data.data;
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[CategoryManagement] Fetched ${categories.length} categories:`, categories.map(c => c.name));
        }
        setCategories(categories);
      } else {
        const errorText = await response.text().catch(() => '');
        console.error("Failed to fetch categories:", response.status, response.statusText, errorText);
        // Set empty array on error to prevent crashes
        setCategories([]);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      // Set empty array on error to prevent crashes
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string): Promise<void> {
    setDeleteConfirm({ id, name });
  }

  async function confirmDelete(): Promise<void> {
    if (!deleteConfirm) return;

    const { id, name } = deleteConfirm;
    setDeleteConfirm(null);

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        credentials: 'include',
        cache: 'no-store',
      });

      if (response.ok) {
        // Refresh categories list to ensure we have latest data
        await fetchCategories();
        setSelectedIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        showToast({
          type: "success",
          title: "Category Deleted",
          message: `${name} has been deleted successfully`,
        });
      } else {
        const data = await response.json().catch(() => ({}));
        showToast({
          type: "error",
          title: "Delete Failed",
          message: data.error || data.message || "Failed to delete category",
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to delete category:", error);
      }
      showToast({
        type: "error",
        title: "Delete Failed",
        message: "An error occurred while deleting the category",
      });
    }
  }

  // Bulk actions
  const handleBulkAction = async (action: 'delete' | 'activate' | 'deactivate'): Promise<void> => {
    if (selectedIds.size === 0) return;

    const ids = Array.from(selectedIds);
    
    if (action === 'delete') {
      setBulkDeleteConfirm(ids);
      return;
    }

    setBulkActionLoading(true);
    setBulkActionProgress({ current: 0, total: ids.length, action });

    try {
      const response = await fetch('/api/admin/categories/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids, action }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCategories();
        setSelectedIds(new Set());
        setBulkActionProgress(null);
        showToast({
          type: "success",
          title: `Categories ${action === 'activate' ? 'Activated' : 'Deactivated'}`,
          message: data.message || `Successfully ${action}d ${ids.length} categor${ids.length === 1 ? 'y' : 'ies'}`,
        });
      } else {
        showToast({
          type: "error",
          title: "Bulk Action Failed",
          message: data.error || data.message || `Failed to ${action} categories`,
        });
      }
    } catch (error) {
      console.error("Bulk action error:", error);
      showToast({
        type: "error",
        title: "Bulk Action Failed",
        message: `An error occurred while ${action}ing categories`,
      });
    } finally {
      setBulkActionLoading(false);
      setBulkActionProgress(null);
    }
  };

  const confirmBulkDelete = async (): Promise<void> => {
    if (!bulkDeleteConfirm) return;

    const ids = bulkDeleteConfirm;
    setBulkDeleteConfirm(null);
    setBulkActionLoading(true);
    setBulkActionProgress({ current: 0, total: ids.length, action: 'delete' });

    try {
      const response = await fetch('/api/admin/categories/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids, action: 'delete' }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCategories();
        setSelectedIds(new Set());
        setBulkActionProgress(null);
        showToast({
          type: "success",
          title: "Categories Deleted",
          message: data.message || `Successfully deleted ${ids.length} categor${ids.length === 1 ? 'y' : 'ies'}`,
        });
      } else {
        showToast({
          type: "error",
          title: "Bulk Delete Failed",
          message: data.error || data.message || "Failed to delete categories",
        });
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      showToast({
        type: "error",
        title: "Bulk Delete Failed",
        message: "An error occurred while deleting categories",
      });
    } finally {
      setBulkActionLoading(false);
      setBulkActionProgress(null);
    }
  };

  // Export selected categories
  const handleExportSelected = (): void => {
    if (selectedIds.size === 0) return;

    const selectedCategories = categories.filter(c => selectedIds.has(c.id));
    const csvData = [
      ['Name', 'Slug', 'Description', 'Status', 'Products'],
      ...selectedCategories.map(c => [
        c.name,
        c.slug,
        c.description || '',
        c.isActive ? 'Active' : 'Inactive',
        (c._count?.products ?? c.products?.length ?? 0).toString(),
      ]),
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `categories-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast({
      type: "success",
      title: "Export Complete",
      message: `Exported ${selectedIds.size} categor${selectedIds.size === 1 ? 'y' : 'ies'}`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-charcoal-600">Loading categories...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-compact-2xl leading-compact-tight tracking-compact-tight font-bold text-charcoal-900">Categories</h1>
        <Button
          onClick={handleAddCategoryClick}
          disabled={buttonLoading}
          size="compact"
          className="transition-all duration-200 hover:bg-navy-800 active:bg-navy-950 active:scale-[0.98]"
        >
          {buttonLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Opening...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </>
          )}
        </Button>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-cream-200/50 mb-6">
        {/* Search and Filters */}
        <div className="p-4 border-b border-cream-200/50 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-400" />
            <Input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              density="compact"
              className="pl-10 pr-10 bg-white border-cream-300 focus-visible:ring-navy-500/20 focus-visible:border-navy-500 transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-charcoal-400 hover:text-charcoal-600 rounded transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label className="text-compact-sm font-bold uppercase tracking-compact-label text-charcoal-700">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="h-control-compact px-compact-4 text-compact-md border border-cream-300 rounded-compact focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 bg-white"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-charcoal-400" />
              <label className="text-compact-sm font-bold uppercase tracking-compact-label text-charcoal-700">Sort:</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="h-control-compact px-compact-4 text-compact-md border border-cream-300 rounded-compact focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 bg-white"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="products-desc">Most Products</option>
                <option value="products-asc">Least Products</option>
              </select>
            </div>

            {/* Results Count */}
            {debouncedSearchTerm && (
              <div className="ml-auto text-compact-md leading-compact-normal text-charcoal-600">
                Showing <span className="font-semibold">{filteredCategories.length}</span> of{' '}
                <span className="font-semibold">{categories.length}</span> categories
              </div>
            )}
          </div>
        </div>

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {selectedCount > 0 && (
            <m.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="sticky top-0 z-10 bg-navy-600 text-white px-4 sm:px-6 py-3 border-b border-navy-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg"
            >
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-medium">
                  {selectedCount} categor{selectedCount === 1 ? 'y' : 'ies'} selected
                </span>
                {bulkActionProgress && (
                  <span className="text-compact-md leading-compact-normal text-navy-200">
                    {bulkActionProgress.action === 'delete' ? 'Deleting' : bulkActionProgress.action === 'activate' ? 'Activating' : 'Deactivating'} {bulkActionProgress.current} of {bulkActionProgress.total}...
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="secondary"
                  size="compact"
                  onClick={() => handleBulkAction('activate')}
                  disabled={bulkActionLoading}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  Activate
                </Button>
                <Button
                  variant="secondary"
                  size="compact"
                  onClick={() => handleBulkAction('deactivate')}
                  disabled={bulkActionLoading}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  Deactivate
                </Button>
                <Button
                  variant="secondary"
                  size="compact"
                  onClick={handleExportSelected}
                  disabled={bulkActionLoading}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
                <Button
                  variant="secondary"
                  size="compact"
                  onClick={() => handleBulkAction('delete')}
                  disabled={bulkActionLoading}
                  className="bg-red-500/20 hover:bg-red-500/30 text-white border-red-400/30 flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  disabled={bulkActionLoading}
                  className="text-sm text-white/80 hover:text-white underline"
                >
                  Clear
                </button>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full">
            <thead className="bg-cream-50 border-b border-cream-200">
              <tr>
                <th className="px-6 py-3 text-left" style={{ width: '40px' }}>
                  <button
                    onClick={() => handleSelectAll(!allSelected)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    aria-label={allSelected ? "Deselect all" : "Select all"}
                  >
                    {allSelected ? (
                      <CheckSquare className="w-5 h-5 text-navy-600" />
                    ) : someSelected ? (
                      <div className="w-5 h-5 border-2 border-navy-600 rounded bg-navy-100" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-compact-sm font-bold text-charcoal-700 uppercase tracking-compact-label leading-compact-tight" style={{ width: '20%' }}>
                  Name
                </th>
                <th className="px-6 py-3 text-left text-compact-sm font-bold text-charcoal-700 uppercase tracking-compact-label leading-compact-tight" style={{ width: '15%' }}>
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-compact-sm font-bold text-charcoal-700 uppercase tracking-compact-label leading-compact-tight" style={{ width: '40%' }}>
                  Description
                </th>
                <th className="px-6 py-3 text-left text-compact-sm font-bold text-charcoal-700 uppercase tracking-compact-label leading-compact-tight" style={{ width: '10%' }}>
                  Products
                </th>
                <th className="px-6 py-3 text-left text-compact-sm font-bold text-charcoal-700 uppercase tracking-compact-label leading-compact-tight" style={{ width: '10%' }}>
                  Status
                </th>
                <th className="px-6 py-3 text-right text-compact-sm font-bold text-charcoal-700 uppercase tracking-compact-label leading-compact-tight" style={{ width: '5%' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FolderOpen className="w-16 h-16 text-charcoal-300 mb-4" />
                      <h3 className="text-compact-xl leading-compact-tight tracking-compact-tight font-semibold text-charcoal-900 mb-2">
                        {debouncedSearchTerm ? "No categories found" : categories.length === 0 ? "No categories yet" : "No categories match your filters"}
                      </h3>
                      <p className="text-compact-md leading-compact-normal text-charcoal-600 mb-6">
                        {debouncedSearchTerm 
                          ? "Try adjusting your search terms or filters" 
                          : categories.length === 0
                          ? "Get started by creating your first category"
                          : "Try changing your filters"}
                      </p>
                      {debouncedSearchTerm ? (
                        <Button
                            size="compact"
                          onClick={() => {
                            setSearchTerm("");
                            setStatusFilter('all');
                          }}
                          variant="secondary"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Clear search and filters
                        </Button>
                      ) : categories.length === 0 ? (
                        <Link href="/admin/categories/new">
                          <Button size="compact" className="flex items-center gap-1.5">
                            <Plus className="w-4 h-4" />
                            Create your first category
                          </Button>
                        </Link>
                      ) : (
                        <Button
                            size="compact"
                          onClick={() => setStatusFilter('all')}
                          variant="secondary"
                        >
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category, index) => {
                  const isSelected = selectedIds.has(category.id);
                  return (
                    <tr 
                      key={category.id} 
                      className={cn(
                        "border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 h-12",
                        isSelected && "bg-blue-50 hover:bg-blue-100"
                      )}
                    >
                      <td className="px-6 py-3 whitespace-nowrap">
                        <button
                          onClick={(e) => handleToggleSelect(category.id, index, e)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          aria-label={isSelected ? "Deselect" : "Select"}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-navy-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                      <div className="font-medium text-charcoal-900 text-compact-md leading-compact-normal">
                        {debouncedSearchTerm ? highlightText(category.name, debouncedSearchTerm) : category.name}
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-compact-md leading-compact-normal text-charcoal-600">
                      <code className="text-compact-sm bg-gray-100 px-2 py-1 rounded font-mono">
                        {debouncedSearchTerm ? highlightText(category.slug, debouncedSearchTerm) : category.slug}
                      </code>
                    </td>
                    <td className="px-6 py-3 text-compact-md leading-compact-normal text-charcoal-600">
                      <div className="line-clamp-2 max-w-md">
                        {category.description ? (
                          debouncedSearchTerm ? highlightText(category.description, debouncedSearchTerm) : category.description
                        ) : (
                          <span className="text-charcoal-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-compact-md leading-compact-normal text-charcoal-600">
                      <span className="font-medium">
                        {category._count?.products ?? category.products?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 text-compact-sm leading-compact-tight font-semibold rounded-full",
                          category.isActive
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        )}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-4">
                        <Tooltip text="Edit category">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="p-2 text-charcoal-600 hover:text-navy-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            aria-label="Edit category"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        </Tooltip>
                        <Tooltip text="Delete category">
                          <button
                            onClick={() => handleDelete(category.id, category.name)}
                            className="p-2 text-charcoal-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            aria-label="Delete category"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </Tooltip>
                        <div className="relative" ref={(el) => { menuRefs.current[category.id] = el; }}>
                          <Tooltip text="More actions">
                            <button
                              onClick={() => setShowActionsMenu(showActionsMenu === category.id ? null : category.id)}
                              className="p-2 text-charcoal-600 hover:text-navy-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                              aria-label="More actions"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </Tooltip>
                          {showActionsMenu === category.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                              <button
                                onClick={() => {
                                  setShowActionsMenu(null);
                                  handleEditCategory(category);
                                }}
                                className="w-full text-left px-4 py-2 text-compact-md leading-compact-normal text-charcoal-700 hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Edit className="w-4 h-4" />
                                  Edit Category
                                </div>
                              </button>
                              <button
                                onClick={() => {
                                  setShowActionsMenu(null);
                                  handleDelete(category.id, category.name);
                                }}
                                className="w-full text-left px-4 py-2 text-compact-md leading-compact-normal text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Trash2 className="w-4 h-4" />
                                  Delete Category
                                </div>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!bulkDeleteConfirm}
        title={`Delete ${bulkDeleteConfirm?.length || 0} Categor${bulkDeleteConfirm && bulkDeleteConfirm.length === 1 ? 'y' : 'ies'}?`}
        message={
          <div className="space-y-3">
            <p>
              Are you sure you want to delete {bulkDeleteConfirm?.length || 0} categor{bulkDeleteConfirm && bulkDeleteConfirm.length === 1 ? 'y' : 'ies'}? This action cannot be undone.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-compact-md leading-compact-normal font-medium text-yellow-800 mb-1">⚠️ Warning:</p>
              <p className="text-compact-md leading-compact-normal text-yellow-700">
                Products in these categories will become uncategorized. Categories with products cannot be deleted.
              </p>
            </div>
            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50">
              <p className="text-compact-sm leading-compact-normal font-medium text-gray-700 mb-1">Affected categories:</p>
              <ul className="text-compact-sm leading-compact-normal text-gray-600 space-y-1">
                {bulkDeleteConfirm?.map(id => {
                  const category = categories.find(c => c.id === id);
                  return category ? (
                    <li key={id}>• {category.name} {(category._count?.products ?? category.products?.length ?? 0) > 0 && `(${(category._count?.products ?? category.products?.length ?? 0)} products)`}</li>
                  ) : null;
                })}
              </ul>
            </div>
          </div>
        }
        confirmText="Delete All"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteConfirm(null)}
      />

      <CategoryFormModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSuccess={handleCategorySuccess}
      />
    </div>
  );
}
