"use client";

import * as React from "react";
import { CustomersTable } from "@/components/admin/customers/CustomersTable";
import { H1 } from "@/components/ui/typography";

/**
 * Customers Management Page
 *
 * Table with filters (All, Active, Inactive, High Value, New), search,
 * and actions (View, Edit, Disable). Data from /api/admin/customers.
 */
export default function CustomersPage(): JSX.Element {
  const [refreshKey, setRefreshKey] = React.useState(0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <H1 className="text-charcoal-900 text-3xl font-serif font-bold">
            Customers
          </H1>
          <p className="text-charcoal-600 text-sm mt-1">
            View and manage customer accounts, orders, and addresses
          </p>
        </div>
      </div>

      <CustomersTable key={refreshKey} onRefresh={() => setRefreshKey((k) => k + 1)} />
    </div>
  );
}
