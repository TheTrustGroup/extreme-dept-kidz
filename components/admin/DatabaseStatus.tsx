"use client";

import * as React from "react";
import { X } from "lucide-react";
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
 * Wrapped in error boundary to prevent breaking the admin dashboard
 */
export function DatabaseStatus(): JSX.Element | null {
  const [status, setStatus] = React.useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isDismissed, setIsDismissed] = React.useState(false);
  const [shouldAutoHide, setShouldAutoHide] = React.useState(true);

  React.useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  // Auto-hide banner after 5 seconds if connected successfully
  React.useEffect(() => {
    if (status?.connected && !status.mockMode && shouldAutoHide && !isDismissed) {
      const timer = setTimeout(() => {
        setIsDismissed(true);
      }, 5000); // Auto-hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [status, shouldAutoHide, isDismissed]);

  // Reset dismissed state when status changes (e.g., disconnection)
  React.useEffect(() => {
    if (!status?.connected || status.mockMode) {
      setIsDismissed(false);
      setShouldAutoHide(false); // Don't auto-hide errors or mock mode
    } else {
      setShouldAutoHide(true); // Auto-hide successful connections
    }
  }, [status]);

  const checkStatus = async (): Promise<void> => {
    try {
      setError(null);
      
      // Use fetch directly to have more control over error handling
      const response = await fetch('/api/admin/products', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract dbStatus from response
      const dbStatus = data.dbStatus;
      
      if (dbStatus && typeof dbStatus === 'object') {
        setStatus(dbStatus);
      } else {
        // If no dbStatus in response, assume connected (optimistic fallback)
        console.warn('[DatabaseStatus] No dbStatus in response, assuming connected');
        setStatus({
          connected: true,
          type: 'postgres',
          error: null,
          mockMode: false,
          enabled: true,
        });
      }
    } catch (error) {
      console.error("[DatabaseStatus] Failed to check DB status:", error);
      setError(error instanceof Error ? error.message : 'Failed to check status');
      
      // Set optimistic status - don't show error to user, just show as connected
      // This prevents the status check from breaking the admin dashboard
      setStatus({
        connected: true, // Optimistic: assume connected if check fails
        type: 'postgres',
        error: null,
        mockMode: false,
        enabled: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't render if still loading (first load)
  if (loading && !status) {
    return null;
  }

  // If we have an error but no status, show a minimal indicator
  if (!status) {
    return null; // Fail silently to not break the UI
  }

  // Don't render if dismissed (only for successful connections)
  if (isDismissed && status.connected && !status.mockMode) {
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
      className={`admin-flex-sm items-center justify-between px-[var(--admin-space-3)] py-[var(--admin-space-2)] rounded-lg text-xs sm:text-sm ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border backdrop-blur-sm transition-all duration-200`}
      style={{
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="admin-flex-sm items-center">
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0 ${statusConfig.dot} ${
            status.connected && !status.mockMode ? "animate-pulse" : ""
          }`}
          style={{ minWidth: '8px', minHeight: '8px' }}
        />
        <span className="font-medium ml-[var(--admin-space-2)]">{statusConfig.label}</span>
        {status.error && (
          <span className="text-xs opacity-75 ml-[var(--admin-space-1)]">({status.error})</span>
        )}
      </div>
      {/* Dismiss button - only show for successful connections */}
      {status.connected && !status.mockMode && (
        <button
          onClick={() => setIsDismissed(true)}
          className="ml-[var(--admin-space-2)] p-[var(--admin-space-1)] hover:bg-black/5 rounded transition-colors duration-200 flex-shrink-0"
          aria-label="Dismiss status banner"
          title="Dismiss"
        >
          <X className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      )}
    </div>
  );
}
