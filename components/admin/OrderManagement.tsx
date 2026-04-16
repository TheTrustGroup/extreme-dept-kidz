"use client";

import { useEffect, useState } from "react";
import { Search, Eye } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
    };
    variant: {
      size: string;
    };
  }>;
}

export function OrderManagement(): JSX.Element {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders(): Promise<void> {
    try {
      const response = await fetch("/api/admin/orders", {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Handle both apiSuccess format (data.orders) and direct array format
        const orders = data.data?.orders || data.orders || (Array.isArray(data) ? data : []);
        setOrders(orders);
      } else {
        console.error("Failed to fetch orders:", response.status, response.statusText);
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-charcoal-600">Loading orders...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-compact-2xl leading-compact-tight tracking-compact-tight font-bold text-charcoal-900">Orders</h1>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-cream-200/50 mb-6">
        <div className="p-4 border-b border-cream-200/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-400" />
            <Input
              type="text"
              placeholder="Search orders by order number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              density="compact"
              className="pl-10 bg-white border-cream-300 focus-visible:ring-navy-500/20 focus-visible:border-navy-500"
            />
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table w-full">
            <thead className="bg-cream-50">
              <tr>
                <th className="text-left">
                  Order Number
                </th>
                <th className="text-left">
                  Date
                </th>
                <th className="text-left">
                  Items
                </th>
                <th className="text-left">
                  Total
                </th>
                <th className="text-left">
                  Status
                </th>
                <th className="text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-cream-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-compact-md leading-compact-normal text-charcoal-600">
                    {searchTerm ? "No orders found" : "No orders yet"}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-cream-50">
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="font-medium text-compact-md leading-compact-normal text-charcoal-900">
                        {order.orderNumber || order.id.slice(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-compact-md leading-compact-normal text-charcoal-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-compact-md leading-compact-normal text-charcoal-600">
                      {order.items?.length || 0} item(s)
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-compact-md leading-compact-normal font-medium text-charcoal-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 text-compact-sm leading-compact-tight font-medium rounded-full ${
                          order.status === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : order.status === "SHIPPED"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "PROCESSING"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-right text-compact-md leading-compact-normal font-medium">
                      <Button variant="ghost" size="compact" className="inline-flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
