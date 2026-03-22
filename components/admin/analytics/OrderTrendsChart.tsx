"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { format, parseISO } from "date-fns";

const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), {
  ssr: false,
});

interface OrderTrendDataPoint {
  date: string;
  orders: number;
  revenue: number;
}

interface OrderTrendsChartProps {
  data: OrderTrendDataPoint[];
  loading?: boolean;
}

export function OrderTrendsChart({ data, loading = false }: OrderTrendsChartProps): JSX.Element {
  const chartData = React.useMemo(() => {
    return data.map(point => ({
      date: format(parseISO(point.date), 'MMM d'),
      orders: point.orders,
      revenue: point.revenue / 100, // Convert from cents
      fullDate: point.date,
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload }: any): JSX.Element | null => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            {payload[0].payload.fullDate && format(parseISO(payload[0].payload.fullDate), 'PP')}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === 'orders' ? 'Orders' : 'Revenue'}:{' '}
              <span className="font-bold">
                {entry.name === 'orders' ? entry.value : `₵${entry.value.toFixed(2)}`}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-gray-600">Loading chart data...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-gray-600">No order data available</p>
          <p className="text-sm text-gray-500 mt-1">Order trends will appear here once orders are placed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Order Trends</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₵${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="orders"
              fill="#3b82f6"
              name="Orders"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="revenue"
              fill="#10b981"
              name="Revenue (₵)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
