"use client";

import * as React from "react";
import { m } from "framer-motion";
import {
  Package,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  Filter,
  Download,
  Edit,
  MoreVertical,
  CheckSquare,
  Square,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StockUpdateModal } from "../StockUpdateModal";
import type { ProductSize } from "@/types";

interface InventoryVariant {
  id: string;
  productId: string;
  productName: string;
  category: string;
  sku: string;
  size: string;
  stock: number;
  lowStockThreshold: number;
  price: number;
  imageUrl?: string;
}

interface AdvancedInventoryTableProps {
  variants: InventoryVariant[];
  loading?: boolean;
  onStockUpdate?: (variantId: string, stock: number) => void;
  onBulkUpdate?: (variantIds: string[], action: 'add' | 'subtract' | 'set', value: number) => void;
}

type SortField = 'productName' | 'category' | 'sku' | 'size' | 'stock' | 'price';
type SortDirection = 'asc' | 'desc';

export function AdvancedInventoryTable({
  variants,
  loading = false,
  onStockUpdate,
  onBulkUpdate,
}: AdvancedInventoryTableProps): JSX.Element {
  const [search, setSearch] = React.useState("");
  const [sortField, setSortField] = React.useState<SortField>('productName');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc');
  const [selectedVariants, setSelectedVariants] = React.useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = React.useState<string>("all");
  const [filterStock, setFilterStock] = React.useState<string>("all");
  const [editingVariant, setEditingVariant] = React.useState<string | null>(null);
  const [editStockValue, setEditStockValue] = React.useState<number>(0);
  const [showBulkModal, setShowBulkModal] = React.useState(false);

  // Get unique categories
  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    variants.forEach(v => cats.add(v.category));
    return Array.from(cats).sort();
  }, [variants]);

  // Filter and sort variants
  const filteredAndSorted = React.useMemo(() => {
    let filtered = [...variants];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        v =>
          v.productName.toLowerCase().includes(searchLower) ||
          v.sku.toLowerCase().includes(searchLower) ||
          v.category.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(v => v.category === filterCategory);
    }

    // Stock filter
    if (filterStock === "low") {
      filtered = filtered.filter(v => v.stock > 0 && v.stock <= v.lowStockThreshold);
    } else if (filterStock === "out") {
      filtered = filtered.filter(v => v.stock === 0);
    } else if (filterStock === "in") {
      filtered = filtered.filter(v => v.stock > v.lowStockThreshold);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortField) {
        case 'productName':
          aVal = a.productName;
          bVal = b.productName;
          break;
        case 'category':
          aVal = a.category;
          bVal = b.category;
          break;
        case 'sku':
          aVal = a.sku;
          bVal = b.sku;
          break;
        case 'size':
          aVal = a.size;
          bVal = b.size;
          break;
        case 'stock':
          aVal = a.stock;
          bVal = b.stock;
          break;
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortDirection === 'asc'
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }
    });

    return filtered;
  }, [variants, search, filterCategory, filterStock, sortField, sortDirection]);

  const handleSort = (field: SortField): void => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-indigo-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-indigo-600" />
    );
  };

  const toggleSelect = (variantId: string): void => {
    setSelectedVariants(prev => {
      const next = new Set(prev);
      if (next.has(variantId)) {
        next.delete(variantId);
      } else {
        next.add(variantId);
      }
      return next;
    });
  };

  const toggleSelectAll = (): void => {
    if (selectedVariants.size === filteredAndSorted.length) {
      setSelectedVariants(new Set());
    } else {
      setSelectedVariants(new Set(filteredAndSorted.map(v => v.id)));
    }
  };

  const handleInlineEdit = (variant: InventoryVariant): void => {
    setEditingVariant(variant.id);
    setEditStockValue(variant.stock);
  };

  const handleInlineSave = (variantId: string): void => {
    if (onStockUpdate) {
      onStockUpdate(variantId, editStockValue);
    }
    setEditingVariant(null);
    setEditStockValue(0);
  };

  const handleInlineCancel = (): void => {
    setEditingVariant(null);
    setEditStockValue(0);
  };

  const handleBulkAction = (action: 'add' | 'subtract' | 'set', value: number): void => {
    if (onBulkUpdate && selectedVariants.size > 0) {
      onBulkUpdate(Array.from(selectedVariants), action, value);
      setSelectedVariants(new Set());
      setShowBulkModal(false);
    }
  };

  const handleExport = (): void => {
    const csv = [
      ['Product', 'Category', 'SKU', 'Size', 'Stock', 'Low Stock Threshold', 'Price'].join(','),
      ...filteredAndSorted.map(v => [
        `"${v.productName}"`,
        `"${v.category}"`,
        v.sku,
        v.size,
        v.stock,
        v.lowStockThreshold,
        (v.price / 100).toFixed(2),
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products, SKU, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Stock</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {selectedVariants.size > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2"
            >
              Bulk Actions ({selectedVariants.size})
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center"
                  >
                    {selectedVariants.size === filteredAndSorted.length ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('productName')}
                    className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                  >
                    Product
                    {getSortIcon('productName')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('category')}
                    className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                  >
                    Category
                    {getSortIcon('category')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('sku')}
                    className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                  >
                    SKU
                    {getSortIcon('sku')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('size')}
                    className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                  >
                    Size
                    {getSortIcon('size')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('stock')}
                    className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                  >
                    Stock
                    {getSortIcon('stock')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('price')}
                    className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                  >
                    Price
                    {getSortIcon('price')}
                  </button>
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSorted.map((variant) => {
                const isSelected = selectedVariants.has(variant.id);
                const isEditing = editingVariant === variant.id;
                const isLowStock = variant.stock > 0 && variant.stock <= variant.lowStockThreshold;
                const isOutOfStock = variant.stock === 0;

                return (
                  <m.tr
                    key={variant.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "hover:bg-gray-50 transition-colors",
                      isSelected && "bg-indigo-50",
                      isOutOfStock && "bg-red-50",
                      isLowStock && !isOutOfStock && "bg-yellow-50"
                    )}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleSelect(variant.id)}
                        className="flex items-center"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {variant.imageUrl ? (
                          <img
                            src={variant.imageUrl}
                            alt={variant.productName}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{variant.productName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{variant.category}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{variant.sku}</td>
                    <td className="px-4 py-3 text-gray-600">{variant.size}</td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editStockValue}
                            onChange={(e) => setEditStockValue(parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleInlineSave(variant.id);
                              } else if (e.key === 'Escape') {
                                handleInlineCancel();
                              }
                            }}
                          />
                          <button
                            onClick={() => handleInlineSave(variant.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleInlineCancel}
                            className="text-red-600 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleInlineEdit(variant)}
                          className={cn(
                            "font-semibold hover:underline",
                            isOutOfStock && "text-red-600",
                            isLowStock && !isOutOfStock && "text-yellow-600",
                            !isLowStock && !isOutOfStock && "text-gray-900"
                          )}
                        >
                          {variant.stock}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {(variant.price / 100).toLocaleString('en-GH', {
                        style: 'currency',
                        currency: 'GHS',
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </m.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAndSorted.length === 0 && (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No inventory items found</p>
          </div>
        )}
      </div>

      {/* Bulk Actions Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Bulk Stock Update</h3>
            <p className="text-sm text-gray-600 mb-4">
              Update {selectedVariants.size} selected items
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleBulkAction('add', 10)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add 10 to all
              </button>
              <button
                onClick={() => handleBulkAction('subtract', 10)}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <Minus className="w-4 h-4" />
                Subtract 10 from all
              </button>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowBulkModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
