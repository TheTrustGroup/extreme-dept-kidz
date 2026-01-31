"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  Package,
  Eye,
  Download,
  Upload,
  X,
  ChevronDown,
  Grid3x3,
  List,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MinusCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { H1 } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductWithStats extends Product {
  totalStock?: number;
  totalSold?: number;
}

type QuickFilter = "all" | "published" | "drafts" | "lowStock" | "outOfStock";
type SortBy = "name" | "price" | "stock" | "createdAt" | "bestSelling";
type ViewMode = "list" | "grid";

interface FilterState {
  categoryId: string;
  status: string;
  stockStatus: string;
  minPrice: string;
  maxPrice: string;
}

/**
 * Products Management Page
 * 
 * Comprehensive product management with full CRUD, filtering, sorting, and bulk actions.
 */
export default function ProductsPage(): JSX.Element {
  const router = useRouter();
  const { showToast } = useToast();
  
  // State
  const [products, setProducts] = React.useState<ProductWithStats[]>([]);
  const [categories, setCategories] = React.useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [quickFilter, setQuickFilter] = React.useState<QuickFilter>("all");
  const [sortBy, setSortBy] = React.useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  
  // Filter state
  const [showFilters, setShowFilters] = React.useState(false);
  const [filters, setFilters] = React.useState<FilterState>({
    categoryId: "",
    status: "",
    stockStatus: "",
    minPrice: "",
    maxPrice: "",
  });
  
  // Selection & Actions
  const [selectedProducts, setSelectedProducts] = React.useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ id: string; name: string } | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = React.useState(false);
  const [bulkCategoryDialog, setBulkCategoryDialog] = React.useState(false);
  const [bulkStatusDialog, setBulkStatusDialog] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);

  // Stats for quick filters
  const [stats, setStats] = React.useState({
    all: 0,
    published: 0,
    drafts: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  // Load categories (use same-origin base so fetch works behind proxy / different port)
  React.useEffect(() => {
    async function loadCategories(): Promise<void> {
      try {
        const base = typeof window !== "undefined" ? window.location.origin : "";
        const res = await fetch(`${base}/api/admin/categories`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const cats = data.data?.categories || data.categories || [];
          setCategories(cats);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    }
    loadCategories();
  }, []);

  // Load products
  const loadProducts = React.useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (search) params.set('search', search);
      if (filters.categoryId) params.set('categoryId', filters.categoryId);
      if (filters.status) params.set('status', filters.status);
      if (filters.stockStatus) params.set('stockStatus', filters.stockStatus);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (sortBy) params.set('sortBy', sortBy);
      if (sortOrder) params.set('sortOrder', sortOrder);
      params.set('page', page.toString());
      params.set('limit', '50');

      // Apply quick filter
      if (quickFilter === 'published') {
        params.set('status', 'active');
      } else if (quickFilter === 'drafts') {
        params.set('status', 'draft');
      } else if (quickFilter === 'lowStock') {
        params.set('stockStatus', 'lowStock');
      } else if (quickFilter === 'outOfStock') {
        params.set('stockStatus', 'outOfStock');
      }

      const base = typeof window !== "undefined" ? window.location.origin : "";
      const response = await fetch(`${base}/api/admin/products?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      const productsData = data.data?.products || data.products || [];
      setProducts(productsData);
      setTotal(data.data?.total || data.total || 0);
      setTotalPages(data.data?.totalPages || data.totalPages || 1);

      // Load stats for quick filters
      loadStats();
    } catch (error) {
      console.error("Failed to load products:", error);
      showToast({
        type: "error",
        title: "Failed to Load Products",
        message: "Could not fetch products. Please refresh the page.",
      });
    } finally {
      setLoading(false);
    }
  }, [search, filters, sortBy, sortOrder, page, quickFilter, showToast]);

  // Load stats - consolidated single API call
  const loadStats = React.useCallback(async (): Promise<void> => {
    try {
      const base = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${base}/api/admin/products/stats`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const statsData = data.data || data;
        setStats({
          all: statsData.all || 0,
          published: statsData.published || 0,
          drafts: statsData.drafts || 0,
          lowStock: statsData.lowStock || 0,
          outOfStock: statsData.outOfStock || 0,
        });
      } else {
        console.error("Failed to load stats:", res.statusText);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  }, []);

  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Selection handlers
  const toggleSelect = (productId: string): void => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const toggleSelectAll = (): void => {
    if (selectedProducts.size === products.length && products.length > 0) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    }
  };

  // Delete handlers
  const handleDelete = (id: string, name: string): void => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deleteConfirm) return;

    const { id, name } = deleteConfirm;
    setDeleteConfirm(null);
    setProcessing(true);

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        credentials: 'include',
      });

      if (response.ok) {
        showToast({
          type: "success",
          title: "Product Deleted",
          message: `${name} has been deleted successfully`,
        });
        await loadProducts();
        setSelectedProducts((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        const data = await response.json().catch(() => ({}));
        showToast({
          type: "error",
          title: "Delete Failed",
          message: data.error || data.message || "Failed to delete product.",
        });
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      showToast({
        type: "error",
        title: "Delete Failed",
        message: "An error occurred while deleting the product.",
      });
    } finally {
      setProcessing(false);
    }
  };

  // Bulk actions
  const handleBulkDelete = (): void => {
    if (selectedProducts.size === 0) return;
    setBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async (): Promise<void> => {
    if (selectedProducts.size === 0) {
      setBulkDeleteConfirm(false);
      return;
    }

    setBulkDeleteConfirm(false);
    setProcessing(true);

    try {
      const response = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ids: Array.from(selectedProducts),
          action: 'delete',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast({
          type: "success",
          title: "Products Deleted",
          message: data.message || `Successfully deleted ${selectedProducts.size} product${selectedProducts.size !== 1 ? 's' : ''}`,
        });
        await loadProducts();
        setSelectedProducts(new Set());
      } else {
        showToast({
          type: "error",
          title: "Delete Failed",
          message: data.error || data.message || "Failed to delete products.",
        });
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      showToast({
        type: "error",
        title: "Delete Failed",
        message: "An error occurred while deleting products.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkStatusChange = async (status: boolean): Promise<void> => {
    if (selectedProducts.size === 0) return;

    setBulkStatusDialog(false);
    setProcessing(true);

    try {
      const response = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ids: Array.from(selectedProducts),
          action: status ? 'activate' : 'deactivate',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast({
          type: "success",
          title: "Status Updated",
          message: data.message || `Successfully updated ${selectedProducts.size} product${selectedProducts.size !== 1 ? 's' : ''}`,
        });
        await loadProducts();
        setSelectedProducts(new Set());
      } else {
        showToast({
          type: "error",
          title: "Update Failed",
          message: data.error || data.message || "Failed to update products.",
        });
      }
    } catch (error) {
      console.error("Bulk status change error:", error);
      showToast({
        type: "error",
        title: "Update Failed",
        message: "An error occurred while updating products.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkAssignCategory = async (categoryId: string): Promise<void> => {
    if (selectedProducts.size === 0 || !categoryId) return;

    setBulkCategoryDialog(false);
    setProcessing(true);

    try {
      const response = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ids: Array.from(selectedProducts),
          action: 'assignCategory',
          categoryId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast({
          type: "success",
          title: "Category Assigned",
          message: data.message || `Successfully assigned ${selectedProducts.size} product${selectedProducts.size !== 1 ? 's' : ''} to category`,
        });
        await loadProducts();
        setSelectedProducts(new Set());
      } else {
        showToast({
          type: "error",
          title: "Assignment Failed",
          message: data.error || data.message || "Failed to assign category.",
        });
      }
    } catch (error) {
      console.error("Bulk assign category error:", error);
      showToast({
        type: "error",
        title: "Assignment Failed",
        message: "An error occurred while assigning category.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkDuplicate = async (): Promise<void> => {
    if (selectedProducts.size === 0) return;

    setProcessing(true);

    try {
      const response = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ids: Array.from(selectedProducts),
          action: 'duplicate',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast({
          type: "success",
          title: "Products Duplicated",
          message: data.message || `Successfully duplicated ${selectedProducts.size} product${selectedProducts.size !== 1 ? 's' : ''}`,
        });
        await loadProducts();
        setSelectedProducts(new Set());
      } else {
        showToast({
          type: "error",
          title: "Duplication Failed",
          message: data.error || data.message || "Failed to duplicate products.",
        });
      }
    } catch (error) {
      console.error("Bulk duplicate error:", error);
      showToast({
        type: "error",
        title: "Duplication Failed",
        message: "An error occurred while duplicating products.",
      });
    } finally {
      setProcessing(false);
    }
  };

  // Export handlers
  const handleExport = (allProducts = false): void => {
    const productsToExport = allProducts ? products : products.filter((p) => selectedProducts.has(p.id));

    if (!allProducts && productsToExport.length === 0) {
      showToast({
        type: "info",
        title: "No Products Selected",
        message: "Please select products to export",
      });
      return;
    }

    const csv = [
      ["Name", "SKU", "Price", "Category", "Stock", "Status"].join(","),
      ...productsToExport.map((p) => {
        const totalStock = p.totalStock ?? p.sizes.reduce((sum, size) => sum + (size.quantity || 0), 0);
        return [
          `"${p.name}"`,
          p.sku || "",
          formatPrice(p.price),
          p.category.name,
          totalStock.toString(),
          p.inStock ? "Active" : "Out of Stock",
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showToast({
      type: "success",
      title: "Export Started",
      message: `${productsToExport.length} product${productsToExport.length !== 1 ? 's' : ''} exported`,
    });
  };

  // Get product status
  const getProductStatus = (product: ProductWithStats): { label: string; color: string; dot: string } => {
    const totalStock = product.totalStock ?? product.sizes.reduce((sum, size) => sum + (size.quantity || 0), 0);
    
    if (!product.inStock || totalStock === 0) {
      return { label: "Out of Stock", color: "bg-red-100 text-red-800", dot: "bg-red-500" };
    }
    
    if (product.images.length === 0) {
      return { label: "Draft", color: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-500" };
    }
    
    return { label: "Active", color: "bg-green-100 text-green-800", dot: "bg-green-500" };
  };

  // Clear filters
  const clearFilters = (): void => {
    setFilters({
      categoryId: "",
      status: "",
      stockStatus: "",
      minPrice: "",
      maxPrice: "",
    });
    setSearch("");
    setQuickFilter("all");
    setPage(1);
  };

  const hasActiveFilters = search || filters.categoryId || filters.status || filters.stockStatus || filters.minPrice || filters.maxPrice || quickFilter !== "all";

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <H1 className="text-gray-900 text-3xl font-bold mb-2">Products</H1>
            <p className="text-gray-600 text-sm">Manage your product catalog</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => handleExport(true)} disabled={processing}>
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
            <Button variant="secondary" size="sm" disabled>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="primary" asChild className="shadow-md hover:shadow-lg">
              <Link href="/admin/products/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
          {([
            { key: "all" as QuickFilter, label: "All Products", icon: Package },
            { key: "published" as QuickFilter, label: "Published", icon: CheckCircle2 },
            { key: "drafts" as QuickFilter, label: "Drafts", icon: AlertCircle },
            { key: "lowStock" as QuickFilter, label: "Low Stock", icon: MinusCircle },
            { key: "outOfStock" as QuickFilter, label: "Out of Stock", icon: XCircle },
          ]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setQuickFilter(key);
                setPage(1);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                quickFilter === key
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs",
                quickFilter === key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              )}>
                {stats[key]}
              </span>
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, SKU, or category..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && "bg-indigo-50 border-indigo-200")}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                  {[search, filters.categoryId, filters.status, filters.stockStatus, filters.minPrice, filters.maxPrice].filter(Boolean).length}
                </span>
              )}
            </Button>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "list" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                )}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 transition-colors border-l border-gray-300",
                  viewMode === "grid" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                )}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.categoryId}
                    onChange={(e) => {
                      setFilters({ ...filters, categoryId: e.target.value });
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => {
                      setFilters({ ...filters, status: e.target.value });
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="outOfStock">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
                  <select
                    value={filters.stockStatus}
                    onChange={(e) => {
                      setFilters({ ...filters, stockStatus: e.target.value });
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">All Stock Levels</option>
                    <option value="inStock">In Stock</option>
                    <option value="lowStock">Low Stock</option>
                    <option value="outOfStock">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as SortBy);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="createdAt">Date Added</option>
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="stock">Stock</option>
                    <option value="bestSelling">Best Selling</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (₵)</label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => {
                      setFilters({ ...filters, minPrice: e.target.value });
                      setPage(1);
                    }}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (₵)</label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => {
                      setFilters({ ...filters, maxPrice: e.target.value });
                      setPage(1);
                    }}
                    placeholder="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              {hasActiveFilters && (
                <div className="flex justify-end pt-2 border-t border-gray-200">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </div>
              )}
            </m.div>
          )}
        </AnimatePresence>

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {selectedProducts.size > 0 && (
            <m.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {selectedProducts.size}
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  product{selectedProducts.size !== 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setBulkStatusDialog(true)}
                  disabled={processing}
                >
                  Change Status
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setBulkCategoryDialog(true)}
                  disabled={processing}
                >
                  Assign Category
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBulkDuplicate}
                  disabled={processing}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleExport(false)}
                  disabled={processing}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleBulkDelete}
                  disabled={processing}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProducts(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {/* Products Table/Grid */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              {hasActiveFilters ? (
                <>
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2 font-medium">No products match your search</p>
                  <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or search terms</p>
                  <Button variant="primary" onClick={clearFilters} className="shadow-md hover:shadow-lg">
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2 font-medium">No products yet</p>
                  <p className="text-gray-500 text-sm mb-6">Get started by creating your first product</p>
                  <Button variant="primary" asChild className="shadow-md hover:shadow-lg">
                    <Link href="/admin/products/new">Add Your First Product</Link>
                  </Button>
                </>
              )}
            </div>
          ) : viewMode === "list" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-4 text-left w-12">
                      <input
                        type="checkbox"
                        checked={selectedProducts.size === products.length && products.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
                      />
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Product</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Stock</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Store</th>
                    <th className="px-4 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product, idx) => {
                    const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
                    const totalStock = product.totalStock ?? product.sizes.reduce((sum, size) => sum + (size.quantity || 0), 0);
                    const isSelected = selectedProducts.has(product.id);
                    const status = getProductStatus(product);
                    const visibleOnStore = (product as { visibleOnStore?: boolean }).visibleOnStore !== false;

                    return (
                      <m.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className={cn(
                          "group hover:bg-gray-50 transition-all duration-150",
                          isSelected && "bg-indigo-50 border-l-4 border-indigo-500"
                        )}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(product.id)}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all hover:scale-110"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-[60px] h-[60px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 group-hover:ring-2 group-hover:ring-indigo-200 transition-all">
                              {primaryImage ? (
                                <Image
                                  src={primaryImage.url}
                                  alt={product.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                                  sizes="60px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                {product.name}
                              </p>
                              <p className="text-sm text-gray-500 font-mono">{product.sku || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600">{product.category.name}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "text-sm font-medium",
                                totalStock > 10
                                  ? "text-green-600"
                                  : totalStock > 0
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              )}
                            >
                              {totalStock}
                            </span>
                            {totalStock <= 10 && totalStock > 0 && (
                              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                            )}
                            {totalStock === 0 && (
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-semibold text-gray-900">{formatPrice(product.price)}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className={cn("w-2 h-2 rounded-full", status.dot)} />
                            <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", status.color)}>
                              {status.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                            visibleOnStore ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                          )}>
                            {visibleOnStore ? "Visible" : "Hidden"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                              title="Quick View"
                            >
                              <Link href={`/products/${product.slug}`} target="_blank">
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                              title="Edit"
                            >
                              <Link href={`/admin/products/${product.id}`}>
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-gray-100 transition-all"
                              title="Duplicate"
                              onClick={async () => {
                                setSelectedProducts(new Set([product.id]));
                                await handleBulkDuplicate();
                              }}
                              disabled={processing}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all"
                              title="Delete"
                              onClick={() => handleDelete(product.id, product.name)}
                              disabled={processing}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </m.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product, idx) => {
                const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
                const totalStock = product.totalStock ?? product.sizes.reduce((sum, size) => sum + (size.quantity || 0), 0);
                const isSelected = selectedProducts.has(product.id);
                const status = getProductStatus(product);

                return (
                  <m.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className={cn(
                      "bg-white border-2 rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group",
                      isSelected ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-300"
                    )}
                    onClick={() => toggleSelect(product.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {primaryImage ? (
                          <Image
                            src={primaryImage.url}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelect(product.id);
                        }}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-gray-500 font-mono mb-2">{product.sku || "—"}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{product.category.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={cn("w-2 h-2 rounded-full", status.dot)} />
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", status.color)}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{formatPrice(product.price)}</span>
                      <span className={cn(
                        "text-xs font-medium",
                        totalStock > 10 ? "text-green-600" : totalStock > 0 ? "text-yellow-600" : "text-red-600"
                      )}>
                        {totalStock} in stock
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="flex-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/admin/products/${product.id}`}>
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product.id, product.name);
                        }}
                        disabled={processing}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </m.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-6 py-4 shadow-sm">
            <p className="text-sm text-gray-600">
              Showing page <span className="font-semibold text-gray-900">{page}</span> of{" "}
              <span className="font-semibold text-gray-900">{totalPages}</span> ({total} total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Confirmation Dialogs */}
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />

        <ConfirmDialog
          isOpen={bulkDeleteConfirm}
          title="Delete Multiple Products"
          message={`Are you sure you want to delete ${selectedProducts.size} product${selectedProducts.size !== 1 ? 's' : ''}? This action cannot be undone.`}
          confirmText="Delete All"
          cancelText="Cancel"
          variant="danger"
          onConfirm={confirmBulkDelete}
          onCancel={() => setBulkDeleteConfirm(false)}
        />

        {bulkStatusDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setBulkStatusDialog(false)}>
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Change Product Status</h3>
              <p className="text-sm text-gray-600 mb-4">
                Change status for {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''}?
              </p>
              <div className="space-y-2">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    handleBulkStatusChange(true);
                    setBulkStatusDialog(false);
                  }}
                  disabled={processing}
                >
                  Activate (Published)
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    handleBulkStatusChange(false);
                    setBulkStatusDialog(false);
                  }}
                  disabled={processing}
                >
                  Deactivate (Draft)
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setBulkStatusDialog(false)}
                  disabled={processing}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog
          isOpen={bulkCategoryDialog}
          title="Assign Category"
          message={`Assign a category to ${selectedProducts.size} product${selectedProducts.size !== 1 ? 's' : ''}:`}
          confirmText="Assign"
          cancelText="Cancel"
          onConfirm={() => {
            // This will be handled by the select change
          }}
          onCancel={() => setBulkCategoryDialog(false)}
        >
          <div className="mt-4">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkAssignCategory(e.target.value);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </ConfirmDialog>
      </div>
    </ErrorBoundary>
  );
}
