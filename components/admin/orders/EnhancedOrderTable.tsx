"use client";

import * as React from "react";
import { m } from "framer-motion";
import Link from "next/link";
import {
  Package,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Download,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: Date;
  user: {
    email: string;
    name: string | null;
  } | null;
  items: Array<{
    quantity: number;
  }>;
}

interface EnhancedOrderTableProps {
  orders: Order[];
  loading?: boolean;
}

type SortField = 'orderNumber' | 'customer' | 'total' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export function EnhancedOrderTable({
  orders,
  loading = false,
}: EnhancedOrderTableProps): JSX.Element {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortField, setSortField] = React.useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');

  // Filter and sort orders
  const filteredAndSorted = React.useMemo(() => {
    let filtered = [...orders];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        o =>
          o.orderNumber.toLowerCase().includes(searchLower) ||
          o.user?.email.toLowerCase().includes(searchLower) ||
          o.user?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | number | Date;
      let bVal: string | number | Date;

      switch (sortField) {
        case 'orderNumber':
          aVal = a.orderNumber;
          bVal = b.orderNumber;
          break;
        case 'customer':
          aVal = a.user?.email || a.user?.name || '';
          bVal = b.user?.email || b.user?.name || '';
          break;
        case 'total':
          aVal = a.total;
          bVal = b.total;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'createdAt':
          aVal = a.createdAt;
          bVal = b.createdAt;
          break;
        default:
          return 0;
      }

      if (aVal instanceof Date && bVal instanceof Date) {
        return sortDirection === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      } else if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortDirection === 'asc'
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }
    });

    return filtered;
  }, [orders, search, statusFilter, sortField, sortDirection]);

  const handleSort = (field: SortField): void => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-indigo-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-indigo-600" />
    );
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleExport = (): void => {
    const csv = [
      ['Order Number', 'Customer', 'Items', 'Total', 'Status', 'Date'].join(','),
      ...filteredAndSorted.map(o => [
        o.orderNumber,
        `"${o.user?.email || o.user?.name || 'Guest'}"`,
        o.items.reduce((sum, item) => sum + item.quantity, 0),
        (o.total / 100).toFixed(2),
        o.status,
        format(new Date(o.createdAt), 'yyyy-MM-dd'),
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by order number, customer email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            density="compact"
            className="pl-10 bg-white border-gray-300 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
          />
          <p className="adm-help-text mt-1">Order rows are striped to improve readability in long lists.</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-control-compact px-compact-4 border border-gray-300 rounded-compact bg-white text-compact-md leading-compact-normal focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        {/* Export */}
        <Button
          variant="ghost"
          size="compact"
          onClick={handleExport}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white/90 rounded-xl border border-cream-300/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-compact-md leading-compact-normal">
            <thead className="bg-cream-50 border-b border-cream-300/70">
              <tr>
                <th className="px-4 py-3 text-left text-compact-sm font-bold uppercase tracking-compact-label leading-compact-tight text-gray-700">
                  <button
                    onClick={() => handleSort('orderNumber')}
                    className="flex items-center gap-2 hover:text-gray-900"
                  >
                    Order
                    {getSortIcon('orderNumber')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-compact-sm font-bold uppercase tracking-compact-label leading-compact-tight text-gray-700">
                  <button
                    onClick={() => handleSort('customer')}
                    className="flex items-center gap-2 hover:text-gray-900"
                  >
                    Customer
                    {getSortIcon('customer')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-compact-sm font-bold uppercase tracking-compact-label leading-compact-tight text-gray-700">
                  <button
                    onClick={() => handleSort('total')}
                    className="flex items-center gap-2 hover:text-gray-900"
                  >
                    Total
                    {getSortIcon('total')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-compact-sm font-bold uppercase tracking-compact-label leading-compact-tight text-gray-700">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-2 hover:text-gray-900"
                  >
                    Status
                    {getSortIcon('status')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-compact-sm font-bold uppercase tracking-compact-label leading-compact-tight text-gray-700">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center gap-2 hover:text-gray-900"
                  >
                    Date
                    {getSortIcon('createdAt')}
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-compact-sm font-bold uppercase tracking-compact-label leading-compact-tight text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-300/70">
              {filteredAndSorted.map((order, index) => (
                <m.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "transition-colors border-b border-cream-300/70 hover:bg-cream-50/90",
                    index % 2 === 0 ? "bg-white" : "bg-cream-50/70"
                  )}
                >
                  <td className="px-4 py-3 text-compact-md leading-compact-normal">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-compact-md leading-compact-normal text-gray-900">
                        {order.user?.name || 'Guest'}
                      </p>
                      <p className="text-xs text-gray-500">{order.user?.email || ''}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-compact-md leading-compact-normal font-semibold text-gray-900">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 text-compact-sm leading-compact-tight font-medium rounded-full",
                      getStatusColor(order.status)
                    )}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {format(new Date(order.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="compact"
                      asChild
                      className="flex items-center gap-2"
                    >
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </Button>
                  </td>
                </m.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSorted.length === 0 && (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-compact-md leading-compact-normal text-gray-600">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
