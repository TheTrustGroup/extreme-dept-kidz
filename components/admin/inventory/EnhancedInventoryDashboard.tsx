"use client";

import * as React from "react";
import { m } from "framer-motion";
import { Download, RefreshCw, Settings, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InventoryMetricsCards } from "./InventoryMetricsCards";
import { ReorderSuggestions, type ReorderSuggestion } from "./ReorderSuggestions";
import { StockHeatmap } from "./StockHeatmap";
import { cn } from "@/lib/utils";

interface InventoryAnalytics {
  totalValue: number;
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  turnoverRate: number;
  averageStockLevel: number;
  stockByCategory: Array<{
    category: string;
    value: number;
    items: number;
  }>;
  stockVelocity: Array<{
    variantId: string;
    productName: string;
    size: string;
    velocity: number;
    daysUntilOut: number | null;
  }>;
  reorderSuggestions: ReorderSuggestion[];
}

interface EnhancedInventoryDashboardProps {
  analytics?: InventoryAnalytics;
  loading?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  onItemClick?: (productId: string, variantId: string) => void;
}

export function EnhancedInventoryDashboard({
  analytics,
  loading = false,
  onRefresh,
  onExport,
  onItemClick,
}: EnhancedInventoryDashboardProps): JSX.Element {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'heatmap' | 'reorder'>('overview');

  // Transform analytics for heatmap
  const heatmapData = React.useMemo(() => {
    if (!analytics?.stockVelocity) return [];

    // Group by product
    const productMap = new Map<string, {
      productId: string;
      productName: string;
      variants: Array<{
        variantId: string;
        size: string;
        stock: number;
        lowStockThreshold: number;
      }>;
    }>();

    // This is a simplified version - in real implementation, we'd fetch full variant data
    // For now, we'll create a mock structure based on available data
    analytics.stockVelocity.forEach(item => {
      // Extract product ID from variant ID (simplified)
      const productId = item.variantId.split('-')[0] || item.variantId;
      
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          productId,
          productName: item.productName,
          variants: [],
        });
      }

      const product = productMap.get(productId)!;
      // We'd need to fetch actual stock levels - this is a placeholder
      product.variants.push({
        variantId: item.variantId,
        size: item.size,
        stock: 0, // Would be fetched from actual data
        lowStockThreshold: 10,
      });
    });

    return Array.from(productMap.values());
  }, [analytics]);

  const metrics = analytics ? {
    totalValue: analytics.totalValue,
    totalItems: analytics.totalItems,
    lowStockCount: analytics.lowStockCount,
    outOfStockCount: analytics.outOfStockCount,
    turnoverRate: analytics.turnoverRate,
    averageStockLevel: analytics.averageStockLevel,
  } : {
    totalValue: 0,
    totalItems: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    turnoverRate: 0,
    averageStockLevel: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Dashboard</h1>
          <p className="text-gray-600 text-sm">
            Comprehensive inventory overview and analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <InventoryMetricsCards metrics={metrics} loading={loading} />

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'heatmap', label: 'Stock Heatmap', icon: BarChart3 },
            { id: 'reorder', label: 'Reorder Suggestions', icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <m.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock by Category */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock by Category</h3>
              {analytics?.stockByCategory && analytics.stockByCategory.length > 0 ? (
                <div className="space-y-3">
                  {analytics.stockByCategory.map((category, index) => (
                    <m.div
                      key={category.category}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{category.category}</p>
                        <p className="text-sm text-gray-600">{category.items} items</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {(category.value / 100).toLocaleString('en-GH', {
                            style: 'currency',
                            currency: 'GHS',
                            minimumFractionDigits: 0,
                          })}
                        </p>
                      </div>
                    </m.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No category data available
                </div>
              )}
            </div>

            {/* Stock Velocity (Top 10) */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fast-Moving Items</h3>
              {analytics?.stockVelocity && analytics.stockVelocity.length > 0 ? (
                <div className="space-y-2">
                  {analytics.stockVelocity
                    .filter(v => v.velocity > 0)
                    .sort((a, b) => b.velocity - a.velocity)
                    .slice(0, 10)
                    .map((item, index) => (
                      <m.div
                        key={item.variantId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.productName}</p>
                          <p className="text-xs text-gray-600">Size {item.size}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold text-gray-900">
                            {item.velocity.toFixed(1)}/day
                          </p>
                          {item.daysUntilOut !== null && (
                            <p className="text-xs text-gray-600">
                              {item.daysUntilOut} days left
                            </p>
                          )}
                        </div>
                      </m.div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No velocity data available
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'heatmap' && (
          <StockHeatmap
            items={heatmapData}
            loading={loading}
            onItemClick={onItemClick}
          />
        )}

        {activeTab === 'reorder' && (
          <ReorderSuggestions
            suggestions={analytics?.reorderSuggestions || []}
            loading={loading}
          />
        )}
      </m.div>
    </div>
  );
}
