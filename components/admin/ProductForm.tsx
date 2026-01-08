"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        fetch("/api/admin/categories"),
        fetch("/api/admin/collections"),
      ]);

      if (categoriesRes.ok) {
        const cats = await categoriesRes.json();
        setCategories(cats);
      }

      if (collectionsRes.ok) {
        const cols = await collectionsRes.json();
        setCollections(cols);
      }
    } catch (error) {
      console.error("Failed to fetch categories/collections:", error);
    }
  }

  async function fetchProduct(): Promise<void> {
    if (!productId) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`);
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
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : null,
        sku: formData.sku,
        categoryId: formData.categoryId,
        images: formData.images.filter((img) => img.url.trim() !== ""),
        variants: formData.variants.filter(
          (v) => v.size.trim() !== "" && v.sku.trim() !== ""
        ),
        tags: formData.tags,
        collections: formData.collections,
      };

      const url = productId
        ? `/api/admin/products/${productId}`
        : "/api/admin/products";
      const method = productId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push("/admin/products");
      } else {
        const error = await response.json();
        alert(`Failed to save product: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Failed to save product. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Original Price (₵) - Optional
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.originalPrice}
              onChange={(e) =>
                setFormData({ ...formData, originalPrice: e.target.value })
              }
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-charcoal-900">Images</h2>
          <Button type="button" variant="secondary" onClick={addImage}>
            <Plus className="w-4 h-4 mr-2" />
            Add Image
          </Button>
        </div>
        <div className="space-y-4">
          {formData.images.map((image, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 p-4 border border-cream-200 rounded-lg"
            >
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    value={image.url}
                    onChange={(e) =>
                      updateImage(index, "url", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={image.alt}
                    onChange={(e) =>
                      updateImage(index, "alt", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                    placeholder="Product image description"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={image.isPrimary}
                    onChange={(e) =>
                      updateImage(index, "isPrimary", e.target.checked)
                    }
                    className="rounded border-cream-300"
                  />
                  <span className="text-sm text-charcoal-600">Primary</span>
                </label>
                {formData.images.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
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
