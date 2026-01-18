/**
 * Inventory Analytics Service
 * 
 * Provides analytics and insights for inventory management:
 * - Stock valuation
 * - Turnover rates
 * - Stock velocity
 * - Reorder point calculations
 * - Forecasting
 */

import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/utils/logger";

export interface InventoryAnalytics {
  totalValue: number;
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  turnoverRate: number;
  averageStockLevel: number;
  stockByCategory: Array<{
    category: string;
    value: number;
    items: number;
  }>;
  stockVelocity: Array<{
    variantId: string;
    productName: string;
    size: string;
    velocity: number; // units per day
    daysUntilOut: number | null;
  }>;
  reorderSuggestions: Array<{
    variantId: string;
    productName: string;
    size: string;
    currentStock: number;
    reorderPoint: number;
    suggestedOrder: number;
    urgency: 'critical' | 'high' | 'medium' | 'low';
  }>;
}

export interface StockForecast {
  variantId: string;
  productName: string;
  size: string;
  currentStock: number;
  velocity: number; // units per day
  daysUntilOut: number | null;
  predictedOutDate: Date | null;
  confidence: 'high' | 'medium' | 'low';
}

export interface StockHistoryEntry {
  id: string;
  variantId: string;
  productName: string;
  size: string;
  change: number;
  reason: string;
  notes: string | null;
  createdAt: Date;
  orderId: string | null;
}

/**
 * Get comprehensive inventory analytics
 */
export async function getInventoryAnalytics(): Promise<InventoryAnalytics> {
  try {
    if (!prisma) {
      throw new Error("Database not available");
    }

    // Get all variants with product info
    const variants = await prisma.productVariant.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        inventoryLogs: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 100, // Last 100 changes for velocity calculation
        },
      },
      where: {
        isActive: true,
      },
    });

    // Calculate total value
    const totalValue = variants.reduce((sum, v) => {
      const price = v.price || v.product.price || 0;
      return sum + (price * v.stock);
    }, 0);

    // Count items
    const totalItems = variants.length;
    const lowStockCount = variants.filter(v => v.stock > 0 && v.stock <= v.lowStockThreshold).length;
    const outOfStockCount = variants.filter(v => v.stock === 0).length;

    // Calculate average stock level
    const averageStockLevel = totalItems > 0
      ? variants.reduce((sum, v) => sum + v.stock, 0) / totalItems
      : 0;

    // Calculate turnover rate (simplified: based on inventory logs)
    const totalSales = variants.reduce((sum, v) => {
      const sales = v.inventoryLogs
        .filter(log => log.reason === 'sale' && log.change < 0)
        .reduce((s, log) => s + Math.abs(log.change), 0);
      return sum + sales;
    }, 0);

    const averageInventory = variants.reduce((sum, v) => sum + v.stock, 0) / (variants.length || 1);
    const turnoverRate = averageInventory > 0 ? totalSales / averageInventory : 0;

    // Stock by category
    const categoryMap = new Map<string, { value: number; items: number }>();
    variants.forEach(v => {
      const categoryName = v.product.category?.name || 'Uncategorized';
      const price = v.price || v.product.price || 0;
      const value = price * v.stock;

      const existing = categoryMap.get(categoryName) || { value: 0, items: 0 };
      categoryMap.set(categoryName, {
        value: existing.value + value,
        items: existing.items + 1,
      });
    });

    const stockByCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      ...data,
    }));

    // Calculate stock velocity (units per day based on recent sales)
    const stockVelocity = variants.map(v => {
      // Get sales from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentSales = v.inventoryLogs.filter(log => {
        return log.reason === 'sale' &&
               log.change < 0 &&
               log.createdAt >= thirtyDaysAgo;
      });

      const totalSold = recentSales.reduce((sum, log) => sum + Math.abs(log.change), 0);
      const days = 30;
      const velocity = days > 0 ? totalSold / days : 0;

      // Calculate days until out of stock
      const daysUntilOut = velocity > 0 && v.stock > 0
        ? Math.floor(v.stock / velocity)
        : null;

      return {
        variantId: v.id,
        productName: v.product.name,
        size: v.size,
        velocity,
        daysUntilOut,
      };
    });

    // Generate reorder suggestions
    const reorderSuggestions = variants
      .filter(v => {
        // Only suggest if stock is at or below reorder point
        return v.stock <= v.lowStockThreshold;
      })
      .map(v => {
        const velocity = stockVelocity.find(sv => sv.variantId === v.id)?.velocity || 0;
        const reorderPoint = v.lowStockThreshold;
        const currentStock = v.stock;

        // Suggested order quantity: enough for 30 days at current velocity
        const suggestedOrder = velocity > 0
          ? Math.ceil(velocity * 30) - currentStock
          : reorderPoint * 2 - currentStock;

        // Determine urgency
        let urgency: 'critical' | 'high' | 'medium' | 'low' = 'low';
        if (currentStock === 0) {
          urgency = 'critical';
        } else if (currentStock <= reorderPoint * 0.5) {
          urgency = 'high';
        } else if (currentStock <= reorderPoint * 0.75) {
          urgency = 'medium';
        }

        return {
          variantId: v.id,
          productName: v.product.name,
          size: v.size,
          currentStock,
          reorderPoint,
          suggestedOrder: Math.max(0, suggestedOrder),
          urgency,
        };
      })
      .sort((a, b) => {
        // Sort by urgency (critical first)
        const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      });

    return {
      totalValue,
      totalItems,
      lowStockCount,
      outOfStockCount,
      turnoverRate,
      averageStockLevel,
      stockByCategory,
      stockVelocity,
      reorderSuggestions,
    };
  } catch (error) {
    logger.error("Failed to get inventory analytics:", error);
    throw error;
  }
}

/**
 * Get stock forecast for a specific variant or all variants
 */
export async function getStockForecast(variantId?: string): Promise<StockForecast[]> {
  try {
    if (!prisma) {
      throw new Error("Database not available");
    }

    const where = variantId ? { id: variantId, isActive: true } : { isActive: true };

    const variants = await prisma.productVariant.findMany({
      where,
      include: {
        product: {
          select: {
            name: true,
          },
        },
        inventoryLogs: {
          where: {
            reason: 'sale',
            change: { lt: 0 },
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return variants.map(v => {
      const totalSold = v.inventoryLogs.reduce((sum, log) => sum + Math.abs(log.change), 0);
      const velocity = totalSold / 30; // units per day

      const daysUntilOut = velocity > 0 && v.stock > 0
        ? Math.floor(v.stock / velocity)
        : null;

      const predictedOutDate = daysUntilOut !== null
        ? new Date(Date.now() + daysUntilOut * 24 * 60 * 60 * 1000)
        : null;

      // Confidence based on data points
      const dataPoints = v.inventoryLogs.length;
      let confidence: 'high' | 'medium' | 'low' = 'low';
      if (dataPoints >= 20) {
        confidence = 'high';
      } else if (dataPoints >= 10) {
        confidence = 'medium';
      }

      return {
        variantId: v.id,
        productName: v.product.name,
        size: v.size,
        currentStock: v.stock,
        velocity,
        daysUntilOut,
        predictedOutDate,
        confidence,
      };
    });
  } catch (error) {
    logger.error("Failed to get stock forecast:", error);
    throw error;
  }
}

/**
 * Get stock history for a variant
 */
export async function getStockHistory(
  variantId: string,
  limit: number = 50
): Promise<StockHistoryEntry[]> {
  try {
    if (!prisma) {
      throw new Error("Database not available");
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          select: {
            name: true,
          },
        },
        inventoryLogs: {
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
        },
      },
    });

    if (!variant) {
      return [];
    }

    return variant.inventoryLogs.map(log => ({
      id: log.id,
      variantId: log.variantId,
      productName: variant.product.name,
      size: variant.size,
      change: log.change,
      reason: log.reason,
      notes: log.notes,
      createdAt: log.createdAt,
      orderId: log.orderId,
    }));
  } catch (error) {
    logger.error("Failed to get stock history:", error);
    throw error;
  }
}
