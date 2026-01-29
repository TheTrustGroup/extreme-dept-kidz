"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { H1 } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductFormComprehensive } from "@/components/admin/ProductFormComprehensive";
import { useAdminBreadcrumb } from "@/components/admin/AdminBreadcrumbContext";
import { usePathname } from "next/navigation";

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

  React.useEffect(() => {
    if (!isNew && productId) {
      async function loadProduct(): Promise<void> {
        try {
          const res = await fetch(`/api/admin/products/${productId}`, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            const product = data.data || data;
            
            // Transform product data to form format
            const formData = {
              name: product.name || "",
              description: product.description || "",
              shortDescription: product.metadata?.shortDescription || "",
              sku: product.sku || "",
              barcode: product.metadata?.barcode || "",
              status: product.inStock ? "active" : "draft",
              price: product.price ? product.price / 100 : 0, // Convert from cents
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
            
            // Update breadcrumb with product name
            if (breadcrumb && pathname && product.name) {
              breadcrumb.setDynamicLabel(pathname, product.name);
            }
          }
        } catch (error) {
          console.error("Failed to load product:", error);
        } finally {
          setLoading(false);
        }
      }
      loadProduct();
    } else {
      setLoading(false);
    }
  }, [productId, isNew, breadcrumb, pathname]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <H1 className="text-gray-900 text-3xl font-bold mb-2">
          {isNew ? "Create Product" : "Edit Product"}
        </H1>
        <p className="text-gray-600 text-sm">
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
