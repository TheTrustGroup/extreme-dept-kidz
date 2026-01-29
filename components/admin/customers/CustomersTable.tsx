"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Eye,
  Edit,
  UserX,
  MoreVertical,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";

export interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  totalOrders: number;
  totalSpent: number;
  accountStatus: string;
  isActive: boolean;
  dateJoined: string;
}

type QuickFilter = "all" | "active" | "inactive" | "highValue" | "new";

interface CustomersTableProps {
  onRefresh?: () => void;
}

function getInitials(name: string, email: string): string {
  if (name && name !== "—") {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "?";
}

export function CustomersTable({ onRefresh }: CustomersTableProps): JSX.Element {
  const router = useRouter();
  const { showToast } = useToast();
  const [customers, setCustomers] = React.useState<CustomerRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [quickFilter, setQuickFilter] = React.useState<QuickFilter>("all");
  const [search, setSearch] = React.useState("");
  const [searchDebounced, setSearchDebounced] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [moreActionsOpen, setMoreActionsOpen] = React.useState<string | null>(null);
  const [disableConfirm, setDisableConfirm] = React.useState<string | null>(null);
  const [actioning, setActioning] = React.useState(false);

  const loadCustomers = React.useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("filter", quickFilter);
      params.set("page", String(page));
      params.set("limit", "25");
      if (searchDebounced) params.set("search", searchDebounced);

      const response = await fetch(`/api/admin/customers?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to fetch customers");
      }

      const data = await response.json();
      const list = data.data?.customers ?? [];
      setCustomers(list);
      setTotalPages(data.data?.totalPages ?? 1);
      setTotal(data.data?.total ?? 0);
    } catch (error) {
      console.error("Failed to load customers:", error);
      showToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to load customers",
      });
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [quickFilter, page, searchDebounced, showToast]);

  React.useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  React.useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleDisable = async (customerId: string): Promise<void> => {
    setDisableConfirm(null);
    setActioning(true);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "disable" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to disable");
      showToast({ type: "success", title: "Account disabled", message: "Customer account has been disabled." });
      onRefresh?.();
      loadCustomers();
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to disable account",
      });
    } finally {
      setActioning(false);
    }
  };

  const filterTabs: { key: QuickFilter; label: string }[] = [
    { key: "all", label: "All Customers" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
    { key: "highValue", label: "High Value" },
    { key: "new", label: "New" },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setQuickFilter(tab.key);
                setPage(1);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                quickFilter === tab.key
                  ? "bg-charcoal-900 text-white"
                  : "bg-cream-100 text-charcoal-700 hover:bg-cream-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
          <input
            type="search"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-cream-200 bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-cream-50 rounded-xl border border-cream-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-charcoal-400 mx-auto mb-4" />
            <p className="text-charcoal-600">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-100 border-b border-cream-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900 hidden md:table-cell">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900">
                    Orders
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900">
                    Total Spent
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900 hidden lg:table-cell">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900 hidden lg:table-cell">
                    Date Joined
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-charcoal-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-cream-100 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {customer.image ? (
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-cream-200 flex-shrink-0">
                            <Image
                              src={customer.image}
                              alt={customer.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full bg-navy-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0"
                            aria-hidden
                          >
                            {getInitials(customer.name, customer.email)}
                          </div>
                        )}
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="font-semibold text-navy-900 hover:text-navy-700"
                        >
                          {customer.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-charcoal-600">{customer.email}</td>
                    <td className="px-4 py-3 text-sm text-charcoal-600 hidden md:table-cell">
                      {customer.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-charcoal-900">{customer.totalOrders}</td>
                    <td className="px-4 py-3 font-semibold text-charcoal-900">
                      {formatPrice(customer.totalSpent)}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span
                        className={cn(
                          "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                          customer.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-charcoal-100 text-charcoal-600"
                        )}
                      >
                        {customer.accountStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-charcoal-600 hidden lg:table-cell">
                      {format(new Date(customer.dateJoined), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/customers/${customer.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/customers/${customer.id}?edit=1`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        {customer.isActive && (
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setMoreActionsOpen(moreActionsOpen === customer.id ? null : customer.id)}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                            {moreActionsOpen === customer.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  aria-hidden
                                  onClick={() => setMoreActionsOpen(null)}
                                />
                                <div className="absolute right-0 top-full mt-1 py-1 bg-white border border-cream-200 rounded-lg shadow-lg z-20 min-w-[140px]">
                                  <button
                                    type="button"
                                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-cream-100 flex items-center gap-2"
                                    onClick={() => {
                                      setDisableConfirm(customer.id);
                                      setMoreActionsOpen(null);
                                    }}
                                  >
                                    <UserX className="w-4 h-4" />
                                    Disable
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && customers.length > 0 && totalPages > 1 && (
          <div className="px-4 py-3 border-t border-cream-200 flex items-center justify-between">
            <p className="text-sm text-charcoal-600">
              Page {page} of {totalPages} · {total} total
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!disableConfirm}
        title="Disable account"
        message="This customer will no longer be able to sign in. You can re-enable the account from their profile."
        confirmText="Disable"
        variant="danger"
        onConfirm={() => disableConfirm && handleDisable(disableConfirm)}
        onCancel={() => setDisableConfirm(null)}
      />
    </div>
  );
}
