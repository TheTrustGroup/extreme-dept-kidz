"use client";

import { useEffect, useState } from "react";
import { Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { apiUrl } from "@/lib/config/api-base";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
}

export function PricingManagement(): JSX.Element {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, { price: number; originalPrice: number | null }>>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts(): Promise<void> {
    try {
      const response = await fetch(apiUrl("/api/admin/products"), {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        // Handle both apiSuccess format (data.products) and direct array format
        const products = data.data?.products || data.products || (Array.isArray(data) ? data : []);
        setProducts(products);
      } else {
        console.error("Failed to fetch products:", response.status, response.statusText);
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePrice(productId: string): Promise<void> {
    const editData = editing[productId];
    if (!editData) return;

    try {
      const response = await fetch(apiUrl(`/api/admin/products/${productId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          price: editData.price,
          originalPrice: editData.originalPrice,
        }),
      });

      if (response.ok) {
        setProducts(
          products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  price: Math.round(editData.price * 100),
                  originalPrice:
                    editData.originalPrice != null
                      ? Math.round(editData.originalPrice * 100)
                      : null,
                }
              : p
          )
        );
        const newEditing = { ...editing };
        delete newEditing[productId];
        setEditing(newEditing);
        showToast({
          type: "success",
          title: "Price Updated",
          message: "Product price has been updated successfully",
        });
      } else {
        const data = await response.json().catch(() => ({}));
        showToast({
          type: "error",
          title: "Update Failed",
          message: data.error || data.message || "Failed to update price",
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to update price:", error);
      }
      showToast({
        type: "error",
        title: "Update Failed",
        message: "An error occurred while updating the price",
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-charcoal-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-compact-2xl leading-compact-tight tracking-compact-tight font-bold text-charcoal-900">Pricing Management</h1>
          <p className="adm-help-text mt-1">Edited prices are visually emphasized for fast review before save.</p>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-cream-200/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream-50">
              <tr>
                <th className="px-6 py-3 text-left text-compact-sm font-bold text-charcoal-700 uppercase tracking-compact-label leading-compact-tight">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-compact-sm font-bold text-charcoal-700 uppercase tracking-compact-label leading-compact-tight">
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-compact-sm font-bold text-charcoal-700 uppercase tracking-compact-label leading-compact-tight">
                  Original Price
                </th>
                <th className="px-6 py-3 text-left text-compact-sm font-bold text-charcoal-700 uppercase tracking-compact-label leading-compact-tight">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-cream-300/70">
              {products.map((product) => {
                const isEditing = editing[product.id] !== undefined;
                const editData = editing[product.id] || {
                  price: product.price / 100,
                  originalPrice: product.originalPrice ? product.originalPrice / 100 : null,
                };

                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-cream-50/80 ${Number(product.price) > 0 ? "odd:bg-white even:bg-cream-50/70" : "odd:bg-white even:bg-cream-50/50"}`}
                  >
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="font-medium text-compact-md leading-compact-normal text-charcoal-900">
                        {product.name}
                      </div>
                      <div className="text-compact-sm leading-compact-normal text-charcoal-500">
                        {product.slug}
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-charcoal-600">₵</span>
                          <Input
                            type="number"
                            value={editData.price}
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                [product.id]: {
                                  ...editData,
                                  price: parseFloat(e.target.value) || 0,
                                },
                              })
                            }
                            density="compact"
                            className={`w-24 h-8 min-h-0 px-2 border-cream-300 bg-white text-charcoal-900 focus-visible:ring-navy-500/20 focus-visible:border-navy-500 ${editData.price > 0 ? "adm-field-filled" : ""}`}
                            step="0.01"
                            min="0"
                          />
                        </div>
                      ) : (
                        <span className="text-compact-md leading-compact-normal font-medium text-charcoal-900">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-charcoal-600">₵</span>
                          <Input
                            type="number"
                            value={editData.originalPrice || ""}
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                [product.id]: {
                                  ...editData,
                                  originalPrice: e.target.value
                                    ? parseFloat(e.target.value)
                                    : null,
                                },
                              })
                            }
                            density="compact"
                            className={`w-24 h-8 min-h-0 px-2 border-cream-300 bg-white text-charcoal-900 focus-visible:ring-navy-500/20 focus-visible:border-navy-500 ${editData.originalPrice != null && editData.originalPrice > 0 ? "adm-field-filled" : ""}`}
                            step="0.01"
                            min="0"
                            placeholder="Optional"
                          />
                        </div>
                      ) : (
                        <span className="text-compact-md leading-compact-normal text-charcoal-600">
                          {product.originalPrice
                            ? formatPrice(product.originalPrice)
                            : "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-compact-md leading-compact-normal font-medium">
                      {isEditing ? (
                        <div className="flex space-x-2">
                          <Button
                            size="compact"
                            className="inline-flex items-center gap-1.5"
                            onClick={() => handleUpdatePrice(product.id)}
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="compact"
                            className="inline-flex items-center gap-1.5"
                            onClick={() => {
                              const newEditing = { ...editing };
                              delete newEditing[product.id];
                              setEditing(newEditing);
                            }}
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="compact"
                          className="inline-flex items-center gap-1.5"
                          onClick={() =>
                            setEditing({
                              ...editing,
                              [product.id]: {
                                price: product.price / 100,
                                originalPrice: product.originalPrice
                                  ? product.originalPrice / 100
                                  : null,
                              },
                            })
                          }
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
