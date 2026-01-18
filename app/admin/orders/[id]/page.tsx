"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { H1 } from "@/components/ui/typography";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  const { showToast } = useToast();
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editingStatus, setEditingStatus] = React.useState(false);
  const [status, setStatus] = React.useState<string>("");
  const [trackingNumber, setTrackingNumber] = React.useState("");
  const [carrier, setCarrier] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [resolvedParams, setResolvedParams] = React.useState<{ id: string } | null>(null);

  React.useEffect(() => {
    params.then(p => {
      setResolvedParams(p);
    });
  }, [params]);

  React.useEffect(() => {
    if (!resolvedParams) return;

    const orderId = resolvedParams.id; // Store id before async function to avoid null check issues

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
  }, [resolvedParams, router, showToast]);

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

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading order details...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex-1">
          <H1 className="text-3xl font-bold text-gray-900 mb-2">
            Order {order.orderNumber}
          </H1>
          <p className="text-gray-600 text-sm">
            Placed on {format(new Date(order.createdAt), 'PPp')}
          </p>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {(() => {
              const Icon = getStatusIcon(order.status);
              return <Icon className="w-6 h-6 text-gray-600" />;
            })()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
              <p className="text-sm text-gray-600">Current order status and tracking</p>
            </div>
          </div>
          {!editingStatus && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingStatus(true)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Update Status
            </Button>
          )}
        </div>

        {editingStatus ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
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
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={cn(
                "px-4 py-2 rounded-lg font-semibold text-sm",
                getStatusColor(order.status)
              )}>
                {order.status}
              </span>
            </div>

            {order.trackingNumber && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="w-4 h-4" />
                <span>Tracking: {order.trackingNumber}</span>
                {order.carrier && <span>({order.carrier.toUpperCase()})</span>}
              </div>
            )}

            {order.shippedAt && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Shipped: {format(new Date(order.shippedAt), 'PPp')}</span>
              </div>
            )}

            {order.deliveredAt && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Delivered: {format(new Date(order.deliveredAt), 'PPp')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Items */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order Items
          </h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <m.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
              >
                {item.product.images[0] && (
                  <img
                    src={item.product.images[0].url}
                    alt={item.product.images[0].alt || item.product.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
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

        {/* Customer & Shipping Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </h3>
            {order.user ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium text-gray-700">Name:</span>{' '}
                  <span className="text-gray-900">{order.user.name || 'N/A'}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-700">Email:</span>{' '}
                  <span className="text-gray-900">{order.user.email}</span>
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
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  order.paymentStatus === 'COMPLETED' && "bg-green-100 text-green-800",
                  order.paymentStatus === 'PENDING' && "bg-yellow-100 text-yellow-800",
                  order.paymentStatus === 'FAILED' && "bg-red-100 text-red-800",
                  order.paymentStatus === 'REFUNDED' && "bg-gray-100 text-gray-800"
                )}>
                  {order.paymentStatus}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
