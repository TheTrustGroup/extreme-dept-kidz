"use client";

import * as React from "react";
import { m } from "framer-motion";
import { AlertCircle, Package, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReorderSuggestion {
  variantId: string;
  productName: string;
  size: string;
  currentStock: number;
  reorderPoint: number;
  suggestedOrder: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
}

interface ReorderSuggestionsProps {
  suggestions: ReorderSuggestion[];
  loading?: boolean;
  onReorder?: (suggestion: ReorderSuggestion) => void;
}

export function ReorderSuggestions({
  suggestions,
  loading = false,
  onReorder,
}: ReorderSuggestionsProps): JSX.Element {
  const urgencyConfig = {
    critical: {
      color: "bg-red-100 text-red-800 border-red-300",
      icon: AlertCircle,
      label: "Critical",
    },
    high: {
      color: "bg-orange-100 text-orange-800 border-orange-300",
      icon: AlertCircle,
      label: "High",
    },
    medium: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: TrendingUp,
      label: "Medium",
    },
    low: {
      color: "bg-blue-100 text-blue-800 border-blue-300",
      icon: Package,
      label: "Low",
    },
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Reorder Suggestions</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-600 font-medium">All items are well stocked!</p>
          <p className="text-sm text-gray-500 mt-1">No reorder suggestions at this time.</p>
        </div>
      </div>
    );
  }

  // Group by urgency
  const grouped = suggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.urgency]) {
      acc[suggestion.urgency] = [];
    }
    acc[suggestion.urgency].push(suggestion);
    return acc;
  }, {} as Record<string, ReorderSuggestion[]>);

  // Sort groups by urgency order
  const urgencyOrder = ['critical', 'high', 'medium', 'low'];
  const sortedGroups = urgencyOrder
    .filter(urgency => grouped[urgency])
    .map(urgency => ({
      urgency: urgency as ReorderSuggestion['urgency'],
      items: grouped[urgency],
    }));

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Package className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Reorder Suggestions</h3>
            <p className="text-sm text-gray-500">{suggestions.length} items need attention</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sortedGroups.map((group) => {
          const config = urgencyConfig[group.urgency];
          const Icon = config.icon;

          return (
            <div key={group.urgency} className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {config.label} Priority ({group.items.length})
                </span>
              </div>
              {group.items.map((suggestion, index) => (
                <m.div
                  key={suggestion.variantId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
                    config.color
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{suggestion.productName}</h4>
                        <span className="px-2 py-0.5 text-xs font-medium bg-white/50 rounded">
                          Size {suggestion.size}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Current Stock</p>
                          <p className="font-semibold text-gray-900">{suggestion.currentStock}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Reorder Point</p>
                          <p className="font-semibold text-gray-900">{suggestion.reorderPoint}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Suggested Order</p>
                          <p className="font-semibold text-indigo-600">{suggestion.suggestedOrder}</p>
                        </div>
                      </div>
                    </div>
                    {onReorder && (
                      <button
                        onClick={() => onReorder(suggestion)}
                        className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                      >
                        Reorder
                      </button>
                    )}
                  </div>
                </m.div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
