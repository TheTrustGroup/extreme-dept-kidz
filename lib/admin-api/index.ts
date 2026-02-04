/**
 * Admin API Layer
 * 
 * Mock API functions for admin dashboard.
 * In production, these would call real backend endpoints.
 */

import type { Product } from "@/types";

// Mock Order type for admin API
interface Order {
  id: string;
  customer: string;
  total: number;
  status: string;
  date: string;
}
import { getAllProducts, getProductById, createProduct as dbCreateProduct, updateProduct as dbUpdateProduct, deleteProduct as dbDeleteProduct } from "@/lib/db";
import { styleLooks } from "@/lib/mock-data/styling-data";

// Simulate API delay
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Dashboard Stats
export interface DashboardStats {
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersChange: number;
  customers: number;
  customersChange: number;
  aov: number;
  aovChange: number;
  revenueData: Array<{ date: string; revenue: number }>;
  topProducts: Array<{ id: string; name: string; sold: number; revenue: number }>;
  recentOrders: Array<{ id: string; customer: string; total: number; status: string; date: string }>;
  lowStockItems: Array<{ id: string; name: string; size: string; stock: number }>;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await delay(500);

  return {
    revenue: 45234,
    revenueChange: 12.5,
    orders: 156,
    ordersChange: 8.2,
    customers: 89,
    customersChange: 15.3,
    aov: 290,
    aovChange: 5,
    revenueData: [
      { date: "2024-01-01", revenue: 1200 },
      { date: "2024-01-02", revenue: 1800 },
      { date: "2024-01-03", revenue: 1500 },
      { date: "2024-01-04", revenue: 2200 },
      { date: "2024-01-05", revenue: 1900 },
      { date: "2024-01-06", revenue: 2400 },
      { date: "2024-01-07", revenue: 2100 },
    ],
    topProducts: [
      { id: "prod-1", name: "Heritage Denim Jacket", sold: 45, revenue: 5805 },
      { id: "prod-2", name: "Premium Cotton Tee", sold: 38, revenue: 1710 },
      { id: "prod-3", name: "Classic Chino Pants", sold: 32, revenue: 2176 },
    ],
    recentOrders: [
      { id: "1234", customer: "John Doe", total: 245, status: "pending", date: "2024-01-08" },
      { id: "1233", customer: "Jane Smith", total: 180, status: "shipped", date: "2024-01-07" },
      { id: "1232", customer: "Mike Johnson", total: 325, status: "delivered", date: "2024-01-06" },
    ],
    lowStockItems: [
      { id: "prod-1", name: "Heritage Denim Jacket", size: "8", stock: 2 },
      { id: "prod-7", name: "Canvas Sneakers", size: "12", stock: 3 },
    ],
  };
}

// Products
export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getProducts(params?: {
  search?: string;
  filters?: Record<string, unknown>;
  page?: number;
  limit?: number;
}): Promise<ProductsResponse> {
  try {
    // Call the API endpoint instead of using database abstraction layer directly
    // This works in both client and server contexts
    const searchParams = new URLSearchParams();
    if (params?.search) {
      searchParams.set('search', params.search);
    }
    if (params?.page) {
      searchParams.set('page', params.page.toString());
    }
    if (params?.limit) {
      searchParams.set('limit', params.limit.toString());
    }

    const url = `/api/admin/products${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await fetch(url, {
      credentials: 'include', // Include cookies for authentication
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('[Admin API] Failed to fetch products:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle apiSuccess format
    const products = data.data?.products || data.products || [];
    const total = data.data?.count || products.length || 0;
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const totalPages = Math.ceil(total / limit);

    if (process.env.NODE_ENV === 'development') {
      console.log('[Admin API] Products fetched:', {
        count: products.length,
        total,
        page,
        totalPages,
        firstProduct: products[0]?.name || 'none',
      });
    }

    return {
      products: Array.isArray(products) ? products : [],
      total,
      page,
      totalPages,
    };
  } catch (error) {
    console.error('Failed to get products:', error);
    // Return empty result on error
    return {
      products: [],
      total: 0,
      page: params?.page || 1,
      totalPages: 0,
    };
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    return await getProductById(id);
  } catch (error) {
    console.error('Failed to get product:', error);
    return null;
  }
}

export async function createProduct(product: Partial<Product>): Promise<Product> {
  try {
    return await dbCreateProduct(product);
  } catch (error) {
    console.error('Failed to create product:', error);
    throw error;
  }
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  try {
    return await dbUpdateProduct(id, product);
  } catch (error) {
    console.error('Failed to update product:', error);
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    await dbDeleteProduct(id);
  } catch (error) {
    console.error('Failed to delete product:', error);
    throw error;
  }
}

// Orders
export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getOrders(_params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<OrdersResponse> {
  await delay(300);
  // Mock orders data
  return {
    orders: [],
    total: 0,
    page: 1,
    totalPages: 1,
  };
}

// Complete Looks
export async function getLooks(): Promise<typeof styleLooks> {
  await delay(200);
  return styleLooks;
}

export async function getLook(id: string): Promise<(typeof styleLooks)[0] | null> {
  await delay(200);
  return styleLooks.find((look) => look.id === id) || null;
}

export async function createLook(look: Partial<(typeof styleLooks)[0]>): Promise<(typeof styleLooks)[0]> {
  await delay(500);
  return look as (typeof styleLooks)[0];
}

export async function updateLook(_id: string, look: Partial<(typeof styleLooks)[0]>): Promise<(typeof styleLooks)[0]> {
  await delay(500);
  return look as (typeof styleLooks)[0];
}

export async function deleteLook(_id: string): Promise<void> {
  await delay(300);
}

// Inventory Analytics
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
    velocity: number;
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

export async function getInventoryAnalytics(): Promise<InventoryAnalytics> {
  try {
    const { apiUrl } = await import("@/lib/config/api-base");
    const response = await fetch(apiUrl("/api/admin/inventory/analytics"), {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error('Failed to fetch inventory analytics');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Failed to get inventory analytics:', error);
    // Return empty analytics on error
    return {
      totalValue: 0,
      totalItems: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      turnoverRate: 0,
      averageStockLevel: 0,
      stockByCategory: [],
      stockVelocity: [],
      reorderSuggestions: [],
    };
  }
}
