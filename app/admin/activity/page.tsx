"use client";

import * as React from "react";
import { FileText, Filter, Download, RefreshCw } from "lucide-react";
import { H1 } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ActivityLogTable } from "@/components/admin/ActivityLogTable";
import { ActivityLogFilters } from "@/components/admin/ActivityLogFilters";

interface ActivityLog {
  id: string;
  action: string;
  resource: string | null;
  resourceId: string | null;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  adminUser: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface ActivityLogsResponse {
  logs: ActivityLog[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Activity Log Page
 * 
 * View and filter admin activity logs for audit trails.
 * Requires admin or super_admin role.
 */
export default function ActivityLogPage(): JSX.Element {
  const [logs, setLogs] = React.useState<ActivityLog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState({
    action: "",
    resource: "",
    adminUserId: "",
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = React.useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  });

  const loadLogs = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.action) params.set('action', filters.action);
      if (filters.resource) params.set('resource', filters.resource);
      if (filters.adminUserId) params.set('adminUserId', filters.adminUserId);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);
      
      params.set('limit', pagination.limit.toString());
      params.set('offset', pagination.offset.toString());

      const response = await fetch(`/api/admin/activity?${params.toString()}`, {
        credentials: 'include', // Include cookies for authentication
      });
      const data: { success: boolean; data: ActivityLogsResponse } = await response.json();

      if (data.success && data.data) {
        setLogs(data.data.logs);
        setPagination(data.data.pagination);
      } else {
        console.error('Failed to load activity logs:', data);
      }
    } catch (error) {
      console.error('Error loading activity logs:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, pagination.offset]);

  React.useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, offset: 0 })); // Reset to first page
  };

  const handlePageChange = (newOffset: number) => {
    setPagination(prev => ({ ...prev, offset: newOffset }));
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      
      const response = await fetch(`/api/admin/activity/export?${params.toString()}`, {
        credentials: 'include', // Include cookies for authentication
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <H1 className="text-gray-900 text-2xl sm:text-3xl font-bold mb-2">
            Activity Log
          </H1>
          <p className="text-gray-600 text-xs sm:text-sm">
            Audit trail of all admin actions and changes
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            variant="secondary"
            onClick={() => loadLogs()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ActivityLogFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Activity Log Table */}
      <ActivityLogTable
        logs={logs}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
