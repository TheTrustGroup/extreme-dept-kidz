"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Package, TrendingDown, DollarSign, Download, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StockUpdateModal } from "./StockUpdateModal";
import { mockProducts } from "@/lib/mock-data";
import type { Product, ProductSize } from "@/types";
import { DEFAULT_PRODUCT_SIZES } from "@/lib/constants/product-sizes";
import { offlineSyncService } from "@/lib/services/offline-sync";

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
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadInventory();

    // Subscribe to online/offline status
    const unsubscribeStatus = offlineSyncService.onStatusChange((online) => {
      setIsOnline(online);
    });

    // Subscribe to pending sync count
    const unsubscribeSync = offlineSyncService.onPendingCountChange((count) => {
      setPendingSyncCount(count);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeSync();
    };
  }, []);

  function loadInventory(): void {
    // Transform mock products to include stock data
    const productsWithStock: ProductWithStock[] = mockProducts.map(product => {
      // Ensure all default sizes are present, even if product doesn't have them
      const existingSizesMap = new Map<string, ProductSize>();
      product.sizes.forEach(size => {
        existingSizesMap.set(size.size, size);
      });

      // Create sizes array with all default sizes, using existing data or defaults
      const sizesWithQuantity: ProductSize[] = DEFAULT_PRODUCT_SIZES.map(size => {
        const existingSize = existingSizesMap.get(size);
        if (existingSize) {
          return {
            ...existingSize,
            quantity: existingSize.quantity ?? (existingSize.inStock ? 1 : 0),
          };
        }
        // If size doesn't exist in product, create it with 0 quantity
        return {
          size,
          inStock: false,
          quantity: 0,
        };
      });

      // Use consistent quantities based on product ID for demo purposes
      const productHash = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const finalSizes = sizesWithQuantity.map((size, index) => {
        const currentQuantity = size.quantity ?? 0;
        const demoQuantity = (productHash % 20) + index * 3 + 1;
        return {
          ...size,
          quantity: currentQuantity > 0 ? currentQuantity : demoQuantity,
          inStock: currentQuantity > 0 || demoQuantity > 0,
        };
      });

      const totalStock = finalSizes.reduce((sum, s) => sum + (s.quantity || 0), 0);
      const lowStockSizes = finalSizes.filter(s => (s.quantity || 0) > 0 && (s.quantity || 0) < 5);
      const outOfStockSizes = finalSizes.filter(s => (s.quantity || 0) === 0);

      return {
        ...product,
        sizes: finalSizes,
        totalStock,
        lowStockSizes,
        outOfStockSizes,
      };
    });

    setProducts(productsWithStock);
    setLoading(false);
  }

  async function handleUpdateStock(productId: string, updatedSizes: ProductSize[]): Promise<void> {
    // Update local state immediately for instant UI feedback
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

    // Get product name for queue
    const product = products.find(p => p.id === productId);
    const productName = product?.name || 'Unknown Product';

    // Queue the update (works offline or online)
    offlineSyncService.queueUpdate(
      productId,
      productName,
      updatedSizes.map(s => ({
        size: s.size,
        quantity: s.quantity || 0,
        inStock: s.inStock,
      }))
    );

    // If online, try to sync immediately
    if (isOnline) {
      offlineSyncService.attemptSync();
    }
  }

  async function handleManualSync(): Promise<void> {
    setIsSyncing(true);
    try {
      const result = await offlineSyncService.manualSync();
      if (result.success > 0) {
        // Reload inventory to reflect synced changes
        loadInventory();
        // Show success message
        console.log(`✅ Successfully synced ${result.success} update(s)`);
      }
      if (result.failed > 0) {
        console.warn(`⚠️ ${result.failed} update(s) failed to sync`);
      }
      if (result.success === 0 && result.failed === 0) {
        console.log('ℹ️ No pending updates to sync');
      }
    } catch (error) {
      console.error('Manual sync failed:', error);
      // Don't show alert - error is logged, user can see in console if needed
    } finally {
      setIsSyncing(false);
    }
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Inventory Management</h1>
          {/* Offline/Online Status Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
            {isOnline ? (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <Wifi className="w-4 h-4 flex-shrink-0" />
                <span>Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-orange-600 text-sm">
                <WifiOff className="w-4 h-4 flex-shrink-0" />
                <span className="break-words">Offline - Changes will sync when connection is restored</span>
              </div>
            )}
            {pendingSyncCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 sm:ml-4">
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {pendingSyncCount} pending {pendingSyncCount === 1 ? 'update' : 'updates'}
                </span>
                {isOnline && (
                  <Button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    size="sm"
                    variant="ghost"
                    className="flex items-center gap-1 text-sm whitespace-nowrap"
                  >
                    <RefreshCw className={`w-4 h-4 flex-shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        <Button
          onClick={handleExportReport}
          className="flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export Report</span>
          <span className="sm:hidden">Export</span>
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
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
        <Button
          onClick={() => setFilter('all')}
          variant={filter === 'all' ? 'primary' : 'ghost'}
          size="sm"
          className={filter === 'all' ? 'bg-black text-white hover:bg-gray-800' : ''}
        >
          All Items
        </Button>
        <Button
          onClick={() => setFilter('low')}
          variant={filter === 'low' ? 'primary' : 'ghost'}
          size="sm"
          className={filter === 'low' ? 'bg-yellow-600 text-white hover:bg-yellow-700' : ''}
        >
          Low Stock
        </Button>
        <Button
          onClick={() => setFilter('out')}
          variant={filter === 'out' ? 'primary' : 'ghost'}
          size="sm"
          className={filter === 'out' ? 'bg-red-600 text-white hover:bg-red-700' : ''}
        >
          Out of Stock
        </Button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    SKU
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Price
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock by Size
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Total
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {product.images[0] ? (
                            <img 
                              src={product.images[0].url} 
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{product.name}</div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate">{product.category.name}</div>
                          <div className="text-xs text-gray-600 sm:hidden mt-1">SKU: {product.sku || product.id}</div>
                          <div className="text-xs text-gray-600 md:hidden mt-1">{(product.price / 100).toFixed(0)} GHS</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">
                      {product.sku || product.id}
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900 hidden md:table-cell">
                      {(product.price / 100).toFixed(0)} GHS
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex gap-1 sm:gap-2 flex-wrap">
                        {product.sizes.map((size) => (
                          <span
                            key={size.size}
                            className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded font-medium whitespace-nowrap ${
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
                    <td className="px-3 sm:px-6 py-4 text-sm font-semibold text-gray-900 hidden lg:table-cell">
                      {product.totalStock}
                    </td>
                    <td className="px-3 sm:px-6 py-4 hidden md:table-cell">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium whitespace-nowrap ${
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
                    <td className="px-3 sm:px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProduct({
                          id: product.id,
                          name: product.name,
                          sizes: product.sizes,
                        })}
                        className="text-xs sm:text-sm"
                      >
                        <span className="hidden sm:inline">Update Stock</span>
                        <span className="sm:hidden">Update</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
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
