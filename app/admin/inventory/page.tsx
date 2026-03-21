"use client";

import * as React from "react";
import { EnhancedInventoryDashboard } from "@/components/admin/inventory/EnhancedInventoryDashboard";
import { InventoryTableWrapper } from "@/components/admin/inventory/InventoryTableWrapper";
import { getInventoryAnalytics, type InventoryAnalytics } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

export default function InventoryPage(): JSX.Element {
  const [analytics, setAnalytics] = React.useState<InventoryAnalytics | undefined>();
  const [loading, setLoading] = React.useState(true);
  const [activeView, setActiveView] = React.useState<'dashboard' | 'table'>('dashboard');

  React.useEffect(() => {
    async function loadAnalytics(): Promise<void> {
      setLoading(true);
      try {
        const data = await getInventoryAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to load inventory analytics:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const handleRefresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getInventoryAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to refresh inventory analytics:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExport = React.useCallback(() => {
    // Export functionality will be implemented
  }, []);

  const handleItemClick = React.useCallback((productId: string, variantId: string) => {
    // Navigate to product/variant detail or open edit modal
  }, []);

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveView('dashboard')}
            className={cn(
              "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              activeView === 'dashboard'
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveView('table')}
            className={cn(
              "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              activeView === 'table'
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            Inventory Table
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeView === 'dashboard' && (
        <EnhancedInventoryDashboard
          analytics={analytics}
          loading={loading}
          onRefresh={handleRefresh}
          onExport={handleExport}
          onItemClick={handleItemClick}
        />
      )}

      {activeView === 'table' && (
        <InventoryTableWrapper />
      )}
    </div>
  );
}
