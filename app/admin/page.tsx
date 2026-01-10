"use client";

import * as React from "react";
import { m } from "framer-motion";
import { TrendingUp, Package, Users, DollarSign, AlertTriangle } from "lucide-react";
import { getDashboardStats } from "@/lib/admin-api";
import { formatPrice } from "@/lib/utils";
import { H1 } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  trend: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
}

function MetricCard({ title, value, change, trend, icon: Icon }: MetricCardProps): JSX.Element {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "p-3 rounded-xl transition-all duration-200",
          "bg-gradient-to-br from-indigo-500 to-purple-600",
          "group-hover:scale-110"
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div
          className={cn(
            "flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full",
            trend === "up" 
              ? "text-green-700 bg-green-50" 
              : "text-red-700 bg-red-50"
          )}
        >
          <TrendingUp className={cn(
            "w-4 h-4",
            trend === "down" && "rotate-180"
          )} />
          {Math.abs(change)}%
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600 font-medium">{title}</p>
    </m.div>
  );
}

function DashboardSkeleton(): JSX.Element {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  );
}

/**
 * Admin Dashboard Page
 * 
 * Main dashboard with key metrics and analytics.
 */
export default function AdminDashboardPage(): JSX.Element {
  const [stats, setStats] = React.useState<Awaited<ReturnType<typeof getDashboardStats>> | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadStats(): Promise<void> {
      setLoading(true);
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading || !stats) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <H1 className="text-gray-900 text-3xl font-bold mb-2">Dashboard</H1>
          <p className="text-gray-600 text-sm">Welcome back! Here's what's happening with your store.</p>
        </div>
        <select className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md">
          <option>Last 30 days</option>
          <option>Last 7 days</option>
          <option>Last 90 days</option>
          <option>This year</option>
        </select>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Revenue"
          value={formatPrice(stats.revenue * 100)}
          change={stats.revenueChange}
          trend="up"
          icon={DollarSign}
        />
        <MetricCard
          title="Orders"
          value={stats.orders.toString()}
          change={stats.ordersChange}
          trend="up"
          icon={Package}
        />
        <MetricCard
          title="Customers"
          value={stats.customers.toString()}
          change={stats.customersChange}
          trend="up"
          icon={Users}
        />
        <MetricCard
          title="Average Order Value"
          value={formatPrice(stats.aov * 100)}
          change={stats.aovChange}
          trend="up"
          icon={TrendingUp}
        />
      </div>

      {/* Revenue Chart Placeholder */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Revenue Over Time</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Day
            </button>
            <button className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-lg">
              Week
            </button>
            <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Month
            </button>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-gray-100">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-indigo-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">Chart will be implemented with Recharts</p>
          </div>
        </div>
      </m.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Products</h2>
          <div className="space-y-2">
            {stats.topProducts.map((product, idx) => (
              <m.div
                key={product.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sold} sold</p>
                  </div>
                </div>
                <p className="font-bold text-indigo-600">{formatPrice(product.revenue * 100)}</p>
              </m.div>
            ))}
          </div>
        </m.div>

        {/* Recent Orders */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Orders</h2>
          <div className="space-y-2">
            {stats.recentOrders.map((order, idx) => (
              <m.div
                key={order.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div>
                  <p className="font-semibold text-gray-900">#{order.id}</p>
                  <p className="text-sm text-gray-600">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-600">{formatPrice(order.total * 100)}</p>
                  <span className={cn(
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1",
                    order.status === "pending" && "bg-yellow-100 text-yellow-800",
                    order.status === "shipped" && "bg-blue-100 text-blue-800",
                    order.status === "delivered" && "bg-green-100 text-green-800"
                  )}>
                    {order.status}
                  </span>
                </div>
              </m.div>
            ))}
          </div>
        </m.div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockItems.length > 0 && (
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Low Stock Alert
                </h2>
                <p className="text-sm text-gray-600">{stats.lowStockItems.length} items need attention</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors duration-200">
              View All
            </button>
          </div>
          <div className="space-y-2">
            {stats.lowStockItems.map((item, idx) => (
              <m.div
                key={`${item.id}-${item.size}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.05 }}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-yellow-100 hover:border-yellow-200 transition-colors duration-200"
              >
                <div>
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">Size {item.size}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-red-600">{item.stock} left</span>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </div>
              </m.div>
            ))}
          </div>
        </m.div>
      )}
    </div>
  );
}
