"use client";

import * as React from "react";
import { H1 } from "@/components/ui/typography";
import { ProductFormComprehensive } from "@/components/admin/ProductFormComprehensive";
import { useAdminBreadcrumb } from "@/components/admin/AdminBreadcrumbContext";
import { usePathname } from "next/navigation";

export interface ProductFormInitialData {
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  barcode?: string;
  status: "active" | "draft" | "archived";
  visibleOnStore: boolean;
  price: number;
  salePrice?: number;
  costPerItem?: number;
  trackInventory: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  allowBackorders: boolean;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  categoryId: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  slug: string;
  images: string[];
  variants: { size: string; stock: number }[];
}

interface ProductEditClientProps {
  productId: string | undefined;
  initialData: ProductFormInitialData | null;
  onSuccess?: () => void;
  skipRedirectAfterSave?: boolean;
}

/**
 * Client wrapper for product edit/create.
 * Receives server-fetched initialData so the form is never blank on edit.
 */
export function ProductEditClient({
  productId,
  initialData,
  onSuccess,
  skipRedirectAfterSave,
}: ProductEditClientProps): JSX.Element {
  const pathname = usePathname();
  const breadcrumb = useAdminBreadcrumb();
  const isNew = !productId || productId === "new";

  React.useEffect(() => {
    if (breadcrumb && pathname && initialData?.name) {
      breadcrumb.setDynamicLabel(pathname, initialData.name);
    }
  }, [breadcrumb, pathname, initialData?.name]);

  return (
    <div className="space-y-6">
      <div>
        <H1 className="text-charcoal-900 text-3xl font-bold mb-2">
          {isNew ? "Create Product" : "Edit Product"}
        </H1>
        <p className="text-charcoal-600 text-sm">
          {isNew ? "Add a new product to your catalog" : "Update product information"}
        </p>
      </div>

      <ProductFormComprehensive
        productId={isNew ? undefined : productId}
        initialData={initialData ?? undefined}
        onSuccess={onSuccess}
        skipRedirectAfterSave={skipRedirectAfterSave}
      />
    </div>
  );
}
