"use client";

import * as React from "react";
import { m } from "framer-motion";
import { TrendingUp, Package, Users, DollarSign, AlertTriangle } from "lucide-react";
import { getDashboardStats } from "@/lib/admin-api";
import { formatPrice } from "@/lib/utils";
import { H1 } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";

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
      className="bg-cream-50 rounded-xl p-6 border border-cream-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-navy-50 rounded-lg">
          <Icon className="w-6 h-6 text-navy-900" />
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-semibold ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          {Math.abs(change)}%
        </div>
      </div>
      <h3 className="text-2xl font-bold text-charcoal-900 mb-1">{value}</h3>
      <p className="text-sm text-charcoal-600">{title}</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <H1 className="text-charcoal-900 text-3xl font-serif font-bold">Dashboard</H1>
        <select className="px-4 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500">
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
        className="bg-cream-50 rounded-xl p-6 border border-cream-200 shadow-sm"
      >
        <h2 className="text-xl font-bold text-charcoal-900 mb-4">Revenue Over Time</h2>
        <div className="h-64 flex items-center justify-center bg-cream-100 rounded-lg">
          <p className="text-charcoal-600">Chart will be implemented with Recharts</p>
        </div>
      </m.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-cream-50 rounded-xl p-6 border border-cream-200 shadow-sm"
        >
          <h2 className="text-xl font-bold text-charcoal-900 mb-4">Top Products</h2>
          <div className="space-y-3">
            {stats.topProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-cream-100 rounded-lg">
                <div>
                  <p className="font-semibold text-charcoal-900">{product.name}</p>
                  <p className="text-sm text-charcoal-600">{product.sold} sold</p>
                </div>
                <p className="font-bold text-navy-900">{formatPrice(product.revenue * 100)}</p>
              </div>
            ))}
          </div>
        </m.div>

        {/* Recent Orders */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-cream-50 rounded-xl p-6 border border-cream-200 shadow-sm"
        >
          <h2 className="text-xl font-bold text-charcoal-900 mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {stats.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-cream-100 rounded-lg">
                <div>
                  <p className="font-semibold text-charcoal-900">#{order.id}</p>
                  <p className="text-sm text-charcoal-600">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-navy-900">{formatPrice(order.total * 100)}</p>
                  <p className="text-xs text-charcoal-600 capitalize">{order.status}</p>
                </div>
              </div>
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
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h2 className="text-xl font-bold text-charcoal-900">
                Low Stock Alert ({stats.lowStockItems.length} items)
              </h2>
            </div>
            <button className="text-sm font-semibold text-navy-900 hover:text-navy-700">
              View All
            </button>
          </div>
          <div className="space-y-2">
            {stats.lowStockItems.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex items-center justify-between p-3 bg-cream-50 rounded-lg">
                <div>
                  <p className="font-semibold text-charcoal-900">{item.name}</p>
                  <p className="text-sm text-charcoal-600">Size {item.size}</p>
                </div>
                <p className="font-bold text-red-600">{item.stock} left</p>
              </div>
            ))}
          </div>
        </m.div>
      )}
    </div>
  );
}
