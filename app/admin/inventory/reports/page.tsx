"use client";

import { InventoryReports } from "@/components/admin/inventory/InventoryReports";
import { H1 } from "@/components/ui/typography";
import { useToast } from "@/components/ui/Toast";

export default function ReportsPage(): JSX.Element {
  const { showToast } = useToast();

  const handleGenerateReport = (reportId: string): void => {
    showToast({
      type: "success",
      title: "Report Generated",
      message: `${reportId} report downloaded successfully`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <H1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Reports</H1>
        <p className="text-gray-600 text-sm">
          Generate and export comprehensive inventory reports
        </p>
      </div>

      <InventoryReports onGenerateReport={handleGenerateReport} />
    </div>
  );
}
