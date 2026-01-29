"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  Save,
  X,
  Package,
  MapPin,
  MessageSquare,
  Plus,
  Key,
  MailCheck,
  UserX,
  Trash2,
  MoreVertical,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { H1 } from "@/components/ui/typography";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAdminBreadcrumb } from "@/components/admin/AdminBreadcrumbContext";
import { usePathname } from "next/navigation";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    slug: string;
    category?: { id: string; name: string; slug: string };
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

interface Address {
  id: string;
  label: string | null;
  address: Record<string, unknown>;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

interface Note {
  id: string;
  note: string;
  createdAt: string;
  adminUser: { id: string; name: string; email: string };
}

interface CustomerData {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  image: string | null;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  orders: Order[];
  addresses: Address[];
  notes: Note[];
  analytics: {
    totalLifetimeValue: number;
    averageOrderValue: number;
    totalOrders: number;
    mostPurchasedCategory: { name: string; slug: string } | null;
    lastOrderDate: string | null;
  };
}

function getInitials(name: string | null, email: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function formatAddress(addr: Record<string, unknown>): string {
  const parts = [
    addr.line1,
    addr.line2,
    [addr.city, addr.state].filter(Boolean).join(", "),
    addr.postalCode,
    addr.country,
  ].filter(Boolean);
  return parts.join(", ");
}

interface AddressesSectionProps {
  customerId: string;
  addresses: Address[];
  onUpdated: () => void;
}

function AddressesSection({ customerId, addresses, onUpdated }: AddressesSectionProps): JSX.Element {
  const { showToast } = useToast();
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    label: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Ghana",
    phone: "",
    isDefaultShipping: false,
    isDefaultBilling: false,
  });

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          label: form.label || null,
          address: {
            name: form.line1,
            line1: form.line1,
            line2: form.line2 || undefined,
            city: form.city,
            state: form.state || undefined,
            postalCode: form.postalCode || undefined,
            country: form.country,
            phone: form.phone || undefined,
          },
          isDefaultShipping: form.isDefaultShipping,
          isDefaultBilling: form.isDefaultBilling,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to add address");
      }
      showToast({ type: "success", title: "Address added", message: "Saved address has been added." });
      setShowAddForm(false);
      setForm({
        label: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Ghana",
        phone: "",
        isDefaultShipping: false,
        isDefaultBilling: false,
      });
      onUpdated();
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to add address",
      });
    } finally {
      setSaving(false);
    }
  };

  const defaultShipping = addresses.find((a) => a.isDefaultShipping);
  const defaultBilling = addresses.find((a) => a.isDefaultBilling);

  return (
    <div className="bg-cream-50 rounded-xl border border-cream-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-cream-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-charcoal-900 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Addresses
        </h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add address
        </Button>
      </div>
      <div className="p-4 space-y-3">
        {showAddForm && (
          <form onSubmit={handleSubmit} className="p-4 rounded-lg bg-cream-100 border border-cream-200 space-y-3">
            <input
              type="text"
              placeholder="Label (e.g. Home)"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              className="w-full px-3 py-2 border border-cream-200 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Address line 1 *"
              value={form.line1}
              onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
              className="w-full px-3 py-2 border border-cream-200 rounded-lg text-sm"
              required
            />
            <input
              type="text"
              placeholder="Address line 2"
              value={form.line2}
              onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
              className="w-full px-3 py-2 border border-cream-200 rounded-lg text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="City *"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg text-sm"
                required
              />
              <input
                type="text"
                placeholder="Postal code"
                value={form.postalCode}
                onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg text-sm"
              />
            </div>
            <input
              type="text"
              placeholder="Country *"
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              className="w-full px-3 py-2 border border-cream-200 rounded-lg text-sm"
              required
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isDefaultShipping}
                onChange={(e) => setForm((f) => ({ ...f, isDefaultShipping: e.target.checked }))}
              />
              Default shipping
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isDefaultBilling}
                onChange={(e) => setForm((f) => ({ ...f, isDefaultBilling: e.target.checked }))}
              />
              Default billing
            </label>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={saving}>Save</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </form>
        )}
        {defaultShipping && (
          <div className="p-3 rounded-lg bg-cream-100 border border-cream-200">
            <p className="text-xs font-medium text-charcoal-500 uppercase">Default shipping</p>
            <p className="text-sm text-charcoal-900 mt-1">
              {formatAddress(defaultShipping.address as Record<string, unknown>)}
            </p>
          </div>
        )}
        {defaultBilling && (
          <div className="p-3 rounded-lg bg-cream-100 border border-cream-200">
            <p className="text-xs font-medium text-charcoal-500 uppercase">Default billing</p>
            <p className="text-sm text-charcoal-900 mt-1">
              {formatAddress(defaultBilling.address as Record<string, unknown>)}
            </p>
          </div>
        )}
        {addresses.length === 0 && !showAddForm && (
          <p className="text-sm text-charcoal-600">No saved addresses.</p>
        )}
        {addresses.length > 0 && (
          <div className="pt-2">
            <p className="text-xs font-medium text-charcoal-500 uppercase mb-2">All addresses</p>
            <ul className="space-y-2">
              {addresses.map((addr) => (
                <li key={addr.id} className="text-sm text-charcoal-700">
                  {addr.label && <span className="font-medium">{addr.label}: </span>}
                  {formatAddress(addr.address as Record<string, unknown>)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const breadcrumb = useAdminBreadcrumb();
  const [resolvedParams, setResolvedParams] = React.useState<{ id: string } | null>(null);
  const [customer, setCustomer] = React.useState<CustomerData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState(false);
  const [editForm, setEditForm] = React.useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = React.useState(false);
  const [statusToggling, setStatusToggling] = React.useState(false);
  const [newNote, setNewNote] = React.useState("");
  const [addingNote, setAddingNote] = React.useState(false);
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const [disableConfirm, setDisableConfirm] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);
  const [actioning, setActioning] = React.useState(false);
  const [avatarUploading, setAvatarUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const loadCustomer = React.useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 404) {
          showToast({ type: "error", title: "Not Found", message: "Customer not found." });
          router.push("/admin/customers");
          return;
        }
        throw new Error("Failed to fetch customer");
      }
      const data = await res.json();
      const c = data.data;
      setCustomer(c);
      setEditForm({
        name: c.name ?? "",
        email: c.email ?? "",
        phone: c.phone ?? "",
      });
      if (breadcrumb && pathname) {
        breadcrumb.setDynamicLabel(pathname, c.name || c.email || "Customer");
      }
    } catch (error) {
      console.error("Failed to load customer:", error);
      showToast({ type: "error", title: "Error", message: "Failed to load customer." });
    } finally {
      setLoading(false);
    }
  }, [router, showToast, breadcrumb, pathname]);

  React.useEffect(() => {
    if (resolvedParams?.id) loadCustomer(resolvedParams.id);
  }, [resolvedParams?.id, loadCustomer]);

  const handleSaveInfo = async (): Promise<void> => {
    if (!customer) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editForm.name || null,
          email: editForm.email,
          phone: editForm.phone || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to update");
      }
      const data = await res.json();
      setCustomer((prev) => (prev ? { ...prev, ...data.data } : null));
      setEditing(false);
      showToast({ type: "success", title: "Saved", message: "Customer info updated." });
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to update",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (): Promise<void> => {
    if (!customer) return;
    setStatusToggling(true);
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !customer.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const data = await res.json();
      setCustomer((prev) => (prev ? { ...prev, isActive: data.data.isActive } : null));
      showToast({
        type: "success",
        title: customer.isActive ? "Account disabled" : "Account enabled",
        message: customer.isActive ? "Customer can no longer sign in." : "Customer can sign in again.",
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to update status",
      });
    } finally {
      setStatusToggling(false);
    }
  };

  const handleAddNote = async (): Promise<void> => {
    if (!customer || !newNote.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ note: newNote.trim() }),
      });
      if (!res.ok) throw new Error("Failed to add note");
      const data = await res.json();
      setCustomer((prev) =>
        prev ? { ...prev, notes: [data.data, ...prev.notes] } : null
      );
      setNewNote("");
      showToast({ type: "success", title: "Note added", message: "Internal note saved." });
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to add note",
      });
    } finally {
      setAddingNote(false);
    }
  };

  const handleAction = async (
    action: "resetPassword" | "sendVerification" | "disable" | "delete"
  ): Promise<void> => {
    if (!customer) return;
    setActionMenuOpen(false);
    setActioning(true);
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Action failed");
      showToast({
        type: "success",
        title: "Done",
        message: data?.data?.message || data?.message || "Action completed.",
      });
      if (action === "disable") {
        setDisableConfirm(false);
        setCustomer((prev) => (prev ? { ...prev, isActive: false } : null));
      }
      if (action === "delete") {
        setDeleteConfirm(false);
        router.push("/admin/customers");
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Action failed",
      });
    } finally {
      setActioning(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file || !customer) return;
    e.target.value = "";
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      const url = data?.url ?? data?.data?.url;
      if (!url) throw new Error("No URL returned");
      const patchRes = await fetch(`/api/admin/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ image: url }),
      });
      if (!patchRes.ok) throw new Error("Failed to update avatar");
      setCustomer((prev) => (prev ? { ...prev, image: url } : null));
      showToast({ type: "success", title: "Avatar updated", message: "Profile image saved." });
    } catch (error) {
      showToast({
        type: "error",
        title: "Upload failed",
        message: error instanceof Error ? error.message : "Failed to update avatar",
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  if (loading && !customer) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!customer) return <div className="p-6 text-charcoal-600">Customer not found.</div>;

  return (
    <div className="space-y-6">
      {/* Back + breadcrumb */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/customers">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Link>
        </Button>
      </div>

      {/* Customer info card */}
      <div className="bg-cream-50 rounded-xl border border-cream-200 p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="relative group">
              {customer.image ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-cream-200">
                  <Image
                    src={customer.image}
                    alt={customer.name || customer.email}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              ) : (
                <div
                  className="w-24 h-24 rounded-full bg-navy-600 text-white flex items-center justify-center text-2xl font-semibold"
                  aria-hidden
                >
                  {getInitials(customer.name, customer.email)}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white"
              >
                <Upload className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-cream-200 rounded-lg text-charcoal-900"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-cream-200 rounded-lg text-charcoal-900"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-cream-200 rounded-lg text-charcoal-900"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveInfo} disabled={saving}>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditing(false);
                      setEditForm({
                        name: customer.name ?? "",
                        email: customer.email ?? "",
                        phone: customer.phone ?? "",
                      });
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <H1 className="text-2xl font-serif font-bold text-charcoal-900">
                    {customer.name || "No name"}
                  </H1>
                  <span
                    className={cn(
                      "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                      customer.isActive ? "bg-green-100 text-green-800" : "bg-charcoal-100 text-charcoal-600"
                    )}
                  >
                    {customer.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-sm text-charcoal-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    {customer.email}
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      {customer.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    Joined {format(new Date(customer.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit basic info
                  </Button>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <span className="text-sm text-charcoal-600">Account status:</span>
                    <button
                      type="button"
                      onClick={handleToggleStatus}
                      disabled={statusToggling}
                      className={cn(
                        "relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
                        customer.isActive ? "bg-green-500" : "bg-charcoal-300"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform",
                          customer.isActive ? "translate-x-5" : "translate-x-1"
                        )}
                      />
                    </button>
                    <span className="text-sm font-medium text-charcoal-700">
                      {customer.isActive ? "Active" : "Inactive"}
                    </span>
                  </label>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Analytics card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-cream-50 rounded-xl border border-cream-200 p-4">
          <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide">Lifetime value</p>
          <p className="text-xl font-bold text-charcoal-900 mt-1">
            {formatPrice(customer.analytics.totalLifetimeValue)}
          </p>
        </div>
        <div className="bg-cream-50 rounded-xl border border-cream-200 p-4">
          <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide">Avg order value</p>
          <p className="text-xl font-bold text-charcoal-900 mt-1">
            {formatPrice(customer.analytics.averageOrderValue)}
          </p>
        </div>
        <div className="bg-cream-50 rounded-xl border border-cream-200 p-4">
          <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide">Most purchased</p>
          <p className="text-sm font-semibold text-charcoal-900 mt-1 truncate">
            {customer.analytics.mostPurchasedCategory?.name ?? "—"}
          </p>
        </div>
        <div className="bg-cream-50 rounded-xl border border-cream-200 p-4">
          <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide">Last order</p>
          <p className="text-sm font-semibold text-charcoal-900 mt-1">
            {customer.analytics.lastOrderDate
              ? format(new Date(customer.analytics.lastOrderDate), "MMM d, yyyy")
              : "—"}
          </p>
        </div>
      </div>

      {/* Order history */}
      <div className="bg-cream-50 rounded-xl border border-cream-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-cream-200 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-charcoal-900 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order history
          </h2>
          <p className="text-sm text-charcoal-600">
            {customer.analytics.totalOrders} orders · {formatPrice(customer.analytics.totalLifetimeValue)} total
          </p>
        </div>
        {customer.orders.length === 0 ? (
          <div className="p-8 text-center text-charcoal-600">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-100 border-b border-cream-200">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-charcoal-900">Order</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-charcoal-900">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-charcoal-900">Total</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-charcoal-900">Status</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold text-charcoal-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {customer.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-cream-100">
                    <td className="px-4 py-3 font-medium text-charcoal-900">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-sm text-charcoal-600">
                      {format(new Date(order.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 font-semibold text-charcoal-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                          order.paymentStatus === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        )}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/orders/${order.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Addresses */}
      <AddressesSection customerId={customer.id} addresses={customer.addresses} onUpdated={() => loadCustomer(customer.id)} />

      {/* Customer notes */}
      <div className="bg-cream-50 rounded-xl border border-cream-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-cream-200">
          <h2 className="text-lg font-semibold text-charcoal-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Internal notes
          </h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <textarea
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={2}
              className="flex-1 px-3 py-2 border border-cream-200 rounded-lg text-sm text-charcoal-900 resize-none"
            />
            <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim() || addingNote}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          <ul className="space-y-2">
            {customer.notes.map((n) => (
              <li
                key={n.id}
                className="p-3 rounded-lg bg-white border border-cream-200 text-sm text-charcoal-700"
              >
                <p>{n.note}</p>
                <p className="text-xs text-charcoal-500 mt-1">
                  {n.adminUser.name} · {format(new Date(n.createdAt), "MMM d, yyyy HH:mm")}
                </p>
              </li>
            ))}
            {customer.notes.length === 0 && (
              <li className="text-sm text-charcoal-600">No notes yet.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Account actions */}
      <div className="bg-cream-50 rounded-xl border border-cream-200 p-4">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3">Account actions</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleAction("resetPassword")}
            disabled={actioning}
          >
            <Key className="w-4 h-4 mr-1" />
            Reset password
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleAction("sendVerification")}
            disabled={actioning}
          >
            <MailCheck className="w-4 h-4 mr-1" />
            Send verification email
          </Button>
          {customer.isActive && (
            <Button
              variant="secondary"
              size="sm"
              className="text-amber-700 border-amber-200 hover:bg-amber-50"
              onClick={() => setDisableConfirm(true)}
              disabled={actioning}
            >
              <UserX className="w-4 h-4 mr-1" />
              Disable account
            </Button>
          )}
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              className="text-red-700 border-red-200 hover:bg-red-50"
              onClick={() => setActionMenuOpen(!actionMenuOpen)}
              disabled={actioning}
            >
              <MoreVertical className="w-4 h-4 mr-1" />
              More
            </Button>
            {actionMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={() => setActionMenuOpen(false)}
                />
                <div className="absolute left-0 top-full mt-1 py-1 bg-white border border-cream-200 rounded-lg shadow-lg z-20 min-w-[180px]">
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-cream-100 flex items-center gap-2"
                    onClick={() => setDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete customer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={disableConfirm}
        title="Disable account"
        message="This customer will no longer be able to sign in. You can re-enable from their profile."
        confirmText="Disable"
        variant="danger"
        onConfirm={() => handleAction("disable")}
        onCancel={() => setDisableConfirm(false)}
      />
      <ConfirmDialog
        isOpen={deleteConfirm}
        title="Delete customer"
        message="This will permanently delete the customer and their notes and addresses. Orders will be kept but unlinked. This cannot be undone."
        confirmText="Delete"
        variant="danger"
        onConfirm={() => handleAction("delete")}
        onCancel={() => setDeleteConfirm(false)}
      />
    </div>
  );
}
