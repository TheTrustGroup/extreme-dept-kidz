"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Package, TrendingDown, DollarSign, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StockUpdateModal } from "./StockUpdateModal";
import { mockProducts } from "@/lib/mock-data";
import type { Product, ProductSize } from "@/types";

interface ProductWithStock extends Product {
  totalStock: number;
  lowStockSizes: ProductSize[];
  outOfStockSizes: ProductSize[];
}

export function InventoryManagement(): JSX.Element {
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    sizes: ProductSize[];
  } | null>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  function loadInventory(): void {
    // Transform mock products to include stock data
    const productsWithStock: ProductWithStock[] = mockProducts.map(product => {
      // Add quantities if not present (for demo purposes)
      const sizesWithQuantity: ProductSize[] = product.sizes.map(size => ({
        ...size,
        quantity: size.quantity ?? (size.inStock ? Math.floor(Math.random() * 20) + 1 : 0),
      }));

      const totalStock = sizesWithQuantity.reduce((sum, s) => sum + (s.quantity || 0), 0);
      const lowStockSizes = sizesWithQuantity.filter(s => (s.quantity || 0) > 0 && (s.quantity || 0) < 5);
      const outOfStockSizes = sizesWithQuantity.filter(s => (s.quantity || 0) === 0);

      return {
        ...product,
        sizes: sizesWithQuantity,
        totalStock,
        lowStockSizes,
        outOfStockSizes,
      };
    });

    setProducts(productsWithStock);
    setLoading(false);
  }

  function handleUpdateStock(productId: string, updatedSizes: ProductSize[]): void {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const totalStock = updatedSizes.reduce((sum, s) => sum + (s.quantity || 0), 0);
        const lowStockSizes = updatedSizes.filter(s => (s.quantity || 0) > 0 && (s.quantity || 0) < 5);
        const outOfStockSizes = updatedSizes.filter(s => (s.quantity || 0) === 0);

        return {
          ...p,
          sizes: updatedSizes,
          totalStock,
          lowStockSizes,
          outOfStockSizes,
        };
      }
      return p;
    }));
  }

  function handleExportReport(): void {
    const csv = [
      ['Product Name', 'SKU', 'Size', 'Stock', 'Status'].join(','),
      ...products.flatMap(p => 
        p.sizes.map(s => [
          `"${p.name}"`,
          p.sku || p.id,
          s.size,
          s.quantity || 0,
          (s.quantity || 0) === 0 ? 'Out of Stock' : (s.quantity || 0) < 5 ? 'Low Stock' : 'In Stock',
        ].join(','))
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  const filteredProducts = products.filter(p => {
    if (filter === 'low') return p.lowStockSizes.length > 0;
    if (filter === 'out') return p.outOfStockSizes.length > 0;
    return true;
  });

  const lowStockItems = products.filter(p => p.lowStockSizes.length > 0 || p.outOfStockSizes.length > 0);
  const outOfStockItems = products.filter(p => p.outOfStockSizes.length > 0);
  const totalValue = products.reduce((sum, p) => 
    sum + (p.price * p.sizes.reduce((s, sz) => s + (sz.quantity || 0), 0)), 0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Button
          onClick={handleExportReport}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Total Products</div>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold">{products.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Low Stock</div>
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold text-yellow-600">{lowStockItems.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Out of Stock</div>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-600">{outOfStockItems.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Total Value</div>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold">
            {(totalValue / 100).toLocaleString('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Button
          onClick={() => setFilter('all')}
          variant={filter === 'all' ? 'default' : 'outline'}
          className={filter === 'all' ? 'bg-black text-white hover:bg-gray-800' : ''}
        >
          All Items
        </Button>
        <Button
          onClick={() => setFilter('low')}
          variant={filter === 'low' ? 'default' : 'outline'}
          className={filter === 'low' ? 'bg-yellow-600 text-white hover:bg-yellow-700' : ''}
        >
          Low Stock
        </Button>
        <Button
          onClick={() => setFilter('out')}
          variant={filter === 'out' ? 'default' : 'outline'}
          className={filter === 'out' ? 'bg-red-600 text-white hover:bg-red-700' : ''}
        >
          Out of Stock
        </Button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock by Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const hasLowStock = product.lowStockSizes.length > 0;
                const isOutOfStock = product.outOfStockSizes.length > 0 && product.totalStock === 0;

                return (
                  <tr 
                    key={product.id} 
                    className={`hover:bg-gray-50 ${
                      isOutOfStock ? 'bg-red-50' : hasLowStock ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          {product.images[0] ? (
                            <img 
                              src={product.images[0].url} 
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.sku || product.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {(product.price / 100).toFixed(0)} GHS
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {product.sizes.map((size) => (
                          <span
                            key={size.size}
                            className={`px-2 py-1 text-xs rounded font-medium ${
                              (size.quantity || 0) === 0
                                ? 'bg-red-100 text-red-700'
                                : (size.quantity || 0) < 5
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {size.size}: {size.quantity || 0}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {product.totalStock}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          isOutOfStock
                            ? 'bg-red-100 text-red-700'
                            : hasLowStock
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {isOutOfStock ? 'Out of Stock' : hasLowStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProduct({
                          id: product.id,
                          name: product.name,
                          sizes: product.sizes,
                        })}
                      >
                        Update Stock
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Update Modal */}
      {selectedProduct && (
        <StockUpdateModal
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          sizes={selectedProduct.sizes}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdate={handleUpdateStock}
        />
      )}
    </div>
  );
}
