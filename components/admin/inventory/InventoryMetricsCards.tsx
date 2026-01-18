"use client";

import * as React from "react";
import { m } from "framer-motion";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  TrendingUp,
  BarChart3,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InventoryMetrics {
  totalValue: number;
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  turnoverRate: number;
  averageStockLevel: number;
}

interface InventoryMetricsCardsProps {
  metrics: InventoryMetrics;
  loading?: boolean;
}

export function InventoryMetricsCards({
  metrics,
  loading = false,
}: InventoryMetricsCardsProps): JSX.Element {
  const cards = [
    {
      title: "Total Inventory Value",
      value: metrics.totalValue,
      format: (val: number) =>
        (val / 100).toLocaleString('en-GH', {
          style: 'currency',
          currency: 'GHS',
          minimumFractionDigits: 0,
        }),
      icon: DollarSign,
      color: "from-indigo-500 to-purple-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700",
    },
    {
      title: "Total Items",
      value: metrics.totalItems,
      format: (val: number) => val.toLocaleString(),
      icon: Package,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      title: "Low Stock Items",
      value: metrics.lowStockCount,
      format: (val: number) => val.toLocaleString(),
      icon: AlertTriangle,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      highlight: metrics.lowStockCount > 0,
    },
    {
      title: "Out of Stock",
      value: metrics.outOfStockCount,
      format: (val: number) => val.toLocaleString(),
      icon: TrendingDown,
      color: "from-red-500 to-pink-600",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      highlight: metrics.outOfStockCount > 0,
    },
    {
      title: "Turnover Rate",
      value: metrics.turnoverRate,
      format: (val: number) => `${val.toFixed(1)}x`,
      icon: BarChart3,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      description: "Inventory turnover per period",
    },
    {
      title: "Avg Stock Level",
      value: metrics.averageStockLevel,
      format: (val: number) => Math.round(val).toLocaleString(),
      icon: TrendingUp,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      description: "Average units per variant",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
            <div className="h-8 bg-gray-200 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isHighlighted = card.highlight;

        return (
          <m.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={cn(
              "bg-white rounded-xl p-6 border shadow-sm transition-all duration-200 group",
              isHighlighted
                ? "border-red-200 bg-gradient-to-br from-red-50 to-orange-50"
                : "border-gray-200 hover:shadow-lg"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "p-3 rounded-xl transition-all duration-200",
                `bg-gradient-to-br ${card.color}`,
                "group-hover:scale-110"
              )}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              {isHighlighted && (
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {card.format(card.value)}
              </h3>
              <p className={cn(
                "text-sm font-medium",
                isHighlighted ? card.textColor : "text-gray-600"
              )}>
                {card.title}
              </p>
              {card.description && (
                <p className="text-xs text-gray-500 mt-1">{card.description}</p>
              )}
            </div>
          </m.div>
        );
      })}
    </div>
  );
}
