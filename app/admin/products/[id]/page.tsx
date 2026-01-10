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
import { FloatingInput, FloatingTextarea } from "@/components/ui/floating-input";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
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
  const { addToast } = useToast();
  const isNew = params.id === "new";
  const [loading, setLoading] = React.useState(!isNew);
  const [saving, setSaving] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
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
            setValue("compareAtPrice", product.originalPrice ? product.originalPrice / 100 : undefined);
            setValue("category", product.category.id);
            setValue("inStock", product.inStock);
            setValue("images", product.images.map(img => img.url));
            setValue("sizes", product.sizes.map(size => ({
              size: size.size,
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
        originalPrice: data.compareAtPrice ? Math.round(data.compareAtPrice * 100) : undefined,
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
          size: size.size,
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
      <div>
        <H1 className="text-gray-900 text-3xl font-bold mb-2">
          {isNew ? "Create Product" : "Edit Product"}
        </H1>
        <p className="text-gray-600 text-sm">
          {isNew ? "Add a new product to your catalog" : "Update product information"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 space-y-8 shadow-sm">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Basic Information</h2>
            <div className="space-y-6">
              <FloatingInput
                {...register("name")}
                label="Product Name"
                error={errors.name?.message}
                success={!errors.name && watch("name")?.length > 0}
                required
              />

              <FloatingTextarea
                {...register("description")}
                label="Description"
                rows={4}
                error={errors.description?.message}
                success={!errors.description && watch("description")?.length > 10}
                helperText="Describe your product in detail (minimum 10 characters)"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FloatingInput
                  {...register("sku")}
                  label="SKU"
                  error={errors.sku?.message}
                  success={!errors.sku && watch("sku")?.length > 0}
                  helperText="Unique product identifier"
                  required
                />

                <FloatingInput
                  type="number"
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                  label="Price (₵)"
                  error={errors.price?.message}
                  success={!errors.price && watch("price") > 0}
                  required
                />
              </div>

              <FloatingInput
                type="number"
                step="0.01"
                {...register("compareAtPrice", { valueAsNumber: true })}
                label="Compare at Price (₵)"
                error={errors.compareAtPrice?.message}
                success={!errors.compareAtPrice && (watch("compareAtPrice") ?? 0) > 0}
                helperText="Original price for showing discounts (optional)"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("category")}
                  className={cn(
                    "w-full px-4 py-2.5 text-sm bg-white border rounded-lg",
                    "focus:outline-none focus:ring-2 transition-all duration-200",
                    "hover:border-gray-400",
                    errors.category
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  )}
                >
                  <option value="">Select category</option>
                  <option value="cat-boys">Boys</option>
                  <option value="cat-girls">Girls</option>
                  <option value="cat-accessories">Accessories</option>
                </select>
                {errors.category && (
                  <p className="text-red-600 text-sm mt-1.5">{errors.category.message}</p>
                )}
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  {...register("inStock")}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
                />
                <div>
                  <label className="text-sm font-medium text-gray-900 cursor-pointer">In Stock</label>
                  <p className="text-xs text-gray-500 mt-0.5">Product is available for purchase</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Product Images</h2>
            <p className="text-sm text-gray-600 mb-4">Upload product images. The first image will be used as the primary image.</p>
            <ImageUpload
              images={watch("images")}
              onChange={(urls) => setValue("images", urls)}
              maxImages={10}
              disabled={saving}
            />
            {errors.images && (
              <p className="text-red-600 text-sm mt-2">{errors.images.message}</p>
            )}
          </div>

          {/* Inventory / Sizes */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Inventory by Size</h2>
            <p className="text-sm text-gray-600 mb-4">Set stock quantity for each size</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {watch("sizes")?.map((size, index) => (
                <div key={size.size} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Size {size.size}
                  </label>
                  <input
                    type="number"
                    {...register(`sizes.${index}.quantity`, { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="0"
                    min="0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            className="shadow-sm hover:shadow-md transition-all"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={saving}
            className="shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : (
              <>
                {isNew ? "Create Product" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
