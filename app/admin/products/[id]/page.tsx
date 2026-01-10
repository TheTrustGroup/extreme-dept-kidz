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
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { Product } from "@/types";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(10, "Description too short"),
  sku: z.string().min(1, "SKU is required"),
  price: z.number().positive("Price must be positive"),
  compareAtPrice: z.number().optional(),
  category: z.string().min(1, "Category is required"),
  inStock: z.boolean(),
  images: z.array(z.string()).min(1, "At least one image is required"),
  sizes: z.array(z.object({
    size: z.string(),
    quantity: z.number().int().min(0),
  })).optional(),
  tags: z.array(z.string()).optional(),
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
      compareAtPrice: undefined,
      category: "",
      inStock: true,
      images: [],
      sizes: [
        { size: "4T", quantity: 0 },
        { size: "5T", quantity: 0 },
        { size: "6", quantity: 0 },
        { size: "8", quantity: 0 },
        { size: "10", quantity: 0 },
        { size: "12", quantity: 0 },
      ],
      tags: [],
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
            setValue("compareAtPrice", product.compareAtPrice ? product.compareAtPrice / 100 : undefined);
            setValue("category", product.category.id);
            setValue("inStock", product.inStock);
            setValue("images", product.images.map(img => img.url));
            setValue("sizes", product.sizes.map(size => ({
              size: size.name,
              quantity: size.inStock ? 1 : 0,
            })));
            setValue("tags", product.tags || []);
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
        compareAtPrice: data.compareAtPrice ? Math.round(data.compareAtPrice * 100) : undefined,
        category: {
          id: data.category,
          name: data.category,
          slug: data.category,
        },
        inStock: data.inStock,
        slug: data.name.toLowerCase().replace(/\s+/g, "-"),
        images: data.images.map((url, index) => ({
          url,
          alt: `${data.name} - Image ${index + 1}`,
          isPrimary: index === 0,
        })),
        sizes: data.sizes?.map(size => ({
          name: size.size,
          inStock: size.quantity > 0,
        })) || [],
        tags: data.tags || [],
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
                  <label className="block text-sm font-semibold text-charcoal-900 mb-2">Price (₵) *</label>
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
                <label className="block text-sm font-semibold text-charcoal-900 mb-2">Compare at Price (₵)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("compareAtPrice", { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                  placeholder="Original price (optional)"
                />
                {errors.compareAtPrice && <p className="text-red-600 text-sm mt-1">{errors.compareAtPrice.message}</p>}
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

          {/* Product Images */}
          <div>
            <h2 className="text-xl font-bold text-charcoal-900 mb-4">Product Images</h2>
            <ImageUpload
              images={form.watch("images")}
              onChange={(urls) => form.setValue("images", urls)}
              maxImages={10}
              disabled={saving}
            />
            {errors.images && (
              <p className="text-red-600 text-sm mt-2">{errors.images.message}</p>
            )}
          </div>

          {/* Inventory / Sizes */}
          <div>
            <h2 className="text-xl font-bold text-charcoal-900 mb-4">Inventory by Size</h2>
            <div className="space-y-3">
              {form.watch("sizes")?.map((size, index) => (
                <div key={size.size} className="flex items-center gap-4">
                  <span className="w-20 font-medium text-charcoal-900">Size {size.size}</span>
                  <input
                    type="number"
                    {...form.register(`sizes.${index}.quantity`, { valueAsNumber: true })}
                    className="flex-1 px-4 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                    placeholder="Quantity"
                    min="0"
                  />
                </div>
              ))}
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
