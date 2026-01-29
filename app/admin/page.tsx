"use client";

import * as React from "react";
import { m } from "framer-motion";
import { TrendingUp, Package, Users, DollarSign, AlertTriangle } from "lucide-react";
import { getDashboardStats } from "@/lib/admin-api";
import { formatPrice } from "@/lib/utils";
import { AdminH1, AdminH2, AdminH3, AdminBody, AdminBodySmall } from "@/components/admin/AdminTypography";
import { Skeleton } from "@/components/ui/Skeleton";
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
      className="admin-stat-card admin-section-md group"
    >
      <div className="admin-flex-md items-center justify-between mb-[var(--admin-space-4)]">
        <div className={cn(
          "p-[var(--admin-space-3)] rounded-xl transition-all duration-200",
          "bg-gradient-to-br from-navy-600 to-navy-800",
          "group-hover:scale-110 flex-shrink-0"
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div
          className={cn(
            "admin-flex-sm items-center text-sm font-semibold px-[var(--admin-space-2)] py-1 rounded-full flex-shrink-0",
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
      <AdminH3 className="text-2xl sm:text-3xl mb-1">{value}</AdminH3>
      <AdminBodySmall className="text-charcoal-600 font-medium">{title}</AdminBodySmall>
    </m.div>
  );
}

function DashboardSkeleton(): JSX.Element {
  return (
    <div className="space-y-[var(--space-6)]">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--space-6)]">
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
    <div className="admin-rhythm-lg">
      {/* Header */}
      <div className="admin-section admin-flex-md flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="admin-rhythm-sm">
          <AdminH1>Dashboard</AdminH1>
          <AdminBodySmall className="text-charcoal-600">Welcome back! Here&apos;s what&apos;s happening with your store.</AdminBodySmall>
        </div>
        <select className="admin-input px-[var(--admin-space-3)] sm:px-[var(--admin-space-4)] py-[var(--admin-space-2)] sm:py-2.5 rounded-lg text-xs sm:text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent w-full sm:w-auto flex-shrink-0">
          <option>Last 30 days</option>
          <option>Last 7 days</option>
          <option>Last 90 days</option>
          <option>This year</option>
        </select>
      </div>

      {/* Metric Cards */}
      <div className="admin-grid-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
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
        className="admin-card-strong admin-section-md mb-[var(--admin-space-5)] sm:mb-[var(--admin-space-7)]"
      >
        <div className="admin-flex-md items-center justify-between mb-[var(--admin-space-4)] sm:mb-[var(--admin-space-5)] flex-wrap gap-[var(--admin-space-2)]">
          <AdminH2 className="text-lg sm:text-xl">Revenue Over Time</AdminH2>
          <div className="admin-flex-sm">
            <button className="px-[var(--admin-space-3)] py-1.5 text-xs font-medium text-charcoal-700 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-white/80 transition-all duration-200 border border-cream-200/50 hover:border-cream-300/70 shadow-sm hover:shadow-md">
              Day
            </button>
            <button className="px-[var(--admin-space-3)] py-1.5 text-xs font-medium text-navy-700 bg-navy-50/80 backdrop-blur-sm rounded-lg border border-navy-200/50 shadow-sm">
              Week
            </button>
            <button className="px-[var(--admin-space-3)] py-1.5 text-xs font-medium text-charcoal-700 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-white/80 transition-all duration-200 border border-cream-200/50 hover:border-cream-300/70 shadow-sm hover:shadow-md">
              Month
            </button>
          </div>
        </div>
        <div className="h-48 sm:h-64 lg:h-80 flex items-center justify-center bg-gradient-to-br from-navy-50/50 to-navy-100/50 rounded-xl border border-cream-200/30 backdrop-blur-sm">
          <div className="text-center admin-rhythm-sm">
            <TrendingUp className="w-12 h-12 text-navy-400 mx-auto" />
            <AdminBody className="text-charcoal-600 font-medium">Chart will be implemented with Recharts</AdminBody>
          </div>
        </div>
      </m.div>

      {/* Two Column Layout */}
      <div className="admin-grid-md grid grid-cols-1 lg:grid-cols-2">
        {/* Top Products */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="admin-card admin-section-md mb-[var(--admin-space-5)] sm:mb-[var(--admin-space-7)]"
        >
          <AdminH2 className="text-lg sm:text-xl mb-[var(--admin-space-4)] sm:mb-[var(--admin-space-5)]">Top Products</AdminH2>
          <div className="admin-rhythm-sm">
            {stats.topProducts.map((product, idx) => (
              <m.div
                key={product.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                className="admin-flex-md items-center justify-between admin-section-sm bg-white/60 backdrop-blur-sm rounded-lg hover:bg-white/80 transition-all duration-200 group border border-cream-200/30 shadow-sm hover:shadow-md"
              >
                <div className="admin-flex-md items-center">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center text-white font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <AdminBody className="font-semibold text-charcoal-900">{product.name}</AdminBody>
                    <AdminBodySmall className="text-charcoal-600">{product.sold} sold</AdminBodySmall>
                  </div>
                </div>
                <AdminBody className="font-bold text-navy-600">{formatPrice(product.revenue * 100)}</AdminBody>
              </m.div>
            ))}
          </div>
        </m.div>

        {/* Recent Orders */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="admin-card admin-section-md"
        >
          <AdminH2 className="text-xl mb-[var(--admin-space-5)]">Recent Orders</AdminH2>
          <div className="admin-rhythm-sm">
            {stats.recentOrders.map((order, idx) => (
              <m.div
                key={order.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                className="admin-flex-md items-center justify-between admin-section-sm bg-cream-50 rounded-lg hover:bg-cream-100 transition-colors duration-200"
              >
                <div>
                  <AdminBody className="font-semibold text-charcoal-900">#{order.id}</AdminBody>
                  <AdminBodySmall className="text-charcoal-600">{order.customer}</AdminBodySmall>
                </div>
                <div className="text-right">
                  <AdminBody className="font-bold text-navy-600">{formatPrice(order.total * 100)}</AdminBody>
                  <span className={cn(
                    "inline-flex items-center px-[var(--admin-space-2)] py-1 rounded-full text-xs font-medium mt-[var(--admin-space-1)]",
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
          className="admin-card admin-section-md bg-gradient-to-r from-yellow-50/80 to-orange-50/80 backdrop-blur-sm border border-yellow-200/50"
        >
          <div className="admin-flex-md items-center justify-between mb-[var(--admin-space-5)]">
            <div className="admin-flex-md items-center">
              <div className="p-[var(--admin-space-2)] bg-yellow-100 rounded-lg flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="admin-rhythm-sm">
                <AdminH2 className="text-xl">
                  Low Stock Alert
                </AdminH2>
                <AdminBodySmall className="text-charcoal-600">{stats.lowStockItems.length} items need attention</AdminBodySmall>
              </div>
            </div>
            <button className="px-[var(--admin-space-3)] sm:px-[var(--admin-space-4)] py-[var(--admin-space-2)] text-xs sm:text-sm font-semibold text-navy-600 hover:text-navy-700 hover:bg-navy-50/80 backdrop-blur-sm rounded-lg transition-all duration-200 flex-shrink-0 border border-transparent hover:border-navy-200/50 shadow-sm hover:shadow-md">
              View All
            </button>
          </div>
          <div className="admin-rhythm-sm">
            {stats.lowStockItems.map((item, idx) => (
              <m.div
                key={`${item.id}-${item.size}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.05 }}
                className="admin-flex-md items-center justify-between admin-section-sm bg-white rounded-lg border border-yellow-100 hover:border-yellow-200 transition-colors duration-200"
              >
                <div className="admin-rhythm-sm">
                  <AdminBody className="font-semibold text-charcoal-900">{item.name}</AdminBody>
                  <AdminBodySmall className="text-charcoal-600">Size {item.size}</AdminBodySmall>
                </div>
                <div className="admin-flex-md items-center">
                  <AdminBody className="font-bold text-red-600">{item.stock} left</AdminBody>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
                </div>
              </m.div>
            ))}
          </div>
        </m.div>
      )}
    </div>
  );
}
