"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { formatPrice, cn } from "@/lib/utils";

const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then((m) => m.Area), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), {
  ssr: false,
});
import { format, parseISO } from "date-fns";

interface RevenueDataPoint {
  date: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  loading?: boolean;
}

export function RevenueChart({ data, loading = false }: RevenueChartProps): JSX.Element {
  const [chartType, setChartType] = React.useState<'line' | 'area'>('area');

  const chartData = React.useMemo(() => {
    return data.map(point => ({
      date: format(parseISO(point.date), 'MMM d'),
      revenue: point.revenue / 100, // Convert from cents
      fullDate: point.date,
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload }: any): JSX.Element | null => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            {payload[0].payload.fullDate && format(parseISO(payload[0].payload.fullDate), 'PP')}
          </p>
          <p className="text-sm text-indigo-600">
            Revenue: <span className="font-bold">{formatPrice(payload[0].value * 100)}</span>
          </p>
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
          <p className="text-gray-600">No revenue data available</p>
          <p className="text-sm text-gray-500 mt-1">Revenue data will appear here once orders are placed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Over Time</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('area')}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
              chartType === 'area'
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            Area
          </button>
          <button
            onClick={() => setChartType('line')}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
              chartType === 'line'
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            Line
          </button>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₵${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#4f46e5"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₵${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ fill: "#4f46e5", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
