"use client";

import * as React from "react";
import { StockForecastChart, type StockForecast } from "@/components/admin/inventory/StockForecastChart";
import { H1 } from "@/components/ui/typography";

export default function ForecastPage(): JSX.Element {
  const [forecasts, setForecasts] = React.useState<StockForecast[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadForecasts(): Promise<void> {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/inventory/forecast', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch forecasts');
        }

        const data = await response.json();
        setForecasts(data.data || []);
      } catch (error) {
        console.error("Failed to load forecasts:", error);
      } finally {
        setLoading(false);
      }
    }

    loadForecasts();
  }, []);

  const handleVariantClick = React.useCallback((variantId: string) => {
    // Navigate to variant detail or open edit modal
    console.log("Variant clicked:", variantId);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <H1 className="text-3xl font-bold text-gray-900 mb-2">Stock Forecast</H1>
        <p className="text-gray-600 text-sm">
          Predictions based on sales velocity and historical data
        </p>
      </div>

      <StockForecastChart
        forecasts={forecasts}
        loading={loading}
        onVariantClick={handleVariantClick}
      />
    </div>
  );
}
