"use client";

import * as React from "react";
import { m } from "framer-motion";
import { Download, FileText, DollarSign, Package, AlertTriangle, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { apiUrl } from "@/lib/config/api-base";

interface ReportData {
  type: 'valuation' | 'movement' | 'lowStock' | 'slowMoving';
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  data: any[];
  loading?: boolean;
}

interface InventoryReportsProps {
  onGenerateReport?: (type: string) => void;
}

export function InventoryReports({ onGenerateReport }: InventoryReportsProps): JSX.Element {
  const [activeReport, setActiveReport] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const reports: Array<{
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = [
    {
      id: 'valuation',
      title: 'Stock Valuation Report',
      description: 'Total inventory value by category and product',
      icon: DollarSign,
      color: 'from-indigo-500 to-purple-600',
    },
    {
      id: 'movement',
      title: 'Stock Movement Report',
      description: 'All stock changes in the selected period',
      icon: TrendingDown,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      id: 'lowStock',
      title: 'Low Stock Report',
      description: 'Items below reorder point requiring attention',
      icon: AlertTriangle,
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 'slowMoving',
      title: 'Slow-Moving Inventory',
      description: 'Products with no sales in the selected period',
      icon: Package,
      color: 'from-gray-500 to-slate-600',
    },
  ];

  const handleGenerateReport = async (reportId: string): Promise<void> => {
    setLoading(true);
    setActiveReport(reportId);

    try {
      // Call API to generate report
      const response = await fetch(apiUrl(`/api/admin/inventory/reports/${reportId}`), {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportId}-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      if (onGenerateReport) {
        onGenerateReport(reportId);
      }
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setLoading(false);
      setActiveReport(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Inventory Reports</h2>
        <p className="text-gray-600 text-sm">
          Generate and export comprehensive inventory reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, index) => {
          const Icon = report.icon;
          const isGenerating = activeReport === report.id && loading;

          return (
            <m.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "p-3 rounded-xl bg-gradient-to-br",
                  report.color
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {report.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {report.description}
              </p>

              <Button
                onClick={() => handleGenerateReport(report.id)}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </m.div>
          );
        })}
      </div>

      {/* Report Preview/Info */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Report Information</h3>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Reports are generated in CSV format for easy import into Excel</p>
          <p>• All reports include timestamps and can be filtered by date range</p>
          <p>• Reports are generated on-demand and include current inventory data</p>
          <p>• Large reports may take a few moments to generate</p>
        </div>
      </div>
    </div>
  );
}
