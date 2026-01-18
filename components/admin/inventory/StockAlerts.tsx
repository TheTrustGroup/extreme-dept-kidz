"use client";

import * as React from "react";
import { m } from "framer-motion";
import { Bell, AlertTriangle, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface StockAlert {
  id: string;
  type: 'lowStock' | 'outOfStock' | 'reorder';
  variantId: string;
  productName: string;
  size: string;
  currentStock: number;
  threshold?: number;
  message: string;
  createdAt: Date;
  acknowledged?: boolean;
}

interface StockAlertsProps {
  alerts: StockAlert[];
  loading?: boolean;
  onAcknowledge?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
}

export function StockAlerts({
  alerts,
  loading = false,
  onAcknowledge,
  onDismiss,
}: StockAlertsProps): JSX.Element {
  const [filter, setFilter] = React.useState<'all' | 'unacknowledged'>('unacknowledged');

  const filteredAlerts = React.useMemo(() => {
    if (filter === 'all') return alerts;
    return alerts.filter(a => !a.acknowledged);
  }, [alerts, filter]);

  const getAlertColor = (type: string): string => {
    switch (type) {
      case 'outOfStock':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'lowStock':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'reorder':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'outOfStock':
      case 'lowStock':
      case 'reorder':
        return AlertTriangle;
      default:
        return Bell;
    }
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

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Bell className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Stock Alerts</h3>
            <p className="text-sm text-gray-500">
              {unacknowledgedCount > 0
                ? `${unacknowledgedCount} unacknowledged alert${unacknowledgedCount !== 1 ? 's' : ''}`
                : 'All alerts acknowledged'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('unacknowledged')}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
              filter === 'unacknowledged'
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            Unacknowledged
          </button>
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
              filter === 'all'
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            All
          </button>
        </div>
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No alerts</p>
          <p className="text-sm text-gray-500 mt-1">
            {filter === 'unacknowledged'
              ? 'All alerts have been acknowledged'
              : 'No stock alerts at this time'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert, index) => {
            const Icon = getAlertIcon(alert.type);

            return (
              <m.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  getAlertColor(alert.type),
                  !alert.acknowledged && "ring-2 ring-offset-2 ring-indigo-500"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{alert.productName}</h4>
                        <span className="px-2 py-0.5 text-xs font-medium bg-white/50 rounded">
                          Size {alert.size}
                        </span>
                        {alert.acknowledged && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                            Acknowledged
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>Stock: {alert.currentStock}</span>
                        {alert.threshold && <span>Threshold: {alert.threshold}</span>}
                        <span>{format(new Date(alert.createdAt), 'MMM d, yyyy HH:mm')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!alert.acknowledged && onAcknowledge && (
                      <button
                        onClick={() => onAcknowledge(alert.id)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-white/50 rounded transition-colors"
                        title="Acknowledge"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    {onDismiss && (
                      <button
                        onClick={() => onDismiss(alert.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-white/50 rounded transition-colors"
                        title="Dismiss"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </m.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
