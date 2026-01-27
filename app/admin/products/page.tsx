"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { Plus, Search, Filter, Edit, Trash2, Copy, Package } from "lucide-react";
import { getProducts } from "@/lib/admin-api";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { H1 } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

/**
 * Products Management Page
 * 
 * List, search, filter, and manage all products.
 */
export default function ProductsPage(): JSX.Element {
  const router = useRouter();
  const { showToast } = useToast();
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [totalPages, setTotalPages] = React.useState(1);
  const [selectedProducts, setSelectedProducts] = React.useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ id: string; name: string } | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = React.useState<boolean>(false);
  const [deleting, setDeleting] = React.useState(false);

  const loadProducts = React.useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await getProducts({ search, page, limit: 50 });
      setProducts(data.products);
      setTotalPages(data.totalPages);
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
  }, [search, page, showToast]);

  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    }
  };

  // Handle individual product delete
  const handleDelete = (id: string, name: string): void => {
    setDeleteConfirm({ id, name });
  };

  // Handle bulk delete
  const handleBulkDelete = (): void => {
    if (selectedProducts.size === 0) return;
    setBulkDeleteConfirm(true);
  };

  // Confirm individual delete
  const confirmDelete = async (): Promise<void> => {
    if (!deleteConfirm) return;

    const { id, name } = deleteConfirm;
    setDeleteConfirm(null);
    setDeleting(true);

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
        // Refresh product list
        await loadProducts();
        // Clear selection if deleted product was selected
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
          message: data.error || data.message || "Failed to delete product. Please try again.",
        });
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      showToast({
        type: "error",
        title: "Delete Failed",
        message: "An error occurred while deleting the product. Please try again.",
      });
    } finally {
      setDeleting(false);
    }
  };

  // Confirm bulk delete
  const confirmBulkDelete = async (): Promise<void> => {
    if (selectedProducts.size === 0) {
      setBulkDeleteConfirm(false);
      return;
    }

    setBulkDeleteConfirm(false);
    setDeleting(true);

    const productIds = Array.from(selectedProducts);
    const productNames = products
      .filter((p) => productIds.includes(p.id))
      .map((p) => p.name);

    let successCount = 0;
    let failCount = 0;

    // Delete products one by one
    for (const id of productIds) {
      try {
        const response = await fetch(`/api/admin/products/${id}`, {
          method: "DELETE",
          credentials: 'include',
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`Failed to delete product ${id}:`, error);
        failCount++;
      }
    }

    // Show result toast
    if (successCount > 0 && failCount === 0) {
      showToast({
        type: "success",
        title: "Products Deleted",
        message: `${successCount} product${successCount !== 1 ? 's' : ''} deleted successfully`,
      });
    } else if (successCount > 0 && failCount > 0) {
      showToast({
        type: "warning",
        title: "Partial Success",
        message: `${successCount} deleted, ${failCount} failed`,
      });
    } else {
      showToast({
        type: "error",
        title: "Delete Failed",
        message: `Failed to delete ${failCount} product${failCount !== 1 ? 's' : ''}`,
      });
    }

    // Refresh product list
    await loadProducts();
    // Clear selection
    setSelectedProducts(new Set());
    setDeleting(false);
  };

  // Handle change status (bulk)
  const handleChangeStatus = async (newStatus: boolean): Promise<void> => {
    if (selectedProducts.size === 0) return;

    setDeleting(true);
    const productIds = Array.from(selectedProducts);
    let successCount = 0;
    let failCount = 0;

    for (const id of productIds) {
      try {
        const product = products.find((p) => p.id === id);
        if (!product) continue;

        const response = await fetch(`/api/admin/products/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({
            inStock: newStatus,
          }),
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`Failed to update product ${id}:`, error);
        failCount++;
      }
    }

    if (successCount > 0) {
      showToast({
        type: "success",
        title: "Status Updated",
        message: `${successCount} product${successCount !== 1 ? 's' : ''} status updated`,
      });
      await loadProducts();
    }

    if (failCount > 0) {
      showToast({
        type: "error",
        title: "Update Failed",
        message: `Failed to update ${failCount} product${failCount !== 1 ? 's' : ''}`,
      });
    }

    setSelectedProducts(new Set());
    setDeleting(false);
  };

  // Handle export
  const handleExport = (): void => {
    if (selectedProducts.size === 0) {
      showToast({
        type: "info",
        title: "No Products Selected",
        message: "Please select products to export",
      });
      return;
    }

    const productsToExport = products.filter((p) => selectedProducts.has(p.id));
    const csv = [
      ["Name", "SKU", "Price", "Category", "Stock", "Status"].join(","),
      ...productsToExport.map((p) => {
        const totalStock = p.sizes.reduce((sum, size) => sum + (size.quantity || 0), 0);
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
      message: `${selectedProducts.size} product${selectedProducts.size !== 1 ? 's' : ''} exported`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <H1 className="text-gray-900 text-3xl font-bold mb-2">Products</H1>
          <p className="text-gray-600 text-sm">Manage your product catalog</p>
        </div>
        <Button variant="primary" asChild className="shadow-md hover:shadow-lg transition-shadow">
          <Link href="/admin/products/new">
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name, SKU, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </div>
        <Button variant="secondary" className="shadow-sm hover:shadow-md transition-shadow">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.size > 0 && (
        <m.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {selectedProducts.size}
            </div>
            <span className="text-sm font-semibold text-gray-900">
              product{selectedProducts.size !== 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              className="shadow-sm hover:shadow-md transition-all"
              onClick={() => {
                const allInStock = Array.from(selectedProducts).every(id => {
                  const product = products.find(p => p.id === id);
                  return product?.inStock;
                });
                handleChangeStatus(!allInStock);
              }}
              disabled={deleting}
            >
              Change Status
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="shadow-sm hover:shadow-md transition-all"
              onClick={handleExport}
              disabled={deleting}
            >
              Export
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all"
              onClick={handleBulkDelete}
              disabled={deleting}
            >
              Delete
            </Button>
          </div>
        </m.div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2 font-medium">No products found</p>
            <p className="text-gray-500 text-sm mb-6">Get started by creating your first product</p>
            <Button variant="primary" asChild className="shadow-md hover:shadow-lg">
              <Link href="/admin/products/new">Create Your First Product</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full admin-table">
              <thead>
                <tr>
                  <th className="px-4 py-4 text-left w-12">
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === products.length && products.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
                    />
                  </th>
                  <th className="px-4 py-4 text-left">Product</th>
                  <th className="px-4 py-4 text-left">SKU</th>
                  <th className="px-4 py-4 text-left">Price</th>
                  <th className="px-4 py-4 text-left">Stock</th>
                  <th className="px-4 py-4 text-left">Status</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, idx) => {
                  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
                  const totalStock = product.sizes.reduce((sum, size) => sum + (size.inStock ? 1 : 0), 0);
                  const isSelected = selectedProducts.has(product.id);

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
                          <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 group-hover:ring-2 group-hover:ring-indigo-200 transition-all">
                            {primaryImage ? (
                              <Image
                                src={primaryImage.url}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-200"
                                sizes="64px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{product.name}</p>
                            <p className="text-sm text-gray-600 line-clamp-1">{product.category.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600 font-mono">{product.sku || "—"}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-gray-900">{formatPrice(product.price)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-sm font-medium",
                            totalStock > 10 ? "text-green-600" : totalStock > 0 ? "text-yellow-600" : "text-red-600"
                          )}>
                            {totalStock} sizes
                          </span>
                          {totalStock <= 5 && totalStock > 0 && (
                            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                          )}
                          {totalStock === 0 && (
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
                          product.inStock 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        )}>
                          {product.inStock ? "Active" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            asChild
                            className="hover:bg-indigo-50 hover:text-indigo-600 transition-all"
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
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all"
                            title="Delete"
                            onClick={() => handleDelete(product.id, product.name)}
                            disabled={deleting}
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
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-6 py-4 shadow-sm">
          <p className="text-sm text-gray-600">
            Showing page <span className="font-semibold text-gray-900">{page}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
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

      {/* Delete Confirmation Dialogs */}
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
    </div>
  );
}
