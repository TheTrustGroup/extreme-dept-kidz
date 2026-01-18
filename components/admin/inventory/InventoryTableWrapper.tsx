"use client";

import * as React from "react";
import { AdvancedInventoryTable } from "./AdvancedInventoryTable";
import { useToast } from "@/components/ui/Toast";

interface InventoryVariant {
  id: string;
  productId: string;
  productName: string;
  category: string;
  sku: string;
  size: string;
  stock: number;
  lowStockThreshold: number;
  price: number;
  imageUrl?: string;
}

export function InventoryTableWrapper(): JSX.Element {
  const [variants, setVariants] = React.useState<InventoryVariant[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { showToast } = useToast();

  React.useEffect(() => {
    async function loadInventory(): Promise<void> {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/inventory', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch inventory');
        }

        const data = await response.json();
        setVariants(data.data?.variants || []);
      } catch (error) {
        console.error("Failed to load inventory:", error);
      } finally {
        setLoading(false);
      }
    }

    loadInventory();
  }, []);

  const handleStockUpdate = React.useCallback(async (variantId: string, stock: number): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/inventory/${variantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          quantity: stock,
          action: 'set',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update stock');
      }

      // Update local state
      setVariants(prev => prev.map(v =>
        v.id === variantId ? { ...v, stock } : v
      ));

      showToast({
        type: "success",
        title: "Stock Updated",
        message: `Stock updated to ${stock} units`,
      });
    } catch (error) {
      console.error("Failed to update stock:", error);
      showToast({
        type: "error",
        title: "Update Failed",
        message: "Failed to update stock. Please try again.",
      });
      throw error;
    }
  }, []);

  const handleBulkUpdate = React.useCallback(async (
    variantIds: string[],
    action: 'add' | 'subtract' | 'set',
    value: number
  ): Promise<void> => {
    try {
      // Update each variant
      await Promise.all(
        variantIds.map(async (variantId) => {
          const variant = variants.find(v => v.id === variantId);
          if (!variant) return;

          let newStock: number;
          switch (action) {
            case 'add':
              newStock = variant.stock + value;
              break;
            case 'subtract':
              newStock = Math.max(0, variant.stock - value);
              break;
            case 'set':
              newStock = value;
              break;
            default:
              return;
          }

          const response = await fetch(`/api/admin/inventory/${variantId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              quantity: newStock,
              action: 'set',
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to update variant ${variantId}`);
          }
        })
      );

      // Reload inventory
      const response = await fetch('/api/admin/inventory', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setVariants(data.data?.variants || []);
        showToast({
          type: "success",
          title: "Bulk Update Complete",
          message: `Updated ${variantIds.length} items successfully`,
        });
      }
    } catch (error) {
      console.error("Failed to bulk update:", error);
      showToast({
        type: "error",
        title: "Bulk Update Failed",
        message: "Failed to update some items. Please try again.",
      });
      throw error;
    }
  }, [variants]);

  return (
    <AdvancedInventoryTable
      variants={variants}
      loading={loading}
      onStockUpdate={handleStockUpdate}
      onBulkUpdate={handleBulkUpdate}
    />
  );
}
