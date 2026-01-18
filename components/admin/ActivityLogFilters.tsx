"use client";

import * as React from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityLogFiltersProps {
  filters: {
    action: string;
    resource: string;
    adminUserId: string;
    startDate: string;
    endDate: string;
  };
  onFilterChange: (filters: ActivityLogFiltersProps['filters']) => void;
}

/**
 * Activity Log Filters Component
 * 
 * Filter activity logs by action, resource, user, and date range.
 */
export function ActivityLogFilters({
  filters,
  onFilterChange,
}: ActivityLogFiltersProps): JSX.Element {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleChange = (key: keyof typeof filters, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFilterChange({
      action: "",
      resource: "",
      adminUserId: "",
      startDate: "",
      endDate: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== "");

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-900">Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
              Active
            </span>
          )}
        </div>
        <span className="text-gray-500 text-sm">
          {isExpanded ? "Hide" : "Show"}
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action
              </label>
              <select
                value={filters.action}
                onChange={(e) => handleChange('action', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Actions</option>
                <option value="product.created">Product Created</option>
                <option value="product.updated">Product Updated</option>
                <option value="product.deleted">Product Deleted</option>
                <option value="order.status_changed">Order Status Changed</option>
                <option value="inventory.updated">Inventory Updated</option>
                <option value="category.created">Category Created</option>
                <option value="category.updated">Category Updated</option>
                <option value="admin_user.created">Admin User Created</option>
                <option value="admin_user.updated">Admin User Updated</option>
              </select>
            </div>

            {/* Resource Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resource Type
              </label>
              <select
                value={filters.resource}
                onChange={(e) => handleChange('resource', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Resources</option>
                <option value="Product">Product</option>
                <option value="Order">Order</option>
                <option value="ProductVariant">Product Variant</option>
                <option value="Category">Category</option>
                <option value="Collection">Collection</option>
                <option value="AdminUser">Admin User</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
