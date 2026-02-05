"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, Plus, Upload } from "lucide-react";
import { apiUrl } from "@/lib/config/api-base";

interface Product {
  id: string;
  name: string;
  description: string;
  slug: string;
  categoryId: string;
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    comparePrice: number | null;
  }>;
  images: Array<{
    id: string;
    url: string;
    alt: string;
    position: number;
  }>;
}

export default function ProductEditForm({ product }: { product: Product }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    slug: product.slug,
    categoryId: product.categoryId,
    variants: product.variants,
    images: product.images,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(apiUrl(`/api/admin/products/${product.id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update product");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/products");
  };

  const updateVariant = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          id: `new-${Date.now()}`,
          name: "",
          sku: "",
          price: 0,
          stock: 0,
          comparePrice: null,
        },
      ],
    });
  };

  const removeVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

        <div className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Jordan Legacy Graphic T-Shirt"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your product..."
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug (URL) *
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="jordan-legacy-graphic-tshirt"
            />
            <p className="mt-1 text-xs text-gray-500">
              URL: /products/{formData.slug}
            </p>
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Variants</h2>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Variant
          </button>
        </div>

        <div className="space-y-4">
          {formData.variants.map((variant, index) => (
            <div
              key={variant.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium">Variant {index + 1}</h3>
                {formData.variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Variant Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) =>
                      updateVariant(index, "name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="One Size"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={variant.sku}
                    onChange={(e) =>
                      updateVariant(index, "sku", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="JOR-LEG-001"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="0.01"
                    value={variant.price}
                    onChange={(e) =>
                      updateVariant(
                        index,
                        "price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="29.99"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={variant.stock}
                    onChange={(e) =>
                      updateVariant(
                        index,
                        "stock",
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="100"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Images</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {formData.images.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-square border border-gray-200 rounded-lg overflow-hidden"
            >
              <Image
                src={image.url}
                alt={image.alt || formData.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute top-2 right-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      images: formData.images.filter((_, i) => i !== index),
                    });
                  }}
                  className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add Image Button */}
          <button
            type="button"
            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <span className="text-sm text-gray-600">Add Image</span>
            </div>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
}
