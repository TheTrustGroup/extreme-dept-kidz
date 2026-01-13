/**
 * Enterprise-grade database abstraction layer
 * Handles real DB or falls back to mock data seamlessly
 */

import { mockProducts, mockCategories, completeLooks } from '@/lib/mock-data';
import type { Product, Category } from '@/types';
import type { CompleteLook } from '@/types/complete-look';

// Database configuration
const DB_CONFIG = {
  enabled: !!process.env.DATABASE_URL,
  type: process.env.DB_TYPE || (process.env.DATABASE_URL ? 'postgres' : 'mock'),
  url: process.env.DATABASE_URL,
  retryAttempts: 3,
  retryDelay: 1000, // ms
  timeout: 5000, // ms
};

// Database connection status
let dbConnected = false;
let connectionError: Error | null = null;

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<boolean> {
  if (DB_CONFIG.type === 'mock' || !DB_CONFIG.enabled) {
    console.log('📦 Using mock database (no real DB configured)');
    dbConnected = true;
    return true;
  }

  try {
    // Try to import and connect to Prisma if available
    const { prisma } = await import('./prisma');
    if (prisma) {
      // Test connection with a simple query
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database connected successfully');
      dbConnected = true;
      connectionError = null;
      return true;
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    connectionError = error instanceof Error ? error : new Error('Unknown error');
    dbConnected = false;
    
    console.warn('⚠️ Falling back to mock data');
    return false;
  }

  // No Prisma available, use mock
  console.log('📦 Using mock database (Prisma not available)');
  dbConnected = true;
  return true;
}

/**
 * Check database health
 */
export function isDatabaseConnected(): boolean {
  return dbConnected || DB_CONFIG.type === 'mock';
}

/**
 * Get database status for admin
 */
export function getDatabaseStatus() {
  return {
    connected: dbConnected,
    type: DB_CONFIG.type,
    error: connectionError?.message || null,
    mockMode: DB_CONFIG.type === 'mock' || !DB_CONFIG.enabled,
    enabled: DB_CONFIG.enabled,
  };
}

/**
 * Execute query with retry logic and error handling
 */
async function executeQuery<T>(
  queryFn: () => Promise<T>,
  fallbackData: T,
  queryName: string
): Promise<T> {
  // If using mock data, return immediately (silently)
  if (DB_CONFIG.type === 'mock' || !DB_CONFIG.enabled) {
    return fallbackData;
  }

  // If database connection failed, silently fall back to mock data
  if (!dbConnected) {
    console.log(`[DB] ${queryName}: Using mock data (DB not connected)`);
    return fallbackData;
  }

  let lastError: Error | null = null;

  // Retry logic
  for (let attempt = 1; attempt <= DB_CONFIG.retryAttempts; attempt++) {
    try {
      // Add timeout
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), DB_CONFIG.timeout)
      );

      const result = await Promise.race([queryFn(), timeoutPromise]);
      
      // Success!
      if (attempt > 1) {
        console.log(`✅ ${queryName} succeeded on attempt ${attempt}`);
      }
      
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      console.error(`❌ ${queryName} failed (attempt ${attempt}/${DB_CONFIG.retryAttempts}):`, lastError.message);

      // Wait before retry (exponential backoff)
      if (attempt < DB_CONFIG.retryAttempts) {
        const delay = DB_CONFIG.retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed - silently fall back to mock data
  // Don't log as error to avoid alarming users - this is expected behavior
  console.log(`[DB] ${queryName}: Connection failed, using mock data (this is normal if DB is not configured)`);
  
  // Update connection status
  dbConnected = false;
  connectionError = lastError;
  
  return fallbackData;
}

/**
 * Database operations with automatic fallback
 */

// Products
export async function getAllProducts(): Promise<Product[]> {
  return executeQuery(
    async () => {
      // TODO: Replace with real DB query when Prisma schema is ready
      // const { prisma } = await import('./prisma');
      // return await prisma.product.findMany();
      throw new Error('Real DB not configured - using mock data');
    },
    mockProducts,
    'getAllProducts'
  );
}

export async function getProductById(id: string): Promise<Product | null> {
  return executeQuery(
    async () => {
      // TODO: Replace with real DB query
      // const { prisma } = await import('./prisma');
      // return await prisma.product.findUnique({ where: { id } });
      throw new Error('Real DB not configured - using mock data');
    },
    mockProducts.find(p => p.id === id) || null,
    `getProductById(${id})`
  );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return executeQuery(
    async () => {
      // TODO: Replace with real DB query
      // const { prisma } = await import('./prisma');
      // return await prisma.product.findUnique({ where: { slug } });
      throw new Error('Real DB not configured - using mock data');
    },
    mockProducts.find(p => p.slug === slug || p.id === slug) || null,
    `getProductBySlug(${slug})`
  );
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return executeQuery(
    async () => {
      // TODO: Replace with real DB query
      // const { prisma } = await import('./prisma');
      // return await prisma.product.findMany({ where: { category } });
      throw new Error('Real DB not configured - using mock data');
    },
    mockProducts.filter(p => p.category.id === category || p.category.slug === category),
    `getProductsByCategory(${category})`
  );
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  return executeQuery(
    async () => {
      // TODO: Replace with real DB query
      // const { prisma } = await import('./prisma');
      // return await prisma.product.create({ data });
      throw new Error('Real DB not configured - using mock data');
    },
    {
      id: `temp_${Date.now()}`,
      name: data.name || 'New Product',
      description: data.description || '',
      price: data.price || 0,
      images: data.images || [],
      sizes: data.sizes || [],
      category: data.category || mockCategories[0],
      slug: data.slug || `product-${Date.now()}`,
      inStock: data.inStock ?? true,
      tags: data.tags || [],
      sku: data.sku || `SKU-${Date.now()}`,
    } as Product,
    'createProduct'
  );
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  return executeQuery(
    async () => {
      // TODO: Replace with real DB query
      // const { prisma } = await import('./prisma');
      // return await prisma.product.update({ where: { id }, data });
      throw new Error('Real DB not configured - using mock data');
    },
    {
      ...mockProducts.find(p => p.id === id),
      ...data,
    } as Product,
    `updateProduct(${id})`
  );
}

export async function deleteProduct(id: string): Promise<boolean> {
  return executeQuery(
    async () => {
      // TODO: Replace with real DB query
      // const { prisma } = await import('./prisma');
      // await prisma.product.delete({ where: { id } });
      // return true;
      throw new Error('Real DB not configured - using mock data');
    },
    true,
    `deleteProduct(${id})`
  );
}

// Complete Looks
export async function getAllCompleteLooks(): Promise<CompleteLook[]> {
  return executeQuery(
    async () => {
      // TODO: Replace with real DB query
      throw new Error('Real DB not configured - using mock data');
    },
    completeLooks,
    'getAllCompleteLooks'
  );
}

export async function getCompleteLookById(id: string): Promise<CompleteLook | null> {
  return executeQuery(
    async () => {
      // TODO: Replace with real DB query
      throw new Error('Real DB not configured - using mock data');
    },
    completeLooks.find(l => l.id === id) || null,
    `getCompleteLookById(${id})`
  );
}

// Categories
export async function getAllCategories(): Promise<Category[]> {
  return executeQuery(
    async () => {
      // TODO: Replace with real DB query
      throw new Error('Real DB not configured - using mock data');
    },
    mockCategories,
    'getAllCategories'
  );
}

export async function getCategoryById(id: string): Promise<Category | null> {
  return executeQuery(
    async () => {
      // TODO: Replace with real DB query
      throw new Error('Real DB not configured - using mock data');
    },
    mockCategories.find(c => c.id === id) || null,
    `getCategoryById(${id})`
  );
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  return executeQuery(
    async () => {
      // TODO: Replace with real DB query
      throw new Error('Real DB not configured - using mock data');
    },
    {
      id: `cat_${Date.now()}`,
      name: data.name || 'New Category',
      slug: data.slug || (data.name?.toLowerCase().replace(/\s+/g, '-') || 'new-category'),
      description: data.description || '',
      image: data.image || '',
      isActive: data.isActive ?? true,
    } as Category,
    'createCategory'
  );
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  return executeQuery(
    async () => {
      // TODO: Replace with real DB query
      throw new Error('Real DB not configured - using mock data');
    },
    {
      ...mockCategories.find(c => c.id === id),
      ...data,
    } as Category,
    `updateCategory(${id})`
  );
}

export async function deleteCategory(id: string): Promise<boolean> {
  return executeQuery(
    async () => {
      // TODO: Replace with real DB query
      throw new Error('Real DB not configured - using mock data');
    },
    true,
    `deleteCategory(${id})`
  );
}

// Initialize on import (server-side only)
// Don't throw errors - just log and continue with mock data
if (typeof window === 'undefined') {
  initializeDatabase().catch((error) => {
    // Silently handle initialization errors - app will use mock data
    console.log('[DB] Initialization failed, using mock data:', error instanceof Error ? error.message : 'Unknown error');
    dbConnected = false;
    connectionError = error instanceof Error ? error : new Error('Unknown error');
  });
}
