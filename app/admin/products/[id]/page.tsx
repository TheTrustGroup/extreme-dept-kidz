"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { H1 } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { FloatingInput, FloatingTextarea } from "@/components/ui/floating-input";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import { DEFAULT_PRODUCT_SIZES } from "@/lib/constants/product-sizes";

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

/**
 * Product Edit/Create Page
 * 
 * Form for creating or editing products.
 */
export default function ProductEditPage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const productId = (params?.id as string) || "";
  const isNew = productId === "new";
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
      sizes: DEFAULT_PRODUCT_SIZES.map(size => ({ size, quantity: 0 })),
      tags: [],
    },
  });

  const [categories, setCategories] = React.useState<Array<{ id: string; name: string }>>([]);

  React.useEffect(() => {
    // Fetch categories
    async function fetchCategories(): Promise<void> {
      try {
        const res = await fetch("/api/admin/categories", { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const cats = data.data?.categories || data.categories || [];
          setCategories(cats);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    fetchCategories();
  }, []);

  React.useEffect(() => {
    if (!isNew && productId) {
      async function loadProduct(): Promise<void> {
        try {
          const res = await fetch(`/api/admin/products/${productId}`, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            const product = data.data || data;
            if (product) {
              setValue("name", product.name);
              setValue("description", product.description);
              setValue("sku", product.sku || "");
              setValue("price", product.price / 100); // Convert from cents
              setValue("compareAtPrice", product.originalPrice ? product.originalPrice / 100 : undefined);
              setValue("category", product.category?.id || "");
              setValue("inStock", product.inStock);
              setValue("images", product.images?.map((img: any) => img.url) || []);
              setValue("sizes", product.variants?.map((v: any) => ({
                size: v.size,
                quantity: v.stock || 0,
              })) || []);
              setValue("tags", product.tags?.map((t: any) => t.name || t) || []);
            }
          }
        } catch (error) {
          console.error("Failed to load product:", error);
          addToast({
            type: "error",
            title: "Error",
            message: "Failed to load product. Please try again.",
          });
        } finally {
          setLoading(false);
        }
      }
      loadProduct();
    } else {
      setLoading(false);
    }
  }, [productId, isNew, setValue, addToast]);

  const onSubmit = async (data: ProductFormData): Promise<void> => {
    setSaving(true);
    try {
      console.log('Form submission - data:', data);
      console.log('Form submission - images:', data.images);
      
      // Validate images array
      if (!data.images || data.images.length === 0) {
        addToast({
          type: "error",
          title: "Validation Error",
          message: "Please upload at least one product image",
        });
        setSaving(false);
        return;
      }

      // Filter out any empty or invalid image URLs and ensure they're strings
      const validImages = data.images
        .filter(url => url != null && url !== '')
        .map(url => String(url).trim())
        .filter(url => url.length > 0);

      console.log('Form submission - validImages:', validImages);

      if (validImages.length === 0) {
        addToast({
          type: "error",
          title: "Validation Error",
          message: "Please upload at least one valid product image",
        });
        setSaving(false);
        return;
      }

      // Prepare payload matching API schema
      const sizes = data.sizes?.map(size => ({
        size: size.size,
        quantity: size.quantity || 0,
      })) || [];

      const payload = {
        name: data.name.trim(),
        description: data.description.trim(),
        sku: data.sku.trim() || `SKU-${Date.now()}`,
        price: data.price, // Send as decimal dollars, API will convert to cents
        originalPrice: data.compareAtPrice || undefined,
        categoryId: data.category, // Send categoryId as string
        images: validImages, // Send as array of URL strings
        sizes,
        tags: data.tags || [],
        inStock: data.inStock,
      };

      const url = isNew ? "/api/admin/products" : `/api/admin/products/${productId}`;
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok && responseData.success !== false) {
        addToast({
          type: "success",
          title: "Success",
          message: isNew ? "Product created successfully!" : "Product updated successfully!",
        });
        router.push("/admin/products");
      } else {
        // Handle validation errors
        let errorMessage = responseData.error || responseData.message || `HTTP ${response.status}: ${response.statusText}`;
        
        if (responseData.code === 'VALIDATION_ERROR' && responseData.details) {
          try {
            const errors = typeof responseData.details === 'string' ? JSON.parse(responseData.details) : responseData.details;
            if (errors && typeof errors === 'object') {
              const errorEntries = Object.entries(errors);
              if (errorEntries.length > 0) {
                const formattedErrors = errorEntries.map(([field, message]) => {
                  const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
                  return `${fieldName}: ${message}`;
                });
                errorMessage = formattedErrors.join('\n');
              }
            }
          } catch (e) {
            if (typeof responseData.details === 'string') {
              errorMessage = responseData.details;
            }
          }
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      addToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to save product. Please try again.",
      });
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

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // Prevent any browser validation
          handleSubmit(onSubmit)(e);
        }} 
        className="space-y-6" 
        noValidate
        // Explicitly disable HTML5 validation
        autoComplete="off"
      >
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
                  type="text"
                  inputMode="decimal"
                  {...register("price", { 
                    valueAsNumber: true,
                    setValueAs: (value) => {
                      if (!value || value === '') return 0;
                      const num = parseFloat(String(value));
                      return isNaN(num) ? 0 : num;
                    }
                  })}
                  onInput={(e) => {
                    // Filter input to allow only numbers and one decimal point
                    const input = e.currentTarget;
                    let value = input.value.replace(/[^0-9.]/g, '');
                    // Ensure only one decimal point
                    const parts = value.split('.');
                    if (parts.length > 2) {
                      value = parts[0] + '.' + parts.slice(1).join('');
                    }
                    input.value = value;
                  }}
                  label="Price (₵)"
                  error={errors.price?.message}
                  success={!errors.price && watch("price") > 0}
                  required
                />
              </div>

              <FloatingInput
                type="text"
                inputMode="decimal"
                {...register("compareAtPrice", { 
                  valueAsNumber: true,
                  setValueAs: (value) => {
                    if (!value || value === '') return undefined;
                    const num = parseFloat(String(value));
                    return isNaN(num) ? undefined : num;
                  }
                })}
                onInput={(e) => {
                  // Filter input to allow only numbers and one decimal point
                  const input = e.currentTarget;
                  let value = input.value.replace(/[^0-9.]/g, '');
                  // Ensure only one decimal point
                  const parts = value.split('.');
                  if (parts.length > 2) {
                    value = parts[0] + '.' + parts.slice(1).join('');
                  }
                  input.value = value;
                }}
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
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
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
              images={watch("images") || []}
              onChange={(urls) => {
                try {
                  // Ensure all URLs are valid strings and filter out any invalid entries
                  const validUrls = urls
                    .filter(url => url != null && url !== '')
                    .map(url => String(url).trim())
                    .filter(url => url.length > 0);
                  
                  console.log('ImageUpload onChange - validUrls:', validUrls);
                  
                  // Set value without triggering validation
                  setValue("images", validUrls, { 
                    shouldValidate: false, // Don't trigger validation on change
                    shouldDirty: true,
                    shouldTouch: false
                  });
                } catch (error) {
                  console.error('Error setting image URLs:', error);
                  addToast({
                    type: "error",
                    title: "Upload Error",
                    message: "Failed to add images. Please try again.",
                  });
                }
              }}
              maxImages={10}
              disabled={saving}
            />
            {errors.images && (
              <p className="text-red-600 text-sm mt-2">{errors.images.message}</p>
            )}
          </div>

          {/* Inventory / Sizes */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Inventory by Size</h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">Set stock quantity for each size</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
              {watch("sizes")?.map((size, index) => (
                <div key={size.size} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Size {size.size}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    {...register(`sizes.${index}.quantity`, { 
                      valueAsNumber: true,
                      setValueAs: (value) => {
                        if (!value || value === '') return 0;
                        const num = parseInt(String(value), 10);
                        return isNaN(num) ? 0 : Math.max(0, num);
                      }
                    })}
                    onInput={(e) => {
                      // Filter input to allow only integers
                      const input = e.currentTarget;
                      input.value = input.value.replace(/[^0-9]/g, '');
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            className="shadow-sm hover:shadow-md transition-all w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={saving}
            className="shadow-md hover:shadow-lg transition-all disabled:opacity-50 w-full sm:w-auto"
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
