"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/ui/Toast";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

interface ProductVariant {
  size: string;
  sku: string;
  stock: number;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  originalPrice: string;
  sku: string;
  categoryId: string;
  images: ProductImage[];
  variants: ProductVariant[];
  tags: string[];
  collections: string[];
}

interface ProductFormProps {
  productId?: string;
}

export function ProductForm({ productId }: ProductFormProps): JSX.Element {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    price: "",
    originalPrice: "",
    sku: "",
    categoryId: "",
    images: [{ url: "", alt: "", isPrimary: true, order: 0 }],
    variants: [{ size: "", sku: "", stock: 0 }],
    tags: [],
    collections: [],
  });

  useEffect(() => {
    fetchCategoriesAndCollections();
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  async function fetchCategoriesAndCollections(): Promise<void> {
    try {
      const [categoriesRes, collectionsRes] = await Promise.all([
        fetch("/api/admin/categories", { credentials: 'include' }).catch(() => null),
        fetch("/api/admin/collections", { credentials: 'include' }).catch(() => null),
      ]);

      if (categoriesRes && categoriesRes.ok) {
        try {
          const data = await categoriesRes.json();
          // Handle apiSuccess format: { success: true, data: { categories: [...], count: ... } }
          // Or direct format: { categories: [...] }
          // Or array format: [...]
          let cats: Category[] = [];
          if (Array.isArray(data)) {
            cats = data;
          } else if (data.data?.categories) {
            cats = data.data.categories;
          } else if (data.categories) {
            cats = data.categories;
          } else if (Array.isArray(data.data)) {
            cats = data.data;
          }
          
          if (cats.length > 0) {
            setCategories(cats);
          } else {
            console.warn("No categories found in response:", data);
            // Don't set fallback - let user see empty dropdown if no categories exist
            setCategories([]);
          }
        } catch (parseError) {
          console.error("Failed to parse categories:", parseError);
          setCategories([]);
        }
      } else {
        console.error("Failed to fetch categories:", categoriesRes?.status);
        setCategories([]);
      }

      if (collectionsRes && collectionsRes.ok) {
        try {
          const data = await collectionsRes.json();
          // Handle apiSuccess format: { success: true, data: { collections: [...], count: ... } }
          // Or direct format: { collections: [...] }
          // Or array format: [...]
          let cols: Collection[] = [];
          if (Array.isArray(data)) {
            cols = data;
          } else if (data.data?.collections) {
            cols = data.data.collections;
          } else if (data.collections) {
            cols = data.collections;
          } else if (Array.isArray(data.data)) {
            cols = data.data;
          }
          
          setCollections(cols);
        } catch (parseError) {
          console.error("Failed to parse collections:", parseError);
          setCollections([]);
        }
      } else {
        setCollections([]);
      }
    } catch (error) {
      console.error("Failed to fetch categories/collections:", error);
      // Don't set fallback - show empty dropdowns if fetch fails
      setCategories([]);
      setCollections([]);
    }
  }

  async function fetchProduct(): Promise<void> {
    if (!productId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        credentials: 'include', // Include cookies for authentication
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        showToast({
          type: "error",
          title: "Failed to Load Product",
          message: errorMessage,
        });
        setLoading(false);
        return;
      }

      const responseData = await response.json();
      
      // Handle apiSuccess format: { success: true, data: {...} }
      // Or direct product format: {...}
      const product = responseData.success !== false && responseData.data 
        ? responseData.data 
        : responseData;

      if (!product || !product.id) {
        showToast({
          type: "error",
          title: "Invalid Product Data",
          message: "The product data received is invalid. Please try again.",
        });
        setLoading(false);
        return;
      }

      setFormData({
        name: product.name || "",
        slug: product.slug || "",
        description: product.description || "",
        price: product.price ? (typeof product.price === 'number' ? (product.price / 100).toFixed(2) : product.price) : "",
        originalPrice: product.originalPrice
          ? (typeof product.originalPrice === 'number' ? (product.originalPrice / 100).toFixed(2) : product.originalPrice)
          : "",
        sku: product.sku || "",
        categoryId: product.categoryId || product.category?.id || "",
        images:
          product.images?.length > 0
            ? product.images.map((img: { url: string; alt?: string; isPrimary?: boolean; order?: number }) => ({
                url: img.url,
                alt: img.alt || "",
                isPrimary: img.isPrimary ?? false,
                order: img.order ?? 0,
              }))
            : [{ url: "", alt: "", isPrimary: true, order: 0 }],
        variants:
          product.variants?.length > 0
            ? product.variants.map((v: { size: string; sku?: string; stock: number }) => ({
                size: v.size,
                sku: v.sku || "",
                stock: v.stock || 0,
              }))
            : [{ size: "", sku: "", stock: 0 }],
        tags: product.tags?.map((t: { name: string } | string) => typeof t === 'string' ? t : t.name) || [],
        collections:
          product.collections?.map((c: { collectionId?: string; collection?: { id: string } }) => 
            c.collectionId || c.collection?.id || ""
          ).filter(Boolean) || [],
      });
    } catch (error) {
      console.error("Failed to fetch product:", error);
      showToast({
        type: "error",
        title: "Failed to Load Product",
        message: error instanceof Error ? error.message : "An error occurred while loading the product. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleNameChange(name: string): void {
    setFormData({
      ...formData,
      name,
      slug: formData.slug || generateSlug(name),
    });
  }

  function addImage(): void {
    setFormData({
      ...formData,
      images: [
        ...formData.images,
        {
          url: "",
          alt: "",
          isPrimary: false,
          order: formData.images.length,
        },
      ],
    });
  }

  function removeImage(index: number): void {
    const newImages = formData.images.filter((_, i) => i !== index);
    if (newImages.length > 0 && !newImages.some((img) => img.isPrimary)) {
      newImages[0].isPrimary = true;
    }
    setFormData({ ...formData, images: newImages });
  }

  function updateImage(index: number, field: keyof ProductImage, value: string | boolean): void {
    const newImages = [...formData.images];
    if (field === "isPrimary" && value === true) {
      newImages.forEach((img, i) => {
        img.isPrimary = i === index;
      });
    } else {
      newImages[index] = { ...newImages[index], [field]: value };
    }
    setFormData({ ...formData, images: newImages });
  }

  function addVariant(): void {
    setFormData({
      ...formData,
      variants: [...formData.variants, { size: "", sku: "", stock: 0 }],
    });
  }

  function removeVariant(index: number): void {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  }

  function updateVariant(index: number, field: keyof ProductVariant, value: string | number): void {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  }

  function handleTagInput(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === "Enter") {
      e.preventDefault();
      const input = e.currentTarget;
      const tag = input.value.trim();
      if (tag && !formData.tags.includes(tag)) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tag],
        });
        input.value = "";
      }
    }
  }

  function removeTag(tag: string): void {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate required fields
    if (!formData.name || formData.name.trim() === "") {
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Product name is required",
      });
      return;
    }
    
    if (!formData.description || formData.description.trim() === "") {
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Product description is required",
      });
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Product price must be greater than 0",
      });
      return;
    }
    
    if (!formData.categoryId || formData.categoryId === "") {
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Please select a category",
      });
      return;
    }
    
    // Validate images
    const validImages = formData.images.filter((img) => img.url.trim() !== "");
    if (validImages.length === 0) {
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Please upload at least one product image",
      });
      return;
    }

    // Validate sizes - ensure at least one size is provided
    const validSizes = formData.variants.filter((v) => v.size.trim() !== "");
    if (validSizes.length === 0) {
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Please add at least one product size",
      });
      return;
    }

    setLoading(true);

    try {
      // Convert variants to sizes format expected by API
      const sizes = validSizes.map((v) => ({
        size: v.size.trim(),
        quantity: typeof v.stock === 'number' ? v.stock : parseInt(String(v.stock || 0), 10),
      }));

      // Convert images to array of URL strings for validation (API will handle object format)
      const imageUrls = validImages.map((img) => img.url.trim());

      // Calculate price in dollars (not cents) for validation - API will convert to cents
      const priceInDollars = parseFloat(formData.price);

      // Ensure sizes array has valid data
      if (sizes.length === 0) {
        showToast({
          type: "error",
          title: "Validation Error",
          message: "Please add at least one product size with a valid size name",
        });
        setLoading(false);
        return;
      }

      // Validate each size has valid quantity
      const validSizesWithQuantity = sizes.filter(s => {
        const qty = typeof s.quantity === 'number' ? s.quantity : parseInt(String(s.quantity || 0), 10);
        return !isNaN(qty) && qty >= 0;
      });

      if (validSizesWithQuantity.length === 0) {
        showToast({
          type: "error",
          title: "Validation Error",
          message: "Please ensure at least one size has a valid quantity (0 or greater)",
        });
        setLoading(false);
        return;
      }

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ''),
        description: formData.description.trim(),
        price: priceInDollars, // Send as decimal dollars, API will convert to cents
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        sku: formData.sku.trim() || `SKU-${Date.now()}`,
        categoryId: formData.categoryId, // Send categoryId as string, not object
        images: imageUrls, // Send as array of URL strings for validation
        sizes: validSizesWithQuantity.map(s => ({
          size: s.size.trim(),
          quantity: typeof s.quantity === 'number' ? s.quantity : parseInt(String(s.quantity || 0), 10),
        })),
        tags: formData.tags || [],
        inStock: validSizesWithQuantity.some(s => {
          const qty = typeof s.quantity === 'number' ? s.quantity : parseInt(String(s.quantity || 0), 10);
          return qty > 0;
        }),
      };

      const url = productId
        ? `/api/admin/products/${productId}`
        : "/api/admin/products";
      const method = productId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(payload),
      });

      // Handle authentication errors (401) - token expired or invalid
      if (response.status === 401) {
        const responseData = await response.json().catch(() => ({}));
        const errorMessage = responseData.error || responseData.message || 'Invalid or expired token';
        
        // Check if it's specifically a token expiration issue
        const isTokenExpired = errorMessage.toLowerCase().includes('expired') || 
                              errorMessage.toLowerCase().includes('invalid') ||
                              errorMessage.toLowerCase().includes('token');
        
        showToast({
          type: "error",
          title: isTokenExpired ? "Session Expired" : "Authentication Required",
          message: isTokenExpired 
            ? "Your session has expired. Please log in again to continue." 
            : "Authentication required. Please log in to continue.",
        });
        
        // Clear any stored auth state
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin-token');
          localStorage.removeItem('admin-user');
        }
        
        // Redirect to login after a short delay to show the message
        setTimeout(() => {
          window.location.href = "/admin/login";
        }, 2000);
        
        setLoading(false);
        return;
      }

      const responseData = await response.json().catch(() => ({}));

      if (response.ok && responseData.success !== false) {
        showToast({
          type: "success",
          title: productId ? "Product Updated" : "Product Created",
          message: `${formData.name} has been ${productId ? 'updated' : 'created'} successfully`,
        });
        // Broadcast to other tabs so storefront refreshes and all browsers see new product
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem("products_updated", Date.now().toString());
          } catch (_) {}
          fetch("/api/products?revalidate=true", { method: "GET" }).catch(() => {});
        }
        // Refresh the products list page to show the new product
        router.push("/admin/products");
        router.refresh();
      } else {
        // Extract detailed validation errors if available
        let errorMessage = responseData.error || responseData.message || `HTTP ${response.status}: ${response.statusText}`;
        
        // If there are validation errors, format them nicely
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
              } else {
                errorMessage = 'Validation failed. Please check all required fields.';
              }
            } else {
              errorMessage = responseData.details || 'Validation failed. Please check all required fields.';
            }
          } catch (e) {
            // If parsing fails, use the details as-is
            if (typeof responseData.details === 'string') {
              errorMessage = responseData.details || 'Validation failed. Please check all required fields.';
            } else {
              errorMessage = 'Validation failed. Please check all required fields.';
            }
          }
        } else if (responseData.errors && typeof responseData.errors === 'object') {
          const errorEntries = Object.entries(responseData.errors);
          if (errorEntries.length > 0) {
            const formattedErrors = errorEntries.map(([field, message]) => {
              const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
              return `${fieldName}: ${message}`;
            });
            errorMessage = formattedErrors.join('\n');
          } else {
            errorMessage = 'Validation failed. Please check all required fields.';
          }
        } else if (!errorMessage || errorMessage.includes('Validation failed')) {
          // If we still don't have a detailed error, provide a helpful default
          errorMessage = 'Validation failed. Please ensure:\n- Name is provided\n- Description is at least 10 characters\n- Price is greater than 0\n- Category is selected\n- At least one image is uploaded\n- At least one size is added';
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.error("Failed to save product:", errorMessage, responseData);
        }
        showToast({
          type: "error",
          title: "Save Failed",
          message: errorMessage,
          duration: 5000, // Show longer for validation errors
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to save product:", error);
      }
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      showToast({
        type: "error",
        title: "Save Failed",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {/* Basic Information */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-cream-200/50 p-6">
        <h2 className="text-xl font-semibold text-charcoal-900 mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Price (₵) *
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={formData.price}
              onChange={(e) => {
                // Allow only numbers and one decimal point
                const value = e.target.value.replace(/[^0-9.]/g, '');
                // Ensure only one decimal point
                const parts = value.split('.');
                const formatted = parts.length > 2 
                  ? parts[0] + '.' + parts.slice(1).join('')
                  : value;
                setFormData({ ...formData, price: formatted });
              }}
              className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Original Price (₵) - Optional
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={formData.originalPrice}
              onChange={(e) => {
                // Allow only numbers and one decimal point
                const value = e.target.value.replace(/[^0-9.]/g, '');
                // Ensure only one decimal point
                const parts = value.split('.');
                const formatted = parts.length > 2 
                  ? parts[0] + '.' + parts.slice(1).join('')
                  : value;
                setFormData({ ...formData, originalPrice: formatted });
              }}
              className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
              placeholder="For sale items"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              SKU
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
              className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Category *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-cream-200/50 p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-charcoal-900 mb-2">Product Images</h2>
          <p className="text-sm text-charcoal-600">Upload images from your device or drag and drop. The first image will be used as the primary image.</p>
        </div>
        <ImageUpload
          images={formData.images.map(img => img.url).filter(url => url !== "")}
          onChange={(urls) => {
            // Convert URLs to ProductImage format
            const newImages = urls.map((url, index) => ({
              url,
              alt: formData.images.find(img => img.url === url)?.alt || `${formData.name || 'Product'} - Image ${index + 1}`,
              isPrimary: index === 0,
              order: index,
            }));
            setFormData({ ...formData, images: newImages });
          }}
          maxImages={10}
          disabled={loading}
        />
        {/* Alt text inputs for uploaded images */}
        {formData.images.length > 0 && formData.images.some(img => img.url) && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-charcoal-700 mb-2">Image Alt Text (for SEO)</p>
            {formData.images.filter(img => img.url).map((image, filteredIndex) => {
              // Find the actual index in the full images array
              const actualIndex = formData.images.findIndex(img => img.url === image.url);
              return (
                <div key={image.url || filteredIndex} className="flex items-center gap-2">
                  <span className="text-xs text-charcoal-500 w-20">Image {filteredIndex + 1}:</span>
                  <input
                    type="text"
                    value={image.alt}
                    onChange={(e) => updateImage(actualIndex, "alt", e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-cream-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                    placeholder="Describe this image for accessibility"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Variants */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-cream-200/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-charcoal-900">
            Product Variants
          </h2>
          <Button type="button" variant="secondary" onClick={addVariant}>
            <Plus className="w-4 h-4 mr-2" />
            Add Variant
          </Button>
        </div>
        <div className="space-y-4">
          {formData.variants.map((variant, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-cream-200 rounded-lg"
            >
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Size *
                </label>
                <input
                  type="text"
                  value={variant.size}
                  onChange={(e) =>
                    updateVariant(index, "size", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                  placeholder="e.g., 4T, 5T, 6"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  value={variant.sku}
                  onChange={(e) =>
                    updateVariant(index, "sku", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Stock *
                </label>
                <input
                  type="number"
                  value={variant.stock}
                  onChange={(e) =>
                    updateVariant(index, "stock", parseInt(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                  min="0"
                  required
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVariant(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-cream-200/50 p-6">
        <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Tags</h2>
        <div className="mb-4">
          <input
            type="text"
            onKeyDown={handleTagInput}
            className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-navy-500"
            placeholder="Press Enter to add a tag (e.g., new, bestseller, sale)"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-navy-100 text-navy-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-2 hover:text-navy-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Collections */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-cream-200/50 p-6">
        <h2 className="text-xl font-semibold text-charcoal-900 mb-4">
          Collections
        </h2>
        <div className="space-y-2">
          {collections.map((collection) => (
            <label
              key={collection.id}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.collections.includes(collection.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      collections: [...formData.collections, collection.id],
                    });
                  } else {
                    setFormData({
                      ...formData,
                      collections: formData.collections.filter(
                        (id) => id !== collection.id
                      ),
                    });
                  }
                }}
                className="rounded border-cream-300"
              />
              <span className="text-charcoal-700">{collection.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : productId ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
