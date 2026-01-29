"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  Save,
  X,
  Printer,
  Mail,
  FileText,
  RotateCcw,
  Trash2,
  MessageSquare,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { H1 } from "@/components/ui/typography";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAdminBreadcrumb } from "@/components/admin/AdminBreadcrumbContext";
import { usePathname } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FloatingTextarea } from "@/components/ui/floating-input";

interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    images: Array<{ url: string; alt: string | null }>;
  };
  variant: {
    id: string;
    size: string;
    color: string | null;
    sku: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: any;
  billingAddress: any;
  paymentMethod: string;
  paymentStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
  trackingNumber: string | null;
  carrier: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  cancelledReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    email: string;
    name: string | null;
  } | null;
  items: OrderItem[];
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const breadcrumb = useAdminBreadcrumb();
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editingStatus, setEditingStatus] = React.useState(false);
  const [status, setStatus] = React.useState<string>("");
  const [trackingNumber, setTrackingNumber] = React.useState("");
  const [carrier, setCarrier] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [resolvedParams, setResolvedParams] = React.useState<{ id: string } | null>(null);
  const [cancelConfirm, setCancelConfirm] = React.useState(false);
  const [refundConfirm, setRefundConfirm] = React.useState(false);
  const [orderNote, setOrderNote] = React.useState("");
  const [addingNote, setAddingNote] = React.useState(false);
  const [orderNotes, setOrderNotes] = React.useState<Array<{ id: string; note: string; createdAt: Date; isCustomerFacing: boolean }>>([]);

  React.useEffect(() => {
    params.then(p => {
      setResolvedParams(p);
    });
  }, [params]);

  React.useEffect(() => {
    if (!resolvedParams) return;

    const orderId = resolvedParams.id;

    async function loadOrder(): Promise<void> {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/orders/${orderId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 404) {
            showToast({
              type: "error",
              title: "Order Not Found",
              message: "The order you're looking for doesn't exist",
            });
            router.push('/admin/orders');
            return;
          }
          throw new Error('Failed to fetch order');
        }

        const data = await response.json();
        const orderData = data.data;
        setOrder(orderData);
        setStatus(orderData.status);
        setTrackingNumber(orderData.trackingNumber || '');
        setCarrier(orderData.carrier || '');
        
        // Update breadcrumb with order number
        if (breadcrumb && pathname && orderData.orderNumber) {
          breadcrumb.setDynamicLabel(pathname, `Order ${orderData.orderNumber}`);
        }
      } catch (error) {
        console.error("Failed to load order:", error);
        showToast({
          type: "error",
          title: "Error",
          message: "Failed to load order details",
        });
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [resolvedParams, router, showToast, breadcrumb, pathname]);

  const handleStatusUpdate = async (): Promise<void> => {
    if (!order) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status,
          trackingNumber: trackingNumber || undefined,
          carrier: carrier || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update order');
      }

      const data = await response.json();
      setOrder(data.data);
      setEditingStatus(false);

      showToast({
        type: "success",
        title: "Order Updated",
        message: `Order status updated to ${status}`,
      });
    } catch (error) {
      console.error("Failed to update order:", error);
      showToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to update order",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelOrder = async (): Promise<void> => {
    if (!order) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'CANCELLED',
          cancelledReason: 'Cancelled by admin',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      const data = await response.json();
      setOrder(data.data);
      setCancelConfirm(false);

      showToast({
        type: "success",
        title: "Order Cancelled",
        message: "Order has been cancelled successfully",
      });
    } catch (error) {
      console.error("Failed to cancel order:", error);
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to cancel order",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async (): Promise<void> => {
    if (!order || !orderNote.trim()) return;

    setAddingNote(true);
    try {
      // TODO: Implement API endpoint for order notes
      // For now, just add to local state
      setOrderNotes([
        ...orderNotes,
        {
          id: Date.now().toString(),
          note: orderNote,
          createdAt: new Date(),
          isCustomerFacing: false,
        },
      ]);
      setOrderNote("");
      setAddingNote(false);

      showToast({
        type: "success",
        title: "Note Added",
        message: "Order note has been added",
      });
    } catch (error) {
      console.error("Failed to add note:", error);
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to add note",
      });
      setAddingNote(false);
    }
  };

  const handleSendTracking = async (): Promise<void> => {
    if (!order || !order.trackingNumber) {
      showToast({
        type: "info",
        title: "No Tracking Number",
        message: "Please add a tracking number before sending",
      });
      return;
    }

    // TODO: Implement email sending
    showToast({
      type: "info",
      title: "Coming Soon",
      message: "Send tracking email feature will be available soon",
    });
  };

  const handlePrintInvoice = (): void => {
    if (!order) return;
    window.open(`/admin/orders/${order.id}/invoice`, "_blank");
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

  const getPaymentStatusColor = (status: string): string => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
      case "PARTIALLY_REFUNDED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return CheckCircle2;
      case "CANCELLED":
      case "REFUNDED":
        return XCircle;
      default:
        return Clock;
    }
  };

  // Order timeline
  const getTimelineSteps = () => {
    if (!order) return [];

    const steps = [
      {
        label: "Order Placed",
        status: "completed",
        date: order.createdAt,
        icon: Package,
      },
      {
        label: "Payment",
        status: order.paymentStatus === "COMPLETED" ? "completed" : order.paymentStatus === "FAILED" ? "error" : "pending",
        date: order.paymentStatus === "COMPLETED" ? order.createdAt : null,
        icon: CreditCard,
      },
      {
        label: "Processing",
        status: ["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status) ? "completed" : order.status === "CANCELLED" ? "error" : "pending",
        date: order.status === "PROCESSING" ? order.updatedAt : null,
        icon: Clock,
      },
      {
        label: "Shipped",
        status: ["SHIPPED", "DELIVERED"].includes(order.status) ? "completed" : order.status === "CANCELLED" ? "error" : "pending",
        date: order.shippedAt,
        icon: Truck,
      },
      {
        label: "Delivered",
        status: order.status === "DELIVERED" ? "completed" : order.status === "CANCELLED" ? "error" : "pending",
        date: order.deliveredAt,
        icon: CheckCircle2,
      },
    ];

    return steps;
  };

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading order details...</div>
      </div>
    );
  }

  const timelineSteps = getTimelineSteps();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <H1 className="text-3xl font-bold text-gray-900 mb-2">
              Order {order.orderNumber}
            </H1>
            <p className="text-gray-600 text-sm">
              Placed on {format(new Date(order.createdAt), 'PPp')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handlePrintInvoice}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Invoice
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push(`/admin/orders/${order.id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Order
          </Button>
        </div>
      </div>

      {/* Order Information Card */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Order Status</h3>
            <div className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full", 
                order.status === "DELIVERED" ? "bg-green-500" :
                order.status === "CANCELLED" || order.status === "REFUNDED" ? "bg-red-500" :
                "bg-yellow-500"
              )} />
              <span className={cn("px-3 py-1 rounded-full text-sm font-semibold", getStatusColor(order.status))}>
                {order.status}
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Status</h3>
            <div className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full",
                order.paymentStatus === "COMPLETED" ? "bg-green-500" :
                order.paymentStatus === "FAILED" ? "bg-red-500" :
                "bg-yellow-500"
              )} />
              <span className={cn("px-3 py-1 rounded-full text-sm font-semibold", getPaymentStatusColor(order.paymentStatus))}>
                {order.paymentStatus === "COMPLETED" ? "Paid" : order.paymentStatus}
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Amount</h3>
            <p className="text-2xl font-bold text-gray-900">{formatPrice(order.total)}</p>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Order Timeline</h3>
          <div className="relative">
            {timelineSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = step.status === "completed";
              const isError = step.status === "error";
              const isLast = index === timelineSteps.length - 1;

              return (
                <div key={index} className="relative flex items-start gap-4 pb-6">
                  {!isLast && (
                    <div className={cn(
                      "absolute left-5 top-10 w-0.5 h-full",
                      isCompleted ? "bg-green-500" : isError ? "bg-red-500" : "bg-gray-200"
                    )} />
                  )}
                  <div className={cn(
                    "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2",
                    isCompleted ? "bg-green-500 border-green-500 text-white" :
                    isError ? "bg-red-500 border-red-500 text-white" :
                    "bg-white border-gray-300 text-gray-400"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "font-medium",
                      isCompleted ? "text-green-700" : isError ? "text-red-700" : "text-gray-500"
                    )}>
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-sm text-gray-500">
                        {format(new Date(step.date), 'PPp')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Update Section */}
        {!editingStatus ? (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => setEditingStatus(true)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Update Status
            </Button>
          </div>
        ) : (
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fulfillment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            {status === 'SHIPPED' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter tracking number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carrier
                  </label>
                  <select
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select carrier</option>
                    <option value="usps">USPS</option>
                    <option value="ups">UPS</option>
                    <option value="fedex">FedEx</option>
                    <option value="dhl">DHL</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleStatusUpdate}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setEditingStatus(false);
                  setStatus(order.status);
                  setTrackingNumber(order.trackingNumber || '');
                  setCarrier(order.carrier || '');
                }}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Items */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Products Ordered
          </h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <m.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {item.product.images[0] && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.images[0].alt || item.product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-gray-600">
                    Size: {item.variant.size}
                    {item.variant.color && ` • Color: ${item.variant.color}`}
                  </p>
                  <p className="text-sm text-gray-600">SKU: {item.variant.sku}</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </m.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-900">{formatPrice(order.shipping)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Customer & Payment Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </h3>
              {order.user && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-xs"
                >
                  <Link href={`/admin/customers/${order.user.id}`}>
                    View Profile
                  </Link>
                </Button>
              )}
            </div>
            {order.user ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium text-gray-700">Name:</span>{' '}
                  <span className="text-gray-900">{order.user.name || 'N/A'}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-700">Email:</span>{' '}
                  <a href={`mailto:${order.user.email}`} className="text-indigo-600 hover:underline">
                    {order.user.email}
                  </a>
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Guest checkout</p>
            )}
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Shipping Address
            </h3>
            {order.shippingAddress && typeof order.shippingAddress === 'object' ? (
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">
                  {order.shippingAddress.name || 'N/A'}
                </p>
                <p>{order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No shipping address available</p>
            )}
          </div>

          {/* Billing Address */}
          {order.billingAddress && typeof order.billingAddress === 'object' && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing Address
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">
                  {order.billingAddress.name || 'N/A'}
                </p>
                <p>{order.billingAddress.address1}</p>
                {order.billingAddress.address2 && <p>{order.billingAddress.address2}</p>}
                <p>
                  {order.billingAddress.city}, {order.billingAddress.state}{' '}
                  {order.billingAddress.postalCode}
                </p>
                <p>{order.billingAddress.country}</p>
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Information
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium text-gray-700">Method:</span>{' '}
                <span className="text-gray-900 capitalize">{order.paymentMethod}</span>
              </p>
              <p>
                <span className="font-medium text-gray-700">Status:</span>{' '}
                <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getPaymentStatusColor(order.paymentStatus))}>
                  {order.paymentStatus === "COMPLETED" ? "Paid" : order.paymentStatus}
                </span>
              </p>
              {order.trackingNumber && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="font-medium text-gray-700 mb-1">Tracking Information</p>
                  <p className="text-gray-900">{order.trackingNumber}</p>
                  {order.carrier && (
                    <p className="text-xs text-gray-500 mt-1">Carrier: {order.carrier.toUpperCase()}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Notes */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Order Notes
          </h3>
        </div>
        <div className="space-y-4">
          {orderNotes.length > 0 ? (
            <div className="space-y-3">
              {orderNotes.map((note) => (
                <div key={note.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-gray-900">{note.note}</p>
                    <span className="text-xs text-gray-500">
                      {format(new Date(note.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No notes added yet</p>
          )}
          <div className="flex gap-2">
            <FloatingTextarea
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              label="Add order note"
              rows={2}
              className="flex-1"
            />
            <Button
              variant="primary"
              onClick={handleAddNote}
              disabled={!orderNote.trim() || addingNote}
              className="self-end"
            >
              {addingNote ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Note
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Order Actions */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={handleSendTracking}
            disabled={!order.trackingNumber}
            className="flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Send Tracking Information
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push(`/admin/orders/${order.id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Order
          </Button>
          <Button
            variant="secondary"
            onClick={() => setRefundConfirm(true)}
            disabled={order.paymentStatus === "REFUNDED"}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Process Refund
          </Button>
          <Button
            variant="ghost"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
            onClick={() => setCancelConfirm(true)}
            disabled={order.status === "CANCELLED" || order.status === "REFUNDED"}
          >
            <Trash2 className="w-4 h-4" />
            Cancel Order
          </Button>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={cancelConfirm}
        title="Cancel Order"
        message={
          <div>
            <p className="mb-2">Are you sure you want to cancel order {order.orderNumber}?</p>
            <p className="text-sm text-gray-600">This action cannot be undone. The customer will be notified.</p>
          </div>
        }
        confirmText="Cancel Order"
        cancelText="Keep Order"
        variant="danger"
        onConfirm={handleCancelOrder}
        onCancel={() => setCancelConfirm(false)}
      />

      <ConfirmDialog
        isOpen={refundConfirm}
        title="Process Refund"
        message={
          <div>
            <p className="mb-2">Process a refund for order {order.orderNumber}?</p>
            <p className="text-sm text-gray-600">Refund amount: {formatPrice(order.total)}</p>
          </div>
        }
        confirmText="Process Refund"
        cancelText="Cancel"
        onConfirm={() => {
          // TODO: Implement refund processing
          showToast({
            type: "info",
            title: "Coming Soon",
            message: "Refund processing will be available soon",
          });
          setRefundConfirm(false);
        }}
        onCancel={() => setRefundConfirm(false)}
      />
    </div>
  );
}
