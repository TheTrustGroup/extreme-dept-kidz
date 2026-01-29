"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  Filter,
  Download,
  Eye,
  Printer,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  CreditCard,
  Calendar,
  X,
  ChevronDown,
  FileText,
  Mail,
  Edit,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images: Array<{ url: string; alt: string | null; isPrimary: boolean }>;
  };
  variant: {
    id: string;
    size: string;
    color: string | null;
    sku: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  paymentStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  user: {
    id: string;
    email: string;
    name: string | null;
  } | null;
  shippingAddress: any;
  items: OrderItem[];
  trackingNumber?: string | null;
  carrier?: string | null;
}

type QuickFilter = "all" | "pendingPayment" | "processing" | "shipped" | "completed" | "cancelled";

interface ComprehensiveOrderTableProps {
  orders: Order[];
  loading?: boolean;
  onRefresh?: () => void;
}

export function ComprehensiveOrderTable({
  orders,
  loading = false,
  onRefresh,
}: ComprehensiveOrderTableProps): JSX.Element {
  const router = useRouter();
  const { showToast } = useToast();

  // State
  const [search, setSearch] = React.useState("");
  const [quickFilter, setQuickFilter] = React.useState<QuickFilter>("all");
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedOrders, setSelectedOrders] = React.useState<Set<string>>(new Set());
  const [bulkActionDialog, setBulkActionDialog] = React.useState<"processing" | "shipped" | "cancel" | null>(null);
  const [processing, setProcessing] = React.useState(false);
  const [moreActionsOpen, setMoreActionsOpen] = React.useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = React.useState({
    paymentStatus: "",
    fulfillmentStatus: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    shippingMethod: "",
  });

  // Stats for quick filters
  const [stats, setStats] = React.useState({
    all: 0,
    pendingPayment: 0,
    processing: 0,
    shipped: 0,
    completed: 0,
    cancelled: 0,
  });

  // Load stats
  React.useEffect(() => {
    async function loadStats(): Promise<void> {
      try {
        const [allRes, pendingRes, processingRes, shippedRes, completedRes, cancelledRes] = await Promise.all([
          fetch('/api/admin/orders?limit=1', { credentials: 'include' }),
          fetch('/api/admin/orders?paymentStatus=PENDING&limit=1', { credentials: 'include' }),
          fetch('/api/admin/orders?status=PROCESSING&limit=1', { credentials: 'include' }),
          fetch('/api/admin/orders?status=SHIPPED&limit=1', { credentials: 'include' }),
          fetch('/api/admin/orders?status=DELIVERED&limit=1', { credentials: 'include' }),
          fetch('/api/admin/orders?status=CANCELLED&limit=1', { credentials: 'include' }),
        ]);

        const [allData, pendingData, processingData, shippedData, completedData, cancelledData] = await Promise.all([
          allRes.json().catch(() => ({ data: { total: 0 } })),
          pendingRes.json().catch(() => ({ data: { total: 0 } })),
          processingRes.json().catch(() => ({ data: { total: 0 } })),
          shippedRes.json().catch(() => ({ data: { total: 0 } })),
          completedRes.json().catch(() => ({ data: { total: 0 } })),
          cancelledRes.json().catch(() => ({ data: { total: 0 } })),
        ]);

        setStats({
          all: allData.data?.total || 0,
          pendingPayment: pendingData.data?.total || 0,
          processing: processingData.data?.total || 0,
          shipped: shippedData.data?.total || 0,
          completed: completedData.data?.total || 0,
          cancelled: cancelledData.data?.total || 0,
        });
      } catch (error) {
        console.error("Failed to load stats:", error);
      }
    }
    loadStats();
  }, []);

  // Filter and search orders
  const filteredOrders = React.useMemo(() => {
    let filtered = [...orders];

    // Apply quick filter
    if (quickFilter === "pendingPayment") {
      filtered = filtered.filter(o => o.paymentStatus === "PENDING");
    } else if (quickFilter === "processing") {
      filtered = filtered.filter(o => o.status === "PROCESSING");
    } else if (quickFilter === "shipped") {
      filtered = filtered.filter(o => o.status === "SHIPPED");
    } else if (quickFilter === "completed") {
      filtered = filtered.filter(o => o.status === "DELIVERED");
    } else if (quickFilter === "cancelled") {
      filtered = filtered.filter(o => o.status === "CANCELLED" || o.status === "REFUNDED");
    }

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        o =>
          o.orderNumber.toLowerCase().includes(searchLower) ||
          o.user?.email.toLowerCase().includes(searchLower) ||
          o.user?.name?.toLowerCase().includes(searchLower) ||
          (o.shippingAddress?.name && o.shippingAddress.name.toLowerCase().includes(searchLower)) ||
          (o.shippingAddress?.email && o.shippingAddress.email.toLowerCase().includes(searchLower))
      );
    }

    // Apply filters
    if (filters.paymentStatus) {
      filtered = filtered.filter(o => o.paymentStatus === filters.paymentStatus);
    }
    if (filters.fulfillmentStatus) {
      filtered = filtered.filter(o => o.status === filters.fulfillmentStatus);
    }
    if (filters.startDate) {
      filtered = filtered.filter(o => new Date(o.createdAt) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(o => new Date(o.createdAt) <= new Date(filters.endDate));
    }
    if (filters.minAmount) {
      filtered = filtered.filter(o => o.total >= parseInt(filters.minAmount) * 100);
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(o => o.total <= parseInt(filters.maxAmount) * 100);
    }
    if (filters.shippingMethod) {
      filtered = filtered.filter(o => o.carrier === filters.shippingMethod);
    }

    return filtered;
  }, [orders, quickFilter, search, filters]);

  // Selection handlers
  const toggleSelect = (orderId: string): void => {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const toggleSelectAll = (): void => {
    if (selectedOrders.size === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map((o) => o.id)));
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: "processing" | "shipped" | "cancel"): Promise<void> => {
    if (selectedOrders.size === 0) return;

    setBulkActionDialog(action);
  };

  const confirmBulkAction = async (): Promise<void> => {
    if (!bulkActionDialog || selectedOrders.size === 0) return;

    setProcessing(true);
    const action = bulkActionDialog;
    setBulkActionDialog(null);

    try {
      let status: string;
      if (action === "processing") {
        status = "PROCESSING";
      } else if (action === "shipped") {
        status = "SHIPPED";
      } else {
        status = "CANCELLED";
      }

      const response = await fetch('/api/admin/orders/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ids: Array.from(selectedOrders),
          action: action === "cancel" ? "cancel" : "updateStatus",
          status: action !== "cancel" ? status : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast({
          type: "success",
          title: "Orders Updated",
          message: data.message || `Successfully ${action === "cancel" ? "cancelled" : "updated"} ${selectedOrders.size} order${selectedOrders.size !== 1 ? 's' : ''}`,
        });
        setSelectedOrders(new Set());
        onRefresh?.();
      } else {
        showToast({
          type: "error",
          title: "Update Failed",
          message: data.error || data.message || "Failed to update orders.",
        });
      }
    } catch (error) {
      console.error("Bulk action error:", error);
      showToast({
        type: "error",
        title: "Update Failed",
        message: "An error occurred while updating orders.",
      });
    } finally {
      setProcessing(false);
    }
  };

  // Export handlers
  const handleExport = (allOrders = false): void => {
    const ordersToExport = allOrders ? orders : filteredOrders.filter((o) => selectedOrders.has(o.id));

    if (!allOrders && ordersToExport.length === 0) {
      showToast({
        type: "info",
        title: "No Orders Selected",
        message: "Please select orders to export",
      });
      return;
    }

    const csv = [
      ["Order #", "Date", "Customer", "Email", "Products", "Total", "Payment Status", "Fulfillment Status"].join(","),
      ...ordersToExport.map((o) => {
        const customerName = o.user?.name || o.shippingAddress?.name || "Guest";
        const customerEmail = o.user?.email || o.shippingAddress?.email || "";
        const productCount = o.items.reduce((sum, item) => sum + item.quantity, 0);
        return [
          o.orderNumber,
          format(new Date(o.createdAt), 'yyyy-MM-dd HH:mm'),
          `"${customerName}"`,
          `"${customerEmail}"`,
          productCount.toString(),
          formatPrice(o.total),
          o.paymentStatus,
          o.status,
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showToast({
      type: "success",
      title: "Export Started",
      message: `${ordersToExport.length} order${ordersToExport.length !== 1 ? 's' : ''} exported`,
    });
  };

  // Print invoices
  const handlePrintInvoices = (): void => {
    if (selectedOrders.size === 0) {
      showToast({
        type: "info",
        title: "No Orders Selected",
        message: "Please select orders to print",
      });
      return;
    }

    const ordersToPrint = filteredOrders.filter((o) => selectedOrders.has(o.id));
    ordersToPrint.forEach((order) => {
      window.open(`/admin/orders/${order.id}/invoice`, "_blank");
    });

    showToast({
      type: "success",
      title: "Printing Invoices",
      message: `Opening ${ordersToPrint.length} invoice${ordersToPrint.length !== 1 ? 's' : ''} for printing`,
    });
  };

  // Status badge helpers
  const getPaymentStatusBadge = (status: string): { color: string; dot: string; label: string } => {
    switch (status) {
      case "COMPLETED":
        return { color: "bg-green-100 text-green-800", dot: "bg-green-500", label: "Paid" };
      case "PENDING":
        return { color: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-500", label: "Pending" };
      case "PROCESSING":
        return { color: "bg-blue-100 text-blue-800", dot: "bg-blue-500", label: "Processing" };
      case "FAILED":
        return { color: "bg-red-100 text-red-800", dot: "bg-red-500", label: "Failed" };
      case "REFUNDED":
      case "PARTIALLY_REFUNDED":
        return { color: "bg-gray-100 text-gray-800", dot: "bg-gray-500", label: "Refunded" };
      default:
        return { color: "bg-gray-100 text-gray-800", dot: "bg-gray-500", label: status };
    }
  };

  const getFulfillmentStatusBadge = (status: string): { color: string; dot: string; label: string } => {
    switch (status) {
      case "PROCESSING":
        return { color: "bg-blue-100 text-blue-800", dot: "bg-blue-500", label: "Processing" };
      case "SHIPPED":
        return { color: "bg-purple-100 text-purple-800", dot: "bg-purple-500", label: "Shipped" };
      case "DELIVERED":
        return { color: "bg-green-100 text-green-800", dot: "bg-green-500", label: "Delivered" };
      case "CANCELLED":
        return { color: "bg-red-100 text-red-800", dot: "bg-red-500", label: "Cancelled" };
      case "REFUNDED":
        return { color: "bg-gray-100 text-gray-800", dot: "bg-gray-500", label: "Refunded" };
      case "PENDING":
      default:
        return { color: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-500", label: "Unfulfilled" };
    }
  };

  // Clear filters
  const clearFilters = (): void => {
    setFilters({
      paymentStatus: "",
      fulfillmentStatus: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
      shippingMethod: "",
    });
    setSearch("");
    setQuickFilter("all");
  };

  const hasActiveFilters = search || filters.paymentStatus || filters.fulfillmentStatus || filters.startDate || filters.endDate || filters.minAmount || filters.maxAmount || filters.shippingMethod || quickFilter !== "all";

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {([
          { key: "all" as QuickFilter, label: "All Orders", icon: Package },
          { key: "pendingPayment" as QuickFilter, label: "Pending Payment", icon: Clock },
          { key: "processing" as QuickFilter, label: "Processing", icon: Truck },
          { key: "shipped" as QuickFilter, label: "Shipped", icon: Package },
          { key: "completed" as QuickFilter, label: "Completed", icon: CheckCircle2 },
          { key: "cancelled" as QuickFilter, label: "Cancelled/Refunded", icon: XCircle },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              setQuickFilter(key);
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              quickFilter === key
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs",
              quickFilter === key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
            )}>
              {stats[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order number, customer name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && "bg-indigo-50 border-indigo-200")}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                {[search, filters.paymentStatus, filters.fulfillmentStatus, filters.startDate, filters.endDate, filters.minAmount, filters.maxAmount, filters.shippingMethod].filter(Boolean).length}
              </span>
            )}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleExport(true)}>
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Payment Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="COMPLETED">Paid</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fulfillment Status</label>
                <select
                  value={filters.fulfillmentStatus}
                  onChange={(e) => setFilters({ ...filters, fulfillmentStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Fulfillment Statuses</option>
                  <option value="PENDING">Unfulfilled</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Method</label>
                <select
                  value={filters.shippingMethod}
                  onChange={(e) => setFilters({ ...filters, shippingMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Methods</option>
                  <option value="usps">USPS</option>
                  <option value="ups">UPS</option>
                  <option value="fedex">FedEx</option>
                  <option value="dhl">DHL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount (₵)</label>
                <input
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount (₵)</label>
                <input
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                  placeholder="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            {hasActiveFilters && (
              <div className="flex justify-end pt-2 border-t border-gray-200">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedOrders.size > 0 && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                {selectedOrders.size}
              </div>
              <span className="text-sm font-semibold text-gray-900">
                order{selectedOrders.size !== 1 ? "s" : ""} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBulkAction("processing")}
                disabled={processing}
              >
                Mark as Processing
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBulkAction("shipped")}
                disabled={processing}
              >
                Mark as Shipped
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrintInvoices}
                disabled={processing}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Invoices
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExport(false)}
                disabled={processing}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Selected
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleBulkAction("cancel")}
                disabled={processing}
              >
                Cancel Orders
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOrders(new Set())}
              >
                Clear Selection
              </Button>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            {hasActiveFilters ? (
              <>
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2 font-medium">No orders match your search</p>
                <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or search terms</p>
                <Button variant="primary" onClick={clearFilters} className="shadow-md hover:shadow-lg">
                  Clear Filters
                </Button>
              </>
            ) : (
              <>
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2 font-medium">No orders yet</p>
                <p className="text-gray-500 text-sm">Orders will appear here once customers start placing them</p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left w-12">
                    <input
                      type="checkbox"
                      checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
                    />
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Order #</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Products</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Total</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Payment</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Fulfillment</th>
                  <th className="px-4 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order, idx) => {
                  const isSelected = selectedOrders.has(order.id);
                  const paymentStatus = getPaymentStatusBadge(order.paymentStatus);
                  const fulfillmentStatus = getFulfillmentStatusBadge(order.status);
                  const productCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  const primaryImage = order.items[0]?.product?.images?.[0];

                  return (
                    <m.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className={cn(
                        "group hover:bg-gray-50 transition-all duration-150",
                        isSelected && "bg-indigo-50 border-l-4 border-indigo-500"
                      )}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(order.id)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all hover:scale-110"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {format(new Date(order.createdAt), 'MMM d, yyyy')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(order.createdAt), 'h:mm a')}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.user?.name || order.shippingAddress?.name || "Guest"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.user?.email || order.shippingAddress?.email || ""}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {primaryImage && (
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <Image
                                src={primaryImage.url}
                                alt={primaryImage.alt || order.items[0].product.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{productCount} item{productCount !== 1 ? 's' : ''}</p>
                            {order.items.length > 1 && (
                              <p className="text-xs text-gray-500">+{order.items.length - 1} more</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={cn("w-2 h-2 rounded-full", paymentStatus.dot)} />
                          <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", paymentStatus.color)}>
                            {paymentStatus.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={cn("w-2 h-2 rounded-full", fulfillmentStatus.dot)} />
                          <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", fulfillmentStatus.color)}>
                            {fulfillmentStatus.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                            title="View Order"
                          >
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-gray-100 transition-all"
                            title="Print Invoice"
                            onClick={() => window.open(`/admin/orders/${order.id}/invoice`, "_blank")}
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-gray-100 transition-all"
                              onClick={() => setMoreActionsOpen(moreActionsOpen === order.id ? null : order.id)}
                              title="More Actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                            {moreActionsOpen === order.id && (
                              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[180px]">
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  onClick={() => {
                                    router.push(`/admin/orders/${order.id}`);
                                    setMoreActionsOpen(null);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit Order
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  onClick={() => {
                                    // TODO: Implement send tracking
                                    showToast({
                                      type: "info",
                                      title: "Coming Soon",
                                      message: "Send tracking feature will be available soon",
                                    });
                                    setMoreActionsOpen(null);
                                  }}
                                >
                                  <Mail className="w-4 h-4" />
                                  Send Tracking
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  onClick={() => {
                                    // TODO: Implement refund
                                    showToast({
                                      type: "info",
                                      title: "Coming Soon",
                                      message: "Refund feature will be available soon",
                                    });
                                    setMoreActionsOpen(null);
                                  }}
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  Process Refund
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </m.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results Count */}
      {filteredOrders.length > 0 && (
        <div className="text-sm text-gray-600">
          Showing {filteredOrders.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={bulkActionDialog === "processing"}
        title="Mark Orders as Processing"
        message={`Are you sure you want to mark ${selectedOrders.size} order${selectedOrders.size !== 1 ? 's' : ''} as Processing?`}
        confirmText="Mark as Processing"
        cancelText="Cancel"
        onConfirm={confirmBulkAction}
        onCancel={() => setBulkActionDialog(null)}
      />

      <ConfirmDialog
        isOpen={bulkActionDialog === "shipped"}
        title="Mark Orders as Shipped"
        message={`Are you sure you want to mark ${selectedOrders.size} order${selectedOrders.size !== 1 ? 's' : ''} as Shipped?`}
        confirmText="Mark as Shipped"
        cancelText="Cancel"
        onConfirm={confirmBulkAction}
        onCancel={() => setBulkActionDialog(null)}
      />

      <ConfirmDialog
        isOpen={bulkActionDialog === "cancel"}
        title="Cancel Orders"
        message={
          <div>
            <p className="mb-2">Are you sure you want to cancel {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''}?</p>
            <p className="text-sm text-gray-600">This action cannot be undone. Customers will be notified.</p>
          </div>
        }
        confirmText="Cancel Orders"
        cancelText="Keep Orders"
        variant="danger"
        onConfirm={confirmBulkAction}
        onCancel={() => setBulkActionDialog(null)}
      />
    </div>
  );
}
