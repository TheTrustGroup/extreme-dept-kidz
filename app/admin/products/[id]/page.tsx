"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { H1 } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/button";
import { ProductFormComprehensive } from "@/components/admin/ProductFormComprehensive";
import { useAdminBreadcrumb } from "@/components/admin/AdminBreadcrumbContext";
import { usePathname } from "next/navigation";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";

/**
 * Product Edit/Create Page
 *
 * Comprehensive product form with all sections and auto-save functionality.
 */
export default function ProductEditPage(): JSX.Element {
  const params = useParams();
  const pathname = usePathname();
  const breadcrumb = useAdminBreadcrumb();
  const productId = (params?.id as string) || "";
  const isNew = productId === "new";
  const [loading, setLoading] = React.useState(!isNew);
  const [productData, setProductData] = React.useState<any>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const loadProduct = React.useCallback(async () => {
    if (isNew || !productId) return;
    setLoadError(null);
    setLoading(true);
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout so page doesn't stall
    try {
      const res = await fetch(`${base}/api/admin/products/${productId}`, {
        credentials: "include",
        signal: controller.signal,
      });
      if (timeoutId) clearTimeout(timeoutId);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setLoadError(err?.error || `Failed to load product (${res.status})`);
        setLoading(false);
        return;
      }
      const data = await res.json();
      const product = data.data || data;

      const formData = {
        name: product.name || "",
        description: product.description || "",
        shortDescription: product.metadata?.shortDescription || "",
        sku: product.sku || "",
        barcode: product.metadata?.barcode || "",
        status: product.inStock ? "active" : "draft",
        visibleOnStore: product.visibleOnStore !== false,
        price: product.price ? product.price / 100 : 0,
        salePrice: product.originalPrice ? product.originalPrice / 100 : undefined,
        costPerItem: product.metadata?.costPerItem || undefined,
        trackInventory: product.metadata?.trackInventory !== false,
        stockQuantity: product.sizes?.reduce((sum: number, size: any) => sum + (size.quantity || 0), 0) || 0,
        lowStockThreshold: product.metadata?.lowStockThreshold || 10,
        allowBackorders: product.metadata?.allowBackorders || false,
        weight: product.weight || undefined,
        length: product.dimensions?.length || undefined,
        width: product.dimensions?.width || undefined,
        height: product.dimensions?.height || undefined,
        categoryId: product.category?.id || "",
        tags: product.tags || [],
        metaTitle: product.metadata?.metaTitle || "",
        metaDescription: product.metadata?.metaDescription || "",
        slug: product.slug || "",
        images: product.images?.map((img: any) => img.url) || [],
        variants: product.sizes?.map((size: any) => ({
          size: size.size,
          stock: size.quantity || 0,
        })) || [],
      };

      setProductData(formData);
      if (breadcrumb && pathname && product.name) {
        breadcrumb.setDynamicLabel(pathname, product.name);
      }
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error("Failed to load product:", error);
      const isAbort = error instanceof Error && error.name === "AbortError";
      const msg = error instanceof Error ? error.message : "Failed to load product";
      const isNetworkError =
        isAbort ||
        msg === "Load failed" ||
        msg === "Failed to fetch" ||
        msg.toLowerCase().includes("network");
      setLoadError(
        isAbort
          ? "Request timed out. The database may be unavailable—check connection and try again."
          : isNetworkError
            ? "Network error. Check your connection and that the dev server is running, then try again."
            : msg
      );
    } finally {
      setLoading(false);
    }
  }, [productId, isNew, breadcrumb, pathname]);

  React.useEffect(() => {
    if (!isNew && productId) {
      loadProduct();
    } else {
      setLoading(false);
    }
  }, [productId, isNew, loadProduct]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (loadError && !isNew) {
    return (
      <div className="space-y-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-cream-200/50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-charcoal-900 mb-1">Could not load product</h2>
              <p className="text-charcoal-600 text-sm mb-4">{loadError}</p>
              <div className="flex gap-3">
                <Button type="button" onClick={loadProduct} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/admin/products" className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Products
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        initialData={productData}
      />
    </div>
  );
}
