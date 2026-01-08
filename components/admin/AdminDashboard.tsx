"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockItems: number;
}

export function AdminDashboard(): JSX.Element {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats(): Promise<void> {
      try {
        const response = await fetch("/api/admin/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "bg-green-500",
    },
    {
      title: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: "bg-purple-500",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockItems,
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-charcoal-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-charcoal-900 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-6 border border-cream-200/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-charcoal-900">
                    {card.value}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-6 border border-cream-200/50">
        <h2 className="text-xl font-semibold text-charcoal-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/products/new"
            className="p-4 border border-cream-200 rounded-lg hover:bg-cream-50 transition-colors"
          >
            <h3 className="font-medium text-charcoal-900 mb-1">Add New Product</h3>
            <p className="text-sm text-charcoal-600">Create a new product listing</p>
          </a>
          <a
            href="/admin/inventory"
            className="p-4 border border-cream-200 rounded-lg hover:bg-cream-50 transition-colors"
          >
            <h3 className="font-medium text-charcoal-900 mb-1">Manage Inventory</h3>
            <p className="text-sm text-charcoal-600">Update stock levels</p>
          </a>
          <a
            href="/admin/orders"
            className="p-4 border border-cream-200 rounded-lg hover:bg-cream-50 transition-colors"
          >
            <h3 className="font-medium text-charcoal-900 mb-1">View Orders</h3>
            <p className="text-sm text-charcoal-600">Process and track orders</p>
          </a>
        </div>
      </div>
    </div>
  );
}
