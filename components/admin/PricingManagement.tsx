"use client";

import { useEffect, useState } from "react";
import { Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
}

export function PricingManagement(): JSX.Element {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, { price: number; originalPrice: number | null }>>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts(): Promise<void> {
    try {
      const response = await fetch("/api/admin/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePrice(productId: string): Promise<void> {
    const editData = editing[productId];
    if (!editData) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...products.find((p) => p.id === productId),
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
                  price: editData.price,
                  originalPrice: editData.originalPrice,
                }
              : p
          )
        );
        const newEditing = { ...editing };
        delete newEditing[productId];
        setEditing(newEditing);
      } else {
        alert("Failed to update price");
      }
    } catch (error) {
      console.error("Failed to update price:", error);
      alert("Failed to update price");
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-charcoal-900">Pricing Management</h1>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-cream-200/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-700 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-700 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-700 uppercase tracking-wider">
                  Original Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-cream-200">
              {products.map((product) => {
                const isEditing = editing[product.id] !== undefined;
                const editData = editing[product.id] || {
                  price: product.price / 100,
                  originalPrice: product.originalPrice ? product.originalPrice / 100 : null,
                };

                return (
                  <tr key={product.id} className="hover:bg-cream-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-charcoal-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-charcoal-500">
                        {product.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-charcoal-600">₵</span>
                          <input
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
                            className="w-24 px-2 py-1 border border-cream-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-charcoal-900">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-charcoal-600">₵</span>
                          <input
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
                            className="w-24 px-2 py-1 border border-cream-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                            step="0.01"
                            min="0"
                            placeholder="Optional"
                          />
                        </div>
                      ) : (
                        <span className="text-sm text-charcoal-600">
                          {product.originalPrice
                            ? formatPrice(product.originalPrice)
                            : "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {isEditing ? (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdatePrice(product.id)}
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newEditing = { ...editing };
                              delete newEditing[product.id];
                              setEditing(newEditing);
                            }}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
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
                          <Edit className="w-4 h-4 mr-1" />
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
