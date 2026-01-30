"use client";

import * as React from "react";
import { H1 } from "@/components/ui/typography";
import { ProductFormComprehensive } from "@/components/admin/ProductFormComprehensive";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/**
 * New Product Page
 * 
 * Uses ProductFormComprehensive for unified product creation/editing experience.
 */
export default function NewProductPage(): JSX.Element {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Product Form</h2>
          <p className="text-red-700 mb-4">There was an error loading the product form. Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <H1 className="text-gray-900 text-3xl font-bold mb-2">
            Create Product
          </H1>
          <p className="text-gray-600 text-sm">
            Add a new product to your catalog
          </p>
        </div>
        <ProductFormComprehensive />
      </div>
    </ErrorBoundary>
  );
}
