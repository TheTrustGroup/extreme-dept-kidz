"use client";

import * as React from "react";
import { m } from "framer-motion";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockHeatmapItem {
  productId: string;
  productName: string;
  variants: Array<{
    variantId: string;
    size: string;
    stock: number;
    lowStockThreshold: number;
  }>;
}

interface StockHeatmapProps {
  items: StockHeatmapItem[];
  loading?: boolean;
  onItemClick?: (productId: string, variantId: string) => void;
}

export function StockHeatmap({
  items,
  loading = false,
  onItemClick,
}: StockHeatmapProps): JSX.Element {
  // Get all unique sizes across all products
  const allSizes = React.useMemo(() => {
    const sizeSet = new Set<string>();
    items.forEach(item => {
      item.variants.forEach(v => sizeSet.add(v.size));
    });
    return Array.from(sizeSet).sort();
  }, [items]);

  // Calculate max stock for color intensity
  const maxStock = React.useMemo(() => {
    let max = 0;
    items.forEach(item => {
      item.variants.forEach(v => {
        if (v.stock > max) max = v.stock;
      });
    });
    return max || 1; // Avoid division by zero
  }, [items]);

  const getStockColor = (stock: number, threshold: number): string => {
    if (stock === 0) return "bg-red-500";
    if (stock <= threshold) return "bg-yellow-500";
    
    // Calculate intensity based on max stock
    const intensity = Math.min(stock / maxStock, 1);
    if (intensity > 0.7) return "bg-green-600";
    if (intensity > 0.4) return "bg-green-500";
    return "bg-green-400";
  };

  const getStockLabel = (stock: number, threshold: number): string => {
    if (stock === 0) return "Out";
    if (stock <= threshold) return "Low";
    return stock.toString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No inventory data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Stock Heatmap</h3>
          <p className="text-sm text-gray-500">Visual overview of all stock levels</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span>In Stock</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded" />
            <span>Low Stock</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span>Out of Stock</span>
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table w-full">
          <thead>
            <tr className="border-b border-cream-200">
              <th className="text-left sticky left-0 bg-white z-10">
                Product
              </th>
              {allSizes.map(size => (
                <th
                  key={size}
                  className="text-center"
                  style={{ minWidth: 'var(--admin-min-width-xs, 60px)' }}
                >
                  {size}
                </th>
              ))}
              <th className="text-center">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, itemIndex) => {
              const totalStock = item.variants.reduce((sum, v) => sum + v.stock, 0);
              
              return (
                <m.tr
                  key={item.productId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: itemIndex * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-gray-900 sticky left-0 bg-white z-10">
                    <div className="truncate" style={{ maxWidth: 'var(--admin-max-width-sm, 200px)' }} title={item.productName}>
                      {item.productName}
                    </div>
                  </td>
                  {allSizes.map(size => {
                    const variant = item.variants.find(v => v.size === size);
                    const stock = variant?.stock || 0;
                    const threshold = variant?.lowStockThreshold || 10;
                    const color = getStockColor(stock, threshold);
                    const label = getStockLabel(stock, threshold);

                    return (
                      <td
                        key={size}
                        className="text-center py-2 px-2"
                      >
                        {variant ? (
                          <m.div
                            className={cn(
                              "w-full h-8 rounded flex items-center justify-center text-xs font-medium text-white cursor-pointer transition-all hover:scale-110",
                              color
                            )}
                            onClick={() => onItemClick?.(item.productId, variant.variantId)}
                            title={`${item.productName} - Size ${size}: ${stock} units`}
                          >
                            {label}
                          </m.div>
                        ) : (
                          <div className="w-full h-8 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                            -
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="text-center py-3 px-4 font-semibold text-gray-900">
                    {totalStock}
                  </td>
                </m.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
