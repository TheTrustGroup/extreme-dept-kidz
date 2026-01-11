'use client';

import { useState } from 'react';
import { Search, Package, CheckCircle2, Clock, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

interface OrderStatus {
  id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  location?: string;
  description: string;
}

interface Order {
  id: string;
  orderNumber: string;
  email: string;
  status: string;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  shipping: {
    address: string;
    method: string;
    trackingNumber?: string;
  };
  timeline: OrderStatus[];
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/orders/track?number=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`
      );
      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.error || 'Order not found');
        setOrder(null);
      }
    } catch (error) {
      setError('Failed to track order. Please try again.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-blue-500" />;
      case 'processing':
        return <Package className="w-6 h-6 text-yellow-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen py-12 bg-cream-50">
      <Container size="lg">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-serif font-bold mb-2 text-center">Track Your Order</h1>
          <p className="text-center text-gray-600 mb-8">
            Enter your order number and email to track your shipment
          </p>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Order Number *</label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., ORD-12345"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Search className="w-4 h-4 mr-2 animate-spin" />
                    Tracking...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Track Order
                  </>
                )}
              </Button>
            </form>
          </div>

          {order && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
              {/* Order Header */}
              <div className="border-b pb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Order #{order.orderNumber}</h2>
                    <p className="text-sm text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Order Timeline */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
                <div className="space-y-4">
                  {order.timeline.map((status, index) => (
                    <div key={status.id} className="flex gap-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(status.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold">{status.description}</span>
                          <span className="text-sm text-gray-600">{status.date}</span>
                        </div>
                        {status.location && (
                          <p className="text-sm text-gray-600">{status.location}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm font-semibold">${(item.price / 100).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Info */}
              {order.shipping && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Address:</strong> {order.shipping.address}</p>
                    <p><strong>Method:</strong> {order.shipping.method}</p>
                    {order.shipping.trackingNumber && (
                      <p><strong>Tracking Number:</strong> {order.shipping.trackingNumber}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
