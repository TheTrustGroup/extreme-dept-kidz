"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { m } from "framer-motion";
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Copy } from "lucide-react";
import { getProducts } from "@/lib/admin-api";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { H1 } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types";

/**
 * Products Management Page
 * 
 * List, search, filter, and manage all products.
 */
export default function ProductsPage(): JSX.Element {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [totalPages, setTotalPages] = React.useState(1);
  const [selectedProducts, setSelectedProducts] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    async function loadProducts(): Promise<void> {
      setLoading(true);
      try {
        const data = await getProducts({ search, page, limit: 50 });
        setProducts(data.products);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [search, page]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <H1 className="text-charcoal-900 text-3xl font-serif font-bold">Products</H1>
        <Button variant="primary" asChild>
          <Link href="/admin/products/new">
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
        <Button variant="secondary">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.size > 0 && (
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-navy-50 border border-navy-200 rounded-lg p-4 flex items-center justify-between"
        >
          <span className="text-sm font-semibold text-navy-900">
            {selectedProducts.size} product{selectedProducts.size !== 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              Change Status
            </Button>
            <Button variant="secondary" size="sm">
              Export
            </Button>
            <Button variant="danger" size="sm">
              Delete
            </Button>
          </div>
        </m.div>
      )}

      {/* Products Table */}
      <div className="bg-cream-50 rounded-xl border border-cream-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-charcoal-600 mb-4">No products found</p>
            <Button variant="primary" asChild>
              <Link href="/admin/products/new">Create Your First Product</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-100 border-b border-cream-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === products.length && products.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-navy-900 border-cream-300 rounded focus:ring-navy-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900">SKU</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-charcoal-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {products.map((product) => {
                  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
                  const totalStock = product.sizes.reduce((sum, size) => sum + (size.inStock ? 1 : 0), 0);
                  const isSelected = selectedProducts.has(product.id);

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-cream-100 transition-colors ${isSelected ? "bg-navy-50" : ""}`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(product.id)}
                          className="w-4 h-4 text-navy-900 border-cream-300 rounded focus:ring-navy-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                            {primaryImage && (
                              <Image
                                src={primaryImage.url}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-charcoal-900">{product.name}</p>
                            <p className="text-sm text-charcoal-600 line-clamp-1">{product.category.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-charcoal-600">{product.sku || "—"}</td>
                      <td className="px-4 py-4 font-semibold text-charcoal-900">{formatPrice(product.price)}</td>
                      <td className="px-4 py-4">
                        <span className={`text-sm font-medium ${totalStock > 10 ? "text-green-600" : totalStock > 0 ? "text-yellow-600" : "text-red-600"}`}>
                          {totalStock} sizes
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {product.inStock ? "Active" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/products/${product.id}`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-charcoal-600">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
