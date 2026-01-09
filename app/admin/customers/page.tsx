"use client";

import * as React from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { H1 } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Customers Management Page
 * 
 * View and manage all customers.
 */
export default function CustomersPage(): JSX.Element {
  interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    orders: number;
    spent: number;
    memberSince: string;
  }

  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Mock customer data
    setCustomers([
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        phone: "+1 555-1234",
        orders: 12,
        spent: 2450,
        memberSince: "2023-01-15",
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+1 555-5678",
        orders: 5,
        spent: 890,
        memberSince: "2024-01-01",
      },
    ]);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <H1 className="text-charcoal-900 text-3xl font-serif font-bold">Customers</H1>
      </div>

      {/* Customers Table */}
      <div className="bg-cream-50 rounded-xl border border-cream-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-charcoal-400 mx-auto mb-4" />
            <p className="text-charcoal-600">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-100 border-b border-cream-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900">Orders</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900">Total Spent</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900">Member Since</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-charcoal-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-cream-100 transition-colors">
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="font-semibold text-navy-900 hover:text-navy-700"
                      >
                        {customer.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-sm text-charcoal-600">{customer.email}</td>
                    <td className="px-4 py-4 text-sm text-charcoal-600">{customer.phone}</td>
                    <td className="px-4 py-4 text-sm text-charcoal-900">{customer.orders}</td>
                    <td className="px-4 py-4 font-semibold text-charcoal-900">
                      {formatPrice(customer.spent * 100)}
                    </td>
                    <td className="px-4 py-4 text-sm text-charcoal-600">{customer.memberSince}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/customers/${customer.id}`}>View</Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
