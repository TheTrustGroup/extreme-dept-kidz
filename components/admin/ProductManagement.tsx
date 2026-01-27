"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  inStock: boolean;
  category: {
    name: string;
  };
  variants: Array<{
    id: string;
    size: string;
    stock: number;
  }>;
}

export function ProductManagement(): JSX.Element {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts(): Promise<void> {
    try {
      const response = await fetch("/api/admin/products", {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Handle both apiSuccess format (data.products) and direct array format
        const products = data.data?.products || data.products || (Array.isArray(data) ? data : []);
        setProducts(products);
      } else {
        console.error("Failed to fetch products:", response.status, response.statusText);
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
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
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        credentials: 'include',
      });

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== id));
        showToast({
          type: "success",
          title: "Product Deleted",
          message: `${name} has been deleted successfully`,
        });
      } else {
        const data = await response.json().catch(() => ({}));
        showToast({
          type: "error",
          title: "Delete Failed",
          message: data.error || data.message || "Failed to delete product",
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to delete product:", error);
      }
      showToast({
        type: "error",
        title: "Delete Failed",
        message: "An error occurred while deleting the product",
      });
    }
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-charcoal-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-charcoal-900">Products</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-cream-200/50 mb-6">
        <div className="p-4 border-b border-cream-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-700 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-700 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-700 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-charcoal-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-cream-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-charcoal-600">
                    {searchTerm ? "No products found" : "No products yet. Add your first product!"}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const totalStock = product.variants.reduce(
                    (sum, v) => sum + v.stock,
                    0
                  );

                  return (
                    <tr key={product.id} className="hover:bg-cream-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-charcoal-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-charcoal-500">
                          {product.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-600">
                        {product.category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-charcoal-900">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-600">
                        {totalStock} units
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            product.inStock
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id, product.name)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
    </div>
  );
}
