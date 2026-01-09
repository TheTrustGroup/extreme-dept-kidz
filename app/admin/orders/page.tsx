"use client";

import * as React from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { Package, MoreVertical } from "lucide-react";
import { getOrders } from "@/lib/admin-api";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { H1 } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Orders Management Page
 * 
 * View and manage all orders.
 */
export default function OrdersPage(): JSX.Element {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  React.useEffect(() => {
    async function loadOrders(): Promise<void> {
      setLoading(true);
      try {
        const data = await getOrders({ status: statusFilter !== "all" ? statusFilter : undefined });
        setOrders(data.orders);
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [statusFilter]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "shipped":
        return "bg-purple-100 text-purple-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-cream-100 text-charcoal-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <H1 className="text-charcoal-900 text-3xl font-serif font-bold">Orders</H1>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2">
        {["all", "pending", "shipped", "delivered"].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "primary" : "secondary"}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-cream-50 rounded-xl border border-cream-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-charcoal-400 mx-auto mb-4" />
            <p className="text-charcoal-600">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-100 border-b border-cream-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900">Order</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900">Items</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-charcoal-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-cream-100 transition-colors">
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-navy-900 hover:text-navy-700"
                      >
                        #{order.id}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-sm text-charcoal-900">{order.customer}</td>
                    <td className="px-4 py-4 text-sm text-charcoal-600">{order.items || 0}</td>
                    <td className="px-4 py-4 font-semibold text-charcoal-900">
                      {formatPrice(order.total * 100)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-charcoal-600">{order.date}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <MoreVertical className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
