"use client";

import * as React from "react";
import { m } from "framer-motion";
import { ArrowUp, ArrowDown, Package, ShoppingBag, RefreshCw, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/lib/config/api-base";

export interface StockHistoryEntry {
  id: string;
  variantId: string;
  productName: string;
  size: string;
  change: number;
  reason: string;
  notes: string | null;
  createdAt: Date;
  orderId: string | null;
}

interface StockHistoryProps {
  variantId: string;
  productName: string;
  size: string;
  loading?: boolean;
  onClose?: () => void;
}

export function StockHistory({
  variantId,
  productName,
  size,
  loading = false,
  onClose,
}: StockHistoryProps): JSX.Element {
  const [history, setHistory] = React.useState<StockHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = React.useState(true);

  React.useEffect(() => {
    async function loadHistory(): Promise<void> {
      setLoadingHistory(true);
      try {
        const response = await fetch(apiUrl(`/api/admin/inventory/history/${variantId}?limit=50`), {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error('Failed to fetch stock history');
        }

        const data = await response.json();
        setHistory(data.data || []);
      } catch (error) {
        console.error("Failed to load stock history:", error);
      } finally {
        setLoadingHistory(false);
      }
    }

    if (variantId) {
      loadHistory();
    }
  }, [variantId]);

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'sale':
        return ShoppingBag;
      case 'restock':
        return Package;
      case 'return':
        return RefreshCw;
      case 'adjustment':
        return FileText;
      default:
        return FileText;
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'sale':
        return 'bg-red-100 text-red-800';
      case 'restock':
        return 'bg-green-100 text-green-800';
      case 'return':
        return 'bg-blue-100 text-blue-800';
      case 'adjustment':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || loadingHistory) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Stock History</h3>
          <p className="text-sm text-gray-500">
            {productName} - Size {size}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No stock history available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry, index) => {
            const isPositive = entry.change > 0;
            const Icon = getReasonIcon(entry.reason);

            return (
              <m.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className={cn(
                  "p-2 rounded-lg",
                  isPositive ? "bg-green-100" : "bg-red-100"
                )}>
                  {isPositive ? (
                    <ArrowUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <ArrowDown className="w-5 h-5 text-red-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <span className={cn(
                      "px-2 py-0.5 text-xs font-medium rounded",
                      getReasonColor(entry.reason)
                    )}>
                      {entry.reason}
                    </span>
                    <span className={cn(
                      "text-sm font-semibold",
                      isPositive ? "text-green-600" : "text-red-600"
                    )}>
                      {isPositive ? '+' : ''}{entry.change}
                    </span>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-gray-600 mb-1">{entry.notes}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {format(new Date(entry.createdAt), 'PPp')}
                    {entry.orderId && ` • Order #${entry.orderId.slice(0, 8)}`}
                  </p>
                </div>
              </m.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
