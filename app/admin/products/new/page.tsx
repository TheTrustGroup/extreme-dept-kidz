"use client";

import * as React from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProductForm } from "@/components/admin/ProductForm";

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
      <div>
        <h1 className="text-3xl font-bold text-charcoal-900 mb-8">Add New Product</h1>
        <ProductForm />
      </div>
    </ErrorBoundary>
  );
}
