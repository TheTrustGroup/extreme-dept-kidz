"use client";

import * as React from "react";
import { ComprehensiveOrderTable } from "@/components/admin/orders/ComprehensiveOrderTable";
import { H1 } from "@/components/ui/typography";

/**
 * Orders Management Page
 * 
 * Comprehensive orders management with filtering, bulk actions, and detailed views.
 */
export default function OrdersPage(): JSX.Element {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadOrders = React.useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/orders', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.data?.orders || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <H1 className="text-3xl font-bold text-gray-900 mb-2">Orders</H1>
          <p className="text-gray-600 text-sm">Manage and track all customer orders</p>
        </div>
      </div>

      {/* Comprehensive Orders Table */}
      <ComprehensiveOrderTable orders={orders} loading={loading} onRefresh={loadOrders} />
    </div>
  );
}
