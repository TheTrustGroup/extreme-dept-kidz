import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { ProductEditClient } from "@/components/admin/ProductEditClient";
import type { ProductFormInitialData } from "@/components/admin/ProductEditClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Product Edit/Create Page (Server Component)
 *
 * Fetches product on the server so the edit form is never blank.
 * For id === "new" we render the create form; otherwise we load the product and pass initialData.
 */
export default async function ProductEditPage({ params }: PageProps) {
  const { id } = await params;

  if (id === "new") {
    return (
      <ProductEditClient productId={undefined} initialData={null} />
    );
  }

  // When server has no DB (e.g. warehouse), still render edit form; client will fetch product via API
  if (!prisma) {
    return <ProductEditClient productId={id} initialData={null} />;
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { order: "asc" } },
      variants: true,
      tags: true,
    },
  });

  if (!product) {
    return <ProductEditClient productId={id} initialData={null} />;
  }

  const metadata = (product.metadata ?? {}) as Record<string, unknown>;
  const dimensions = (metadata.dimensions ?? {}) as Record<string, unknown>;

  const initialData: ProductFormInitialData = {
    name: product.name ?? "",
    description: product.description ?? "",
    shortDescription: (metadata.shortDescription as string) ?? "",
    sku: product.sku ?? "",
    barcode: (metadata.barcode as string) ?? "",
    status: product.inStock ? "active" : "draft",
    visibleOnStore: product.visibleOnStore !== false,
    price: product.price ? product.price / 100 : 0,
    salePrice: product.originalPrice ? product.originalPrice / 100 : undefined,
    costPerItem: (metadata.costPerItem as number) ?? undefined,
    trackInventory: (metadata.trackInventory as boolean) !== false,
    stockQuantity:
      product.variants?.reduce((sum, v) => sum + (v.stock ?? 0), 0) ?? 0,
    lowStockThreshold: (metadata.lowStockThreshold as number) ?? 10,
    allowBackorders: (metadata.allowBackorders as boolean) ?? false,
    weight: product.weight ?? undefined,
    length: (dimensions.length as number) ?? undefined,
    width: (dimensions.width as number) ?? undefined,
    height: (dimensions.height as number) ?? undefined,
    categoryId: product.category?.id ?? product.categoryId ?? "",
    tags: product.tags?.map((t) => t.name) ?? [],
    metaTitle: (metadata.metaTitle as string) ?? "",
    metaDescription: (metadata.metaDescription as string) ?? "",
    slug: product.slug ?? "",
    images: product.images?.map((img) => img.url) ?? [],
    variants:
      product.variants?.map((v) => ({
        size: v.size ?? "",
        stock: v.stock ?? 0,
      })) ?? [],
  };

  return (
    <ProductEditClient
      productId={id}
      initialData={initialData}
    />
  );
}
