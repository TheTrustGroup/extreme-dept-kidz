"use client";

import * as React from "react";
import { api } from "@/lib/utils/api-client";

interface DatabaseStatus {
  connected: boolean;
  type: string;
  error: string | null;
  mockMode: boolean;
  enabled: boolean;
}

/**
 * Database Status Indicator
 * 
 * Shows the current database connection status in the admin panel
 */
export function DatabaseStatus(): JSX.Element | null {
  const [status, setStatus] = React.useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async (): Promise<void> => {
    try {
      const response = await api.get<{ dbStatus: DatabaseStatus }>('/api/admin/products');
      if (response.dbStatus) {
        setStatus(response.dbStatus);
      }
    } catch (error) {
      console.error("Failed to check DB status:", error);
      // Set mock mode on error
      setStatus({
        connected: false,
        type: 'unknown',
        error: 'Failed to check status',
        mockMode: true,
        enabled: false,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !status) {
    return null;
  }

  const statusConfig = status.mockMode
    ? {
        bg: "bg-yellow-50",
        text: "text-yellow-800",
        border: "border-yellow-200",
        dot: "bg-yellow-500",
        label: "⚠️ Mock Mode (No Database)",
      }
    : status.connected
    ? {
        bg: "bg-green-50",
        text: "text-green-800",
        border: "border-green-200",
        dot: "bg-green-500",
        label: `✅ ${status.type} Connected`,
      }
    : {
        bg: "bg-red-50",
        text: "text-red-800",
        border: "border-red-200",
        dot: "bg-red-500",
        label: "❌ Database Disconnected",
      };

  return (
    <div
      className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}
    >
      <div
        className={`w-2 h-2 rounded-full ${statusConfig.dot} ${
          status.connected && !status.mockMode ? "animate-pulse" : ""
        }`}
      />
      <span className="font-medium">{statusConfig.label}</span>
      {status.error && (
        <span className="text-xs opacity-75">({status.error})</span>
      )}
    </div>
  );
}
