"use client";

import * as React from "react";
import { m } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp, Package, Users, DollarSign, AlertTriangle, RefreshCw, Download, Plus, ShoppingBag, Eye, Calendar, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { AdminH1, AdminH2, AdminH3, AdminBody, AdminBodySmall } from "@/components/admin/AdminTypography";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/button";
import { RevenueChart } from "@/components/admin/analytics/RevenueChart";
import { OrdersStatusChart } from "@/components/admin/charts/OrdersStatusChart";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface DashboardData {
  metrics: {
    revenue: number;
    revenueChange: number;
    orders: number;
    ordersChange: number;
    products: number;
    lowStockCount: number;
    customers: number;
    newCustomers: number;
  };
  charts: {
    salesData: Array<{ date: string; revenue: number }>;
    ordersByStatus: Array<{ name: string; value: number; color: string }>;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customer: string;
    total: number;
    status: string;
    date: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sold: number;
    revenue: number;
    image?: string;
  }>;
  dateRange: {
    start: string;
    end: string;
    period: string;
  };
}

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  trend: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

function MetricCard({ title, value, change, trend, icon: Icon, badge }: MetricCardProps): JSX.Element {
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
        <div className="flex items-center gap-2">
          {badge !== undefined && (
            <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
              {badge}
            </span>
          )}
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
            {Math.abs(change).toFixed(1)}%
          </div>
        </div>
      </div>
      <AdminH3 className="text-2xl sm:text-3xl mb-1">{value}</AdminH3>
      <AdminBodySmall className="text-charcoal-600 font-medium">{title}</AdminBodySmall>
    </m.div>
  );
}

function DashboardSkeleton(): JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-64" />
        <Skeleton className="h-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

type DateRangePeriod = 'today' | '7days' | '30days' | 'custom';

/**
 * Admin Dashboard Page
 * 
 * Main dashboard with key metrics and analytics.
 */
export default function AdminDashboardPage(): JSX.Element {
  const router = useRouter();
  const [dashboardData, setDashboardData] = React.useState<DashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [datePeriod, setDatePeriod] = React.useState<DateRangePeriod>('30days');
  const [showCustomDatePicker, setShowCustomDatePicker] = React.useState(false);
  const [customStartDate, setCustomStartDate] = React.useState('');
  const [customEndDate, setCustomEndDate] = React.useState('');

  const fetchDashboardData = React.useCallback(async (period: DateRangePeriod = datePeriod, startDate?: string, endDate?: string): Promise<void> => {
    try {
      const params = new URLSearchParams({ period });
      if (startDate && endDate) {
        params.set('startDate', startDate);
        params.set('endDate', endDate);
      }

      const response = await fetch(`/api/admin/dashboard?${params.toString()}`, {
        credentials: 'include',
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data || data);
      } else {
        console.error("Failed to fetch dashboard data:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  }, [datePeriod]);

  React.useEffect(() => {
    const loadData = async (): Promise<void> => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
    };
    loadData();
  }, [fetchDashboardData]);

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleDateRangeChange = (period: DateRangePeriod): void => {
    setDatePeriod(period);
    if (period === 'custom') {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
      fetchDashboardData(period);
    }
  };

  const handleCustomDateApply = (): void => {
    if (customStartDate && customEndDate) {
      fetchDashboardData('custom', customStartDate, customEndDate);
      setShowCustomDatePicker(false);
    }
  };

  const handleExportDashboard = (): void => {
    if (!dashboardData) return;

    const exportData = {
      metrics: dashboardData.metrics,
      dateRange: dashboardData.dateRange,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get pending orders count
  const pendingOrdersCount = React.useMemo(() => {
    if (!dashboardData) return 0;
    const pending = dashboardData.charts.ordersByStatus.find(s => s.name === 'Pending');
    return pending?.value || 0;
  }, [dashboardData]);

  if (loading || !dashboardData) {
    return <DashboardSkeleton />;
  }

  const { metrics, charts, recentOrders, topProducts } = dashboardData;

  return (
    <div className="admin-rhythm-lg">
      {/* Header */}
      <div className="admin-section admin-flex-md flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="admin-rhythm-sm">
          <AdminH1>Dashboard</AdminH1>
          <AdminBodySmall className="text-charcoal-600">Welcome back! Here&apos;s what&apos;s happening with your store.</AdminBodySmall>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date Range Selector */}
          <div className="relative">
            <select
              value={datePeriod}
              onChange={(e) => handleDateRangeChange(e.target.value as DateRangePeriod)}
              className="admin-input px-[var(--admin-space-3)] sm:px-[var(--admin-space-4)] py-[var(--admin-space-2)] sm:py-2.5 rounded-lg text-xs sm:text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent w-full sm:w-auto flex-shrink-0"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="custom">Custom Range</option>
            </select>
            {showCustomDatePicker && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 min-w-[300px]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">Select Date Range</span>
                  <button
                    onClick={() => setShowCustomDatePicker(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <Button
                    onClick={handleCustomDateApply}
                    disabled={!customStartDate || !customEndDate}
                    size="sm"
                    className="w-full"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </div>
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-charcoal-600 hover:text-navy-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Refresh dashboard"
          >
            <RefreshCw className={cn("w-5 h-5", refreshing && "animate-spin")} />
          </button>
          {/* Export Button */}
          <button
            onClick={handleExportDashboard}
            className="p-2 text-charcoal-600 hover:text-navy-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Export dashboard data"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="admin-grid-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatPrice(metrics.revenue)}
          change={metrics.revenueChange}
          trend={metrics.revenueChange >= 0 ? "up" : "down"}
          icon={DollarSign}
        />
        <MetricCard
          title="Total Orders"
          value={metrics.orders.toString()}
          change={metrics.ordersChange}
          trend={metrics.ordersChange >= 0 ? "up" : "down"}
          icon={Package}
        />
        <MetricCard
          title="Total Products"
          value={metrics.products.toString()}
          change={0}
          trend="up"
          icon={Package}
          badge={metrics.lowStockCount > 0 ? `${metrics.lowStockCount} low stock` : undefined}
        />
        <MetricCard
          title="Total Customers"
          value={metrics.customers.toString()}
          change={0}
          trend="up"
          icon={Users}
          badge={metrics.newCustomers > 0 ? `+${metrics.newCustomers} new` : undefined}
        />
      </div>

      {/* Charts Section */}
      <div className="admin-grid-md grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 admin-card-strong admin-section-md"
        >
          <AdminH2 className="text-lg sm:text-xl mb-4">Sales (Last 30 Days)</AdminH2>
          <RevenueChart data={charts.salesData} loading={loading} />
        </m.div>

        {/* Orders by Status Chart */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="admin-card-strong admin-section-md"
        >
          <OrdersStatusChart data={charts.ordersByStatus} loading={loading} />
        </m.div>
      </div>

      {/* Row 3: Recent Orders and Quick Actions */}
      <div className="admin-grid-md grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 admin-card admin-section-md"
        >
          <div className="flex items-center justify-between mb-4">
            <AdminH2 className="text-lg sm:text-xl">Recent Orders</AdminH2>
            <Link
              href="/admin/orders"
              className="text-sm text-navy-600 hover:text-navy-700 font-medium"
            >
              View all orders →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">
                      No recent orders
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        #{order.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{order.customer}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
                          order.status === "PENDING" && "bg-yellow-100 text-yellow-800",
                          order.status === "PROCESSING" && "bg-blue-100 text-blue-800",
                          order.status === "SHIPPED" && "bg-indigo-100 text-indigo-800",
                          order.status === "DELIVERED" && "bg-green-100 text-green-800",
                          order.status === "CANCELLED" && "bg-red-100 text-red-800",
                          order.status === "REFUNDED" && "bg-gray-100 text-gray-800"
                        )}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </m.div>

        {/* Quick Actions */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="admin-card admin-section-md"
        >
          <AdminH2 className="text-lg sm:text-xl mb-4">Quick Actions</AdminH2>
          <div className="space-y-3">
            <Link href="/admin/products/new">
              <Button className="w-full justify-start" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Add New Product
              </Button>
            </Link>
            <Link href="/admin/orders?status=PENDING">
              <Button variant="secondary" className="w-full justify-start" size="lg">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Process Orders
                {pendingOrdersCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {pendingOrdersCount}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/admin/inventory">
              <Button variant="secondary" className="w-full justify-start" size="lg">
                <AlertTriangle className="w-5 h-5 mr-2" />
                View Low Stock
                {metrics.lowStockCount > 0 && (
                  <span className="ml-auto bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {metrics.lowStockCount}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/admin/customers">
              <Button variant="secondary" className="w-full justify-start" size="lg">
                <Users className="w-5 h-5 mr-2" />
                View Customers
              </Button>
            </Link>
          </div>
        </m.div>
      </div>

      {/* Top Selling Products */}
      {topProducts.length > 0 && (
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="admin-card admin-section-md"
        >
          <AdminH2 className="text-lg sm:text-xl mb-4">Top Selling Products</AdminH2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {topProducts.map((product, idx) => (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}`}
                className="group"
              >
                <m.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + idx * 0.05 }}
                  className="bg-white rounded-lg border border-gray-200 hover:border-navy-300 hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div className="relative w-full h-32 bg-gray-100">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 20vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-navy-600 text-white text-xs font-bold px-2 py-1 rounded">
                      #{idx + 1}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2 group-hover:text-navy-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{product.sold} sold</span>
                      <span className="font-semibold text-navy-600">{formatPrice(product.revenue)}</span>
                    </div>
                  </div>
                </m.div>
              </Link>
            ))}
          </div>
        </m.div>
      )}
    </div>
  );
}
