"use client";

import * as React from "react";
import { BarChart3, TrendingUp, DollarSign, ShoppingBag } from "lucide-react";
import { getDashboardStats } from "@/lib/admin-api";
import { formatPrice } from "@/lib/utils";
import { H1 } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/Skeleton";
import { RevenueChart } from "@/components/admin/analytics/RevenueChart";
import { OrderTrendsChart } from "@/components/admin/analytics/OrderTrendsChart";

/**
 * Analytics Page
 * 
 * Detailed analytics and reporting.
 */
export default function AnalyticsPage(): JSX.Element {
  const [stats, setStats] = React.useState<Awaited<ReturnType<typeof getDashboardStats>> | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadStats(): Promise<void> {
      setLoading(true);
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <H1 className="text-charcoal-900 text-3xl font-serif font-bold">Analytics</H1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-cream-50 rounded-xl p-6 border border-cream-200">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-navy-900" />
            <span className="text-sm text-green-600 font-semibold">+{stats.revenueChange}%</span>
          </div>
          <h3 className="text-2xl font-bold text-charcoal-900 mb-1">{formatPrice(stats.revenue * 100)}</h3>
          <p className="text-sm text-charcoal-600">Total Revenue</p>
        </div>

        <div className="bg-cream-50 rounded-xl p-6 border border-cream-200">
          <div className="flex items-center justify-between mb-4">
            <ShoppingBag className="w-8 h-8 text-navy-900" />
            <span className="text-sm text-green-600 font-semibold">+{stats.ordersChange}%</span>
          </div>
          <h3 className="text-2xl font-bold text-charcoal-900 mb-1">{stats.orders}</h3>
          <p className="text-sm text-charcoal-600">Total Orders</p>
        </div>

        <div className="bg-cream-50 rounded-xl p-6 border border-cream-200">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-navy-900" />
            <span className="text-sm text-green-600 font-semibold">+{stats.aovChange}%</span>
          </div>
          <h3 className="text-2xl font-bold text-charcoal-900 mb-1">{formatPrice(stats.aov * 100)}</h3>
          <p className="text-sm text-charcoal-600">Average Order Value</p>
        </div>

        <div className="bg-cream-50 rounded-xl p-6 border border-cream-200">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-8 h-8 text-navy-900" />
            <span className="text-sm text-green-600 font-semibold">+{stats.customersChange}%</span>
          </div>
          <h3 className="text-2xl font-bold text-charcoal-900 mb-1">{stats.customers}</h3>
          <p className="text-sm text-charcoal-600">Total Customers</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <RevenueChart data={stats.revenueData || []} loading={loading} />
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <OrderTrendsChart
            data={stats.revenueData?.map((point, index) => ({
              date: point.date,
              orders: Math.floor(Math.random() * 10) + 1, // Mock for now
              revenue: point.revenue,
            })) || []}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
