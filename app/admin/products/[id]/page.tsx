"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getProduct, updateProduct, createProduct } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { H1 } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(10, "Description too short"),
  sku: z.string().min(1, "SKU is required"),
  price: z.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  inStock: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductEditPageProps {
  params: {
    id: string;
  };
}

/**
 * Product Edit/Create Page
 * 
 * Form for creating or editing products.
 */
export default function ProductEditPage({ params }: ProductEditPageProps): JSX.Element {
  const router = useRouter();
  const isNew = params.id === "new";
  const [loading, setLoading] = React.useState(!isNew);
  const [saving, setSaving] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      price: 0,
      category: "",
      inStock: true,
    },
  });

  React.useEffect(() => {
    if (!isNew) {
      async function loadProduct(): Promise<void> {
        try {
          const product = await getProduct(params.id);
          if (product) {
            setValue("name", product.name);
            setValue("description", product.description);
            setValue("sku", product.sku || "");
            setValue("price", product.price / 100); // Convert from cents
            setValue("category", product.category.id);
            setValue("inStock", product.inStock);
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
  }, [params.id, isNew, setValue]);

  const onSubmit = async (data: ProductFormData): Promise<void> => {
    setSaving(true);
    try {
      const productData = {
        name: data.name,
        description: data.description,
        sku: data.sku,
        price: Math.round(data.price * 100), // Convert to cents
        category: {
          id: data.category,
          name: data.category,
          slug: data.category,
        },
        inStock: data.inStock,
        slug: data.name.toLowerCase().replace(/\s+/g, "-"),
        images: [],
        sizes: [],
      } as Partial<Product>;

      if (isNew) {
        await createProduct(productData);
      } else {
        await updateProduct(params.id, productData);
      }
      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to save product:", error);
    } finally {
      setSaving(false);
    }
  };

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
      <H1 className="text-charcoal-900 text-3xl font-serif font-bold">
        {isNew ? "Create Product" : "Edit Product"}
      </H1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-cream-50 rounded-xl border border-cream-200 p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-bold text-charcoal-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-charcoal-900 mb-2">
                  Product Name *
                </label>
                <input
                  {...register("name")}
                  className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal-900 mb-2">
                  Description *
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-charcoal-900 mb-2">SKU *</label>
                  <input
                    {...register("sku")}
                    className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                  />
                  {errors.sku && <p className="text-red-600 text-sm mt-1">{errors.sku.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal-900 mb-2">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("price", { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                  />
                  {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal-900 mb-2">Category *</label>
                <select
                  {...register("category")}
                  className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                >
                  <option value="">Select category</option>
                  <option value="cat-boys">Boys</option>
                  <option value="cat-girls">Girls</option>
                  <option value="cat-accessories">Accessories</option>
                </select>
                {errors.category && (
                  <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("inStock")}
                  className="w-4 h-4 text-navy-900 border-cream-300 rounded focus:ring-navy-500"
                />
                <label className="text-sm font-medium text-charcoal-900">In Stock</label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving..." : isNew ? "Create Product" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
