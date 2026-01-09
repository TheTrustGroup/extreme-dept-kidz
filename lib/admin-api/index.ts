/**
 * Admin API Layer
 * 
 * Mock API functions for admin dashboard.
 * In production, these would call real backend endpoints.
 */

import type { Product, Order } from "@/types";
import { mockProducts } from "@/lib/mock-data";
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
  await delay(300);

  let products = [...mockProducts];

  // Apply search
  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.sku?.toLowerCase().includes(searchLower)
    );
  }

  // Apply filters (simplified)
  if (params?.filters) {
    // Filter logic here
  }

  const page = params?.page || 1;
  const limit = params?.limit || 50;
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    products: products.slice(start, end),
    total: products.length,
    page,
    totalPages: Math.ceil(products.length / limit),
  };
}

export async function getProduct(id: string): Promise<Product | null> {
  await delay(200);
  return mockProducts.find((p) => p.id === id) || null;
}

export async function createProduct(product: Partial<Product>): Promise<Product> {
  await delay(500);
  // In production, this would create in database
  return product as Product;
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  await delay(500);
  // In production, this would update in database
  return product as Product;
}

export async function deleteProduct(_id: string): Promise<void> {
  await delay(300);
  // In production, this would delete from database
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
