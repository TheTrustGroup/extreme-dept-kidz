"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Variant {
  id: string;
  size: string;
  sku: string;
  stock: number;
  product: {
    id: string;
    name: string;
    slug: string;
  };
}

export function InventoryManagement(): JSX.Element {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory(): Promise<void> {
    try {
      const response = await fetch("/api/admin/inventory");
      if (response.ok) {
        const data = await response.json();
        setVariants(data);
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStock(variantId: string, newStock: number): Promise<void> {
    try {
      const response = await fetch(`/api/admin/inventory/${variantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });

      if (response.ok) {
        setVariants(
          variants.map((v) =>
            v.id === variantId ? { ...v, stock: newStock } : v
          )
        );
        const newEditing = { ...editing };
        delete newEditing[variantId];
        setEditing(newEditing);
      } else {
        alert("Failed to update stock");
      }
    } catch (error) {
      console.error("Failed to update stock:", error);
      alert("Failed to update stock");
    }
  }

  const lowStockItems = variants.filter((v) => v.stock <= 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-charcoal-600">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-charcoal-900">Inventory Management</h1>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-orange-900">
              {lowStockItems.length} item(s) running low on stock
            </span>
          </div>
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-cream-200/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-700 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-700 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-700 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-700 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-cream-200">
              {variants.map((variant) => {
                const isLowStock = variant.stock <= 10;
                const editValue = editing[variant.id] ?? variant.stock;

                return (
                  <tr
                    key={variant.id}
                    className={`hover:bg-cream-50 ${isLowStock ? "bg-orange-50" : ""}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-charcoal-900">
                        {variant.product.name}
                      </div>
                      <div className="text-sm text-charcoal-500">
                        {variant.product.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-600">
                      {variant.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-600">
                      {variant.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editing[variant.id] !== undefined ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              [variant.id]: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-24 px-3 py-1 border border-cream-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                          min="0"
                        />
                      ) : (
                        <span
                          className={`text-sm font-medium ${
                            isLowStock ? "text-orange-600" : "text-charcoal-900"
                          }`}
                        >
                          {variant.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editing[variant.id] !== undefined ? (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateStock(variant.id, editValue)
                            }
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newEditing = { ...editing };
                              delete newEditing[variant.id];
                              setEditing(newEditing);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setEditing({ ...editing, [variant.id]: variant.stock })
                          }
                        >
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
