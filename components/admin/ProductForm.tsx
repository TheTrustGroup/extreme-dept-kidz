"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/admin/ImageUpload";

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
          // Handle both { categories: [...] } and direct array responses
          const cats = Array.isArray(data) ? data : (data.categories || []);
          setCategories(cats);
        } catch (parseError) {
          console.error("Failed to parse categories:", parseError);
          // Set default categories as fallback
          setCategories([
            { id: "cat-boys", name: "Boys", slug: "boys" },
            { id: "cat-girls", name: "Girls", slug: "girls" },
            { id: "cat-accessories", name: "Accessories", slug: "accessories" },
          ]);
        }
      } else {
        // Set default categories as fallback
        setCategories([
          { id: "cat-boys", name: "Boys", slug: "boys" },
          { id: "cat-girls", name: "Girls", slug: "girls" },
          { id: "cat-accessories", name: "Accessories", slug: "accessories" },
        ]);
      }

      if (collectionsRes && collectionsRes.ok) {
        try {
          const data = await collectionsRes.json();
          // Handle both { collections: [...] } and direct array responses
          const cols = Array.isArray(data) ? data : (data.collections || []);
          setCollections(cols);
        } catch (parseError) {
          console.error("Failed to parse collections:", parseError);
          // Collections are optional, so empty array is fine
          setCollections([]);
        }
      } else {
        // Collections are optional, so empty array is fine
        setCollections([]);
      }
    } catch (error) {
      console.error("Failed to fetch categories/collections:", error);
      // Set default categories as fallback
      setCategories([
        { id: "cat-boys", name: "Boys", slug: "boys" },
        { id: "cat-girls", name: "Girls", slug: "girls" },
        { id: "cat-accessories", name: "Accessories", slug: "accessories" },
      ]);
      setCollections([]);
    }
  }

  async function fetchProduct(): Promise<void> {
    if (!productId) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        credentials: 'include', // Include cookies for authentication
      });
      if (response.ok) {
        const product = await response.json();
        setFormData({
          name: product.name || "",
          slug: product.slug || "",
          description: product.description || "",
          price: (product.price / 100).toFixed(2),
          originalPrice: product.originalPrice
            ? (product.originalPrice / 100).toFixed(2)
            : "",
          sku: product.sku || "",
          categoryId: product.categoryId || "",
          images:
            product.images?.length > 0
              ? product.images.map((img: { url: string; alt: string; isPrimary: boolean; order: number }) => ({
                  url: img.url,
                  alt: img.alt || "",
                  isPrimary: img.isPrimary,
                  order: img.order,
                }))
              : [{ url: "", alt: "", isPrimary: true, order: 0 }],
          variants:
            product.variants?.length > 0
              ? product.variants.map((v: { size: string; sku: string; stock: number }) => ({
                  size: v.size,
                  sku: v.sku,
                  stock: v.stock,
                }))
              : [{ size: "", sku: "", stock: 0 }],
          tags: product.tags?.map((t: { name: string }) => t.name) || [],
          collections:
            product.collections?.map((c: { collectionId: string }) => c.collectionId) || [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
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
      alert("Product name is required");
      return;
    }
    
    if (!formData.description || formData.description.trim() === "") {
      alert("Product description is required");
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert("Product price must be greater than 0");
      return;
    }
    
    if (!formData.categoryId || formData.categoryId === "") {
      alert("Please select a category");
      return;
    }
    
    // Validate images
    const validImages = formData.images.filter((img) => img.url.trim() !== "");
    if (validImages.length === 0) {
      alert("Please upload at least one product image");
      return;
    }

    setLoading(true);

    try {
      // Convert variants to sizes format expected by API
      const sizes = formData.variants
        .filter((v) => v.size.trim() !== "")
        .map((v) => ({
          size: v.size,
          inStock: v.stock > 0,
          quantity: v.stock,
        }));

      // Convert images to expected format
      const images = validImages.map((img, index) => ({
        url: img.url.trim(),
        alt: img.alt || `${formData.name} - Image ${index + 1}`,
        isPrimary: index === 0,
      }));

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
        description: formData.description.trim(),
        price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
        originalPrice: formData.originalPrice
          ? Math.round(parseFloat(formData.originalPrice) * 100)
          : undefined,
        sku: formData.sku.trim() || `SKU-${Date.now()}`,
        category: {
          id: formData.categoryId,
          name: categories.find(c => c.id === formData.categoryId)?.name || formData.categoryId,
          slug: categories.find(c => c.id === formData.categoryId)?.slug || formData.categoryId,
        },
        images,
        sizes,
        tags: formData.tags,
        inStock: sizes.some(s => s.quantity > 0),
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

      const responseData = await response.json().catch(() => ({}));

      if (response.ok && responseData.success !== false) {
        router.push("/admin/products");
        router.refresh();
      } else {
        const errorMessage = responseData.error || responseData.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error("Failed to save product:", errorMessage, responseData);
        alert(`Failed to save product: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Failed to save product: ${errorMessage}. Please try again.`);
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
