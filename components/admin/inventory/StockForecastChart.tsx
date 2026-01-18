"use client";

import * as React from "react";
import { m } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle, Calendar, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface StockForecast {
  variantId: string;
  productName: string;
  size: string;
  currentStock: number;
  velocity: number; // units per day
  daysUntilOut: number | null;
  predictedOutDate: Date | null;
  confidence: 'high' | 'medium' | 'low';
}

interface StockForecastChartProps {
  forecasts: StockForecast[];
  loading?: boolean;
  onVariantClick?: (variantId: string) => void;
}

export function StockForecastChart({
  forecasts,
  loading = false,
  onVariantClick,
}: StockForecastChartProps): JSX.Element {
  const [filter, setFilter] = React.useState<'all' | 'critical' | 'warning' | 'safe'>('all');

  // Filter forecasts
  const filteredForecasts = React.useMemo(() => {
    if (filter === 'all') return forecasts;
    
    return forecasts.filter(f => {
      if (filter === 'critical') {
        return f.daysUntilOut !== null && f.daysUntilOut <= 7;
      }
      if (filter === 'warning') {
        return f.daysUntilOut !== null && f.daysUntilOut > 7 && f.daysUntilOut <= 30;
      }
      if (filter === 'safe') {
        return f.daysUntilOut === null || f.daysUntilOut > 30;
      }
      return true;
    });
  }, [forecasts, filter]);

  // Sort by urgency
  const sortedForecasts = React.useMemo(() => {
    return [...filteredForecasts].sort((a, b) => {
      // Critical first (daysUntilOut <= 7)
      if (a.daysUntilOut !== null && a.daysUntilOut <= 7) return -1;
      if (b.daysUntilOut !== null && b.daysUntilOut <= 7) return 1;
      
      // Then by days until out
      if (a.daysUntilOut === null) return 1;
      if (b.daysUntilOut === null) return -1;
      
      return a.daysUntilOut - b.daysUntilOut;
    });
  }, [filteredForecasts]);

  const getStatusColor = (forecast: StockForecast): string => {
    if (forecast.daysUntilOut === null) return "bg-green-100 text-green-800 border-green-200";
    if (forecast.daysUntilOut <= 7) return "bg-red-100 text-red-800 border-red-200";
    if (forecast.daysUntilOut <= 30) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getStatusLabel = (forecast: StockForecast): string => {
    if (forecast.daysUntilOut === null) return "Safe";
    if (forecast.daysUntilOut <= 7) return "Critical";
    if (forecast.daysUntilOut <= 30) return "Warning";
    return "Safe";
  };

  const getConfidenceColor = (confidence: string): string => {
    switch (confidence) {
      case 'high':
        return "bg-green-500";
      case 'medium':
        return "bg-yellow-500";
      case 'low':
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  if (loading) {
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

  if (forecasts.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No forecast data available</p>
          <p className="text-sm text-gray-500 mt-1">Stock forecasting requires sales history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Stock Forecast</h3>
          <p className="text-sm text-gray-500">Predictions based on sales velocity</p>
        </div>
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'critical', label: 'Critical' },
            { id: 'warning', label: 'Warning' },
            { id: 'safe', label: 'Safe' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as typeof filter)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                filter === f.id
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {sortedForecasts.map((forecast, index) => (
          <m.div
            key={forecast.variantId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onVariantClick?.(forecast.variantId)}
            className={cn(
              "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
              getStatusColor(forecast)
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900 truncate">{forecast.productName}</h4>
                  <span className="px-2 py-0.5 text-xs font-medium bg-white/50 rounded">
                    Size {forecast.size}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded",
                    getStatusColor(forecast)
                  )}>
                    {getStatusLabel(forecast)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs">Current Stock</p>
                    <p className="font-semibold text-gray-900">{forecast.currentStock}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Velocity</p>
                    <p className="font-semibold text-gray-900">
                      {forecast.velocity.toFixed(1)}/day
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Days Until Out</p>
                    <p className="font-semibold text-gray-900">
                      {forecast.daysUntilOut !== null ? (
                        <span className={cn(
                          forecast.daysUntilOut <= 7 && "text-red-600",
                          forecast.daysUntilOut > 7 && forecast.daysUntilOut <= 30 && "text-yellow-600"
                        )}>
                          {forecast.daysUntilOut} days
                        </span>
                      ) : (
                        <span className="text-green-600">∞</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Predicted Date</p>
                    <p className="font-semibold text-gray-900">
                      {forecast.predictedOutDate ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(forecast.predictedOutDate, 'MMM d, yyyy')}
                        </span>
                      ) : (
                        <span className="text-green-600">N/A</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="ml-4 flex flex-col items-end gap-2">
                <div className="flex items-center gap-1">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    getConfidenceColor(forecast.confidence)
                  )} />
                  <span className="text-xs text-gray-600 capitalize">{forecast.confidence}</span>
                </div>
                {forecast.daysUntilOut !== null && forecast.daysUntilOut <= 7 && (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {forecast.daysUntilOut !== null && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Stock depletion timeline</span>
                  <span>{forecast.daysUntilOut} days remaining</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all",
                      forecast.daysUntilOut <= 7 && "bg-red-500",
                      forecast.daysUntilOut > 7 && forecast.daysUntilOut <= 30 && "bg-yellow-500",
                      forecast.daysUntilOut > 30 && "bg-green-500"
                    )}
                    style={{
                      width: `${Math.min((forecast.daysUntilOut / 90) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </m.div>
        ))}
      </div>

      {sortedForecasts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No items match the selected filter</p>
        </div>
      )}
    </div>
  );
}
