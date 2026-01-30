/**
 * Enterprise-grade database abstraction layer
 * Handles real DB or falls back to mock data seamlessly
 */

import { mockProducts, mockCategories, mockCollections, completeLooks } from '@/lib/mock-data';
import type { Product, Category, Collection } from '@/types';
import type { CompleteLook } from '@/types/complete-look';
import { logger } from '@/lib/utils/logger';

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
 * In production, fails loudly if database is not available
 */
export async function initializeDatabase(): Promise<boolean> {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // In production, DATABASE_URL must be set
  if (isProduction && !DB_CONFIG.enabled) {
    const error = new Error('DATABASE_URL is required in production environment');
    logger.error(error.message);
    throw error;
  }

  if (DB_CONFIG.type === 'mock' || !DB_CONFIG.enabled) {
    if (isProduction) {
      const error = new Error('Cannot use mock database in production. DATABASE_URL must be configured.');
      logger.error(error.message);
      throw error;
    }
    logger.log('📦 Using mock database (no real DB configured) - Development mode only');
    dbConnected = true;
    return true;
  }

  try {
    // Try to import and connect to Prisma if available
    const { prisma } = await import('./prisma');
    if (prisma) {
      // Test connection using $connect() instead of $queryRaw
      // $connect() doesn't use prepared statements, avoiding pooler issues
      await prisma.$connect();
      logger.log('✅ Database connected successfully');
      dbConnected = true;
      connectionError = null;
      return true;
    } else {
      if (isProduction) {
        const error = new Error('Prisma client could not be initialized. Check DATABASE_URL configuration.');
        logger.error(error.message);
        throw error;
      }
    }
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    connectionError = error instanceof Error ? error : new Error('Unknown error');
    dbConnected = false;
    
    if (isProduction) {
      const prodError = new Error(`Database connection failed: ${connectionError.message}`);
      logger.error(prodError.message);
      throw prodError;
    }
    
    logger.warn('⚠️ Falling back to mock data - Development mode only');
    return false;
  }

  // No Prisma available
  if (isProduction) {
    const error = new Error('Prisma client not available. Check database configuration.');
    logger.error(error.message);
    throw error;
  }
  
  logger.log('📦 Using mock database (Prisma not available) - Development mode only');
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
 * This function checks the actual connection state
 */
export async function getDatabaseStatus() {
  try {
    // If we have DATABASE_URL, try to verify connection
    if (DB_CONFIG.enabled && DB_CONFIG.type !== 'mock') {
      try {
        const { prisma } = await import('./prisma');
        if (prisma) {
          // Quick connection test (with timeout to avoid hanging)
          try {
            const connectPromise = prisma.$connect();
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Connection timeout')), 3000)
            );
            
            await Promise.race([connectPromise, timeoutPromise]);
            
            // If connect succeeds, we're connected
            return {
              connected: true,
              type: DB_CONFIG.type,
              error: null,
              mockMode: false,
              enabled: true,
            };
          } catch (connectError) {
            // Connection failed
            const errorMessage = connectError instanceof Error ? connectError.message : 'Connection failed';
            logger.log('[DB Status] Connection test failed:', errorMessage);
            
            return {
              connected: false,
              type: DB_CONFIG.type,
              error: errorMessage,
              mockMode: false,
              enabled: true,
            };
          }
        }
      } catch (importError) {
        // Prisma not available
        logger.log('[DB Status] Prisma not available');
        return {
          connected: false,
          type: 'unknown',
          error: 'Prisma client not available',
          mockMode: true,
          enabled: false,
        };
      }
    }

    // No database configured - using mock
    return {
      connected: false,
      type: 'mock',
      error: 'No database configured',
      mockMode: true,
      enabled: false,
    };
  } catch (error) {
    // Catch any unexpected errors
    console.error('[DB Status] Error getting status:', error);
    return {
      connected: false,
      type: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
      mockMode: true,
      enabled: false,
    };
  }
}

/**
 * Execute query with retry logic and error handling
 * In production, fails loudly instead of falling back to mock data
 */
async function executeQuery<T>(
  queryFn: () => Promise<T>,
  fallbackData: T,
  queryName: string
): Promise<T> {
  const isProduction = process.env.NODE_ENV === 'production';
  // Detect build time: Next.js sets NEXT_PHASE during build, or we can check if we're in a build context
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                      process.env.NEXT_PHASE === 'phase-development' ||
                      (typeof process !== 'undefined' && process.env.npm_lifecycle_event === 'build');
  
  // In production runtime (not build), DATABASE_URL must be set
  if (isProduction && !isBuildTime && !DB_CONFIG.enabled) {
    const error = new Error(`Database not configured. DATABASE_URL is required in production. Query: ${queryName}`);
    logger.error(error.message);
    throw error;
  }

  // If using mock data (development only), return immediately
  if (DB_CONFIG.type === 'mock' || !DB_CONFIG.enabled) {
    // During build time, allow fallback to mock data even in production mode
    if (isProduction && !isBuildTime) {
      const error = new Error(`Cannot use mock data in production. Query: ${queryName}`);
      logger.error(error.message);
      throw error;
    }
    if (isBuildTime) {
      logger.log(`[Build] ${queryName}: Using mock data (build-time fallback)`);
    }
    return fallbackData;
  }

  // If database not yet connected: in production try lazy init (Vercel serverless cold start)
  if (!dbConnected) {
    if (isProduction && DB_CONFIG.enabled) {
      try {
        await initializeDatabase();
      } catch (initErr) {
        const err = initErr instanceof Error ? initErr : new Error('Unknown error');
        logger.error(`[DB] ${queryName}: Lazy init failed:`, err.message);
        throw new Error(`Database not connected. Query: ${queryName}. ${err.message}`);
      }
      if (!dbConnected) {
        throw new Error(`Database not connected after init. Query: ${queryName}`);
      }
    } else if (isProduction) {
      throw new Error(`Database not connected. Query: ${queryName}`);
    } else {
      logger.log(`[DB] ${queryName}: Using mock data (DB not connected)`);
      return fallbackData;
    }
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
        logger.log(`✅ ${queryName} succeeded on attempt ${attempt}`);
      }
      
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // During build time, don't spam errors - just log once
      if (isBuildTime && attempt === 1) {
        logger.log(`[Build] ${queryName}: Database unavailable during build, will use mock data fallback`);
      } else if (!isBuildTime) {
        logger.error(`❌ ${queryName} failed (attempt ${attempt}/${DB_CONFIG.retryAttempts}):`, lastError.message);
      }

      // Wait before retry (exponential backoff)
      // Skip retries during build time to speed up build
      if (isBuildTime || attempt < DB_CONFIG.retryAttempts) {
        if (!isBuildTime && attempt < DB_CONFIG.retryAttempts) {
          const delay = DB_CONFIG.retryDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else if (isBuildTime) {
          // During build, fail fast after first attempt
          break;
        }
      }
    }
  }

  // All retries failed
  const error = new Error(`Database query failed after ${DB_CONFIG.retryAttempts} attempts. Query: ${queryName}. Error: ${lastError?.message}`);
  
  // During build time, allow fallback to mock data to prevent build failures
  if (isBuildTime) {
    logger.warn(`[Build] ${queryName}: Database unavailable during build, using mock data fallback`);
    dbConnected = false;
    connectionError = lastError;
    return fallbackData;
  }
  
  // In production runtime, throw error instead of falling back
  if (isProduction) {
    logger.error(error.message);
    throw error;
  }
  
  // In development runtime, log and fall back to mock data
  logger.warn(`[DB] ${queryName}: Connection failed, using mock data (development mode only)`);
  
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
      const { prisma } = await import('./prisma');
      if (!prisma) {
        throw new Error('Prisma not available - using mock data');
      }
      
      // CRITICAL: Optimized query with selective field fetching
      // Only fetch necessary fields to reduce payload size
      const prismaProducts = await prisma.product.findMany({
        // Return all products - visibility is controlled by inStock flag and variant stock levels
        // Products are visible on the website regardless of stock status
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          originalPrice: true,
          sku: true,
          inStock: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            select: {
              url: true,
              alt: true,
              isPrimary: true,
              order: true,
            },
            orderBy: { order: 'asc' },
          },
          variants: {
            select: {
              size: true,
              stock: true,
            },
          },
          tags: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Transform Prisma products to Product type
      return prismaProducts.map((p): Product => {
        const product: Product = {
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          sku: p.sku ?? undefined,
          inStock: p.inStock,
          images: p.images.map((img) => ({
            url: img.url,
            alt: img.alt ?? undefined,
            isPrimary: img.isPrimary,
          })),
          sizes: p.variants.map((v) => ({
            size: v.size,
            inStock: v.stock > 0,
            quantity: v.stock,
          })),
          category: {
            id: p.category.id,
            name: p.category.name,
            slug: p.category.slug,
          },
          tags: p.tags.map((t) => t.name),
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        };
        
        // Conditionally add originalPrice only if it exists
        if (p.originalPrice !== null && p.originalPrice !== undefined) {
          product.originalPrice = p.originalPrice;
        }
        
        return product;
      });
    },
    mockProducts,
    'getAllProducts'
  );
}

export async function getProductById(id: string): Promise<Product | null> {
  return executeQuery(
    async () => {
      const { prisma } = await import('./prisma');
      if (!prisma) {
        throw new Error('Prisma not available');
      }
      
      const prismaProduct = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          images: {
            orderBy: { order: 'asc' },
          },
          variants: true,
          tags: true,
        },
      });

      if (!prismaProduct) {
        return null;
      }

      // Transform Prisma product to Product type
      const product: Product = {
        id: prismaProduct.id,
        name: prismaProduct.name,
        slug: prismaProduct.slug,
        description: prismaProduct.description,
        price: prismaProduct.price,
        sku: prismaProduct.sku ?? undefined,
        inStock: prismaProduct.inStock,
        images: prismaProduct.images.map((img) => ({
          url: img.url,
          alt: img.alt ?? undefined,
          isPrimary: img.isPrimary,
        })),
        sizes: prismaProduct.variants.map((v) => ({
          size: v.size,
          inStock: v.stock > 0,
          quantity: v.stock,
        })),
        category: {
          id: prismaProduct.category.id,
          name: prismaProduct.category.name,
          slug: prismaProduct.category.slug,
        },
        tags: prismaProduct.tags.map((t) => t.name),
        createdAt: prismaProduct.createdAt,
        updatedAt: prismaProduct.updatedAt,
      };
      
      // Conditionally add originalPrice only if it exists
      if (prismaProduct.originalPrice !== null && prismaProduct.originalPrice !== undefined) {
        product.originalPrice = prismaProduct.originalPrice;
      }
      
      return product;
    },
    mockProducts.find(p => p.id === id) || null,
    `getProductById(${id})`
  );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return executeQuery(
    async () => {
      const { prisma } = await import('./prisma');
      if (!prisma) {
        throw new Error('Prisma not available - using mock data');
      }

      // Try exact slug first (no status filter - product detail shows any product by slug)
      let prismaProduct = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          images: {
            orderBy: { order: 'asc' },
          },
          variants: true,
          tags: true,
        },
      });

      // Fallback: case-insensitive slug match (e.g. link has different casing)
      if (!prismaProduct) {
        prismaProduct = await prisma.product.findFirst({
          where: { slug: { equals: slug, mode: 'insensitive' } },
          include: {
            category: true,
            images: { orderBy: { order: 'asc' } },
            variants: true,
            tags: true,
          },
        });
      }

      if (!prismaProduct) {
        return null;
      }

      // Transform Prisma product to Product type
      const product: Product = {
        id: prismaProduct.id,
        name: prismaProduct.name,
        slug: prismaProduct.slug,
        description: prismaProduct.description,
        price: prismaProduct.price,
        sku: prismaProduct.sku ?? undefined,
        inStock: prismaProduct.inStock,
        images: prismaProduct.images.map((img) => ({
          url: img.url,
          alt: img.alt ?? undefined,
          isPrimary: img.isPrimary,
        })),
        sizes: prismaProduct.variants.map((v) => ({
          size: v.size,
          inStock: v.stock > 0,
          quantity: v.stock,
        })),
        category: {
          id: prismaProduct.category.id,
          name: prismaProduct.category.name,
          slug: prismaProduct.category.slug,
        },
        tags: prismaProduct.tags.map((t) => t.name),
        createdAt: prismaProduct.createdAt,
        updatedAt: prismaProduct.updatedAt,
      };
      
      // Conditionally add originalPrice only if it exists
      if (prismaProduct.originalPrice !== null && prismaProduct.originalPrice !== undefined) {
        product.originalPrice = prismaProduct.originalPrice;
      }
      
      return product;
    },
    mockProducts.find(p => p.slug === slug || p.id === slug) || null,
    `getProductBySlug(${slug})`
  );
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return executeQuery(
    async () => {
      const { prisma } = await import('./prisma');
      if (!prisma) {
        throw new Error('Prisma not available - using mock data');
      }
      
      // Try to find category by slug or ID; only use active categories for display
      const categoryRecord = await prisma.category.findFirst({
        where: {
          isActive: true,
          OR: [
            { slug: category },
            { id: category },
          ],
        },
      });

      if (!categoryRecord) {
        return [];
      }

      const prismaProducts = await prisma.product.findMany({
        where: {
          categoryId: categoryRecord.id,
          // Only include products that are in stock or have variants in stock
          // This ensures we show all products, not just in-stock ones
        },
        include: {
          category: true,
          images: {
            orderBy: { order: 'asc' },
          },
          variants: true,
          tags: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[getProductsByCategory] Category: ${categoryRecord.name} (${categoryRecord.slug})`);
        console.log(`[getProductsByCategory] Found ${prismaProducts.length} products`);
        if (prismaProducts.length > 0) {
          console.log(`[getProductsByCategory] Products:`, prismaProducts.map(p => p.name));
        }
      }

      // Transform Prisma products to Product type
      return prismaProducts.map((p): Product => {
        const product: Product = {
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          sku: p.sku ?? undefined,
          inStock: p.inStock,
          images: p.images.map((img) => ({
            url: img.url,
            alt: img.alt ?? undefined,
            isPrimary: img.isPrimary,
          })),
          sizes: p.variants.map((v) => ({
            size: v.size,
            inStock: v.stock > 0,
            quantity: v.stock,
          })),
          category: {
            id: p.category.id,
            name: p.category.name,
            slug: p.category.slug,
          },
          tags: p.tags.map((t) => t.name),
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        };
        
        // Conditionally add originalPrice only if it exists
        if (p.originalPrice !== null && p.originalPrice !== undefined) {
          product.originalPrice = p.originalPrice;
        }
        
        return product;
      });
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
      const { prisma } = await import('./prisma');
      if (!prisma) {
        throw new Error('Prisma not available');
      }
      
      const prismaLooks = await (prisma as any).completeLook.findMany({
        where: {
          isActive: true,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                  images: {
                    orderBy: { order: 'asc' },
                  },
                  variants: true,
                  tags: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Transform Prisma complete looks to CompleteLook type
      return prismaLooks.map((look: any) => {
        // Calculate totalPrice and savings
        const totalPrice = look.items.reduce((sum: number, item: any) => {
          return sum + (item.product.price || 0);
        }, 0);
        const bundlePrice = look.bundlePrice || totalPrice;
        const savings = Math.max(0, totalPrice - bundlePrice);
        
        return {
          id: look.id,
          name: look.name,
          description: look.description ?? '',
          mainImage: look.mainImage,
          bundlePrice,
          totalPrice,
          savings,
          featured: look.featured ?? false,
          tags: [], // Complete looks don't have tags in DB schema yet
          items: look.items.map((item: any) => ({
          product: {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            description: item.product.description,
            price: item.product.price,
            originalPrice: item.product.originalPrice ?? undefined,
            sku: item.product.sku ?? undefined,
            inStock: item.product.inStock,
            images: item.product.images.map((img: any) => ({
              url: img.url,
              alt: img.alt ?? undefined,
              isPrimary: img.isPrimary,
            })),
            sizes: item.product.variants.map((v: any) => ({
              size: v.size,
              inStock: v.stock > 0,
              quantity: v.stock,
            })),
            category: {
              id: item.product.category.id,
              name: item.product.category.name,
              slug: item.product.category.slug,
            },
            tags: item.product.tags.map((t: any) => t.name),
            createdAt: item.product.createdAt,
            updatedAt: item.product.updatedAt,
          },
          required: item.required ?? false,
        })),
        createdAt: look.createdAt ?? undefined,
        updatedAt: look.updatedAt ?? undefined,
        };
      });
    },
    completeLooks,
    'getAllCompleteLooks'
  );
}

export async function getCompleteLookById(id: string): Promise<CompleteLook | null> {
  return executeQuery(
    async () => {
      const { prisma } = await import('./prisma');
      if (!prisma) {
        throw new Error('Prisma not available');
      }
      
      const look = await (prisma as any).completeLook.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                  images: {
                    orderBy: { order: 'asc' },
                  },
                  variants: true,
                  tags: true,
                },
              },
            },
          },
        },
      });

      if (!look) {
        return null;
      }

      // Calculate totalPrice and savings
      const totalPrice = look.items.reduce((sum: number, item: any) => {
        return sum + (item.product.price || 0);
      }, 0);
      const bundlePrice = look.bundlePrice || totalPrice;
      const savings = Math.max(0, totalPrice - bundlePrice);

      // Transform Prisma complete look to CompleteLook type
      const completeLook: CompleteLook = {
        id: look.id,
        name: look.name,
        description: look.description ?? '',
        mainImage: look.mainImage,
        bundlePrice,
        totalPrice,
        savings,
        featured: look.featured ?? false,
        tags: [] as string[], // Complete looks don't have tags in DB schema yet
        items: look.items.map((item: any) => ({
          product: {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            description: item.product.description,
            price: item.product.price,
            originalPrice: item.product.originalPrice ?? undefined,
            sku: item.product.sku ?? undefined,
            inStock: item.product.inStock,
            images: item.product.images.map((img: any) => ({
              url: img.url,
              alt: img.alt ?? undefined,
              isPrimary: img.isPrimary,
            })),
            sizes: item.product.variants.map((v: any) => ({
              size: v.size,
              inStock: v.stock > 0,
              quantity: v.stock,
            })),
            category: {
              id: item.product.category.id,
              name: item.product.category.name,
              slug: item.product.category.slug,
            },
            tags: item.product.tags.map((t: any) => t.name),
            createdAt: item.product.createdAt,
            updatedAt: item.product.updatedAt,
          },
          required: item.required ?? false,
        })),
        createdAt: look.createdAt ?? undefined,
        updatedAt: look.updatedAt ?? undefined,
      };
      
      return completeLook;
    },
    completeLooks.find(l => l.id === id) || null,
    `getCompleteLookById(${id})`
  );
}

// Categories
export async function getAllCategories(): Promise<Category[]> {
  return executeQuery(
    async () => {
      const { prisma } = await import('./prisma');
      if (!prisma) {
        throw new Error('Prisma not available');
      }
      
      const prismaCategories = await prisma.category.findMany({
        orderBy: {
          name: 'asc',
        },
      });

      // Transform Prisma categories to Category type
      return prismaCategories.map((c): Category => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description ?? undefined,
        image: c.image ?? undefined,
        isActive: c.isActive,
        metadata: c.metadata ? (typeof c.metadata === 'object' ? c.metadata as Record<string, unknown> : undefined) : undefined,
      }));
    },
    mockCategories,
    'getAllCategories'
  );
}

export async function getCategoryById(id: string): Promise<Category | null> {
  return executeQuery(
    async () => {
      const { prisma } = await import('./prisma');
      if (!prisma) {
        throw new Error('Prisma not available');
      }
      
      const category = await prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        return null;
      }

      const categoryResult: Category = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description ?? undefined,
        image: category.image ?? undefined,
        isActive: category.isActive,
      };
      
      return categoryResult;
    },
    mockCategories.find(c => c.id === id) || null,
    `getCategoryById(${id})`
  );
}

// Collections
export async function getAllCollections(): Promise<Collection[]> {
  return executeQuery(
    async () => {
      const { prisma } = await import('./prisma');
      if (!prisma) {
        throw new Error('Prisma not available');
      }
      
      const prismaCollections = await prisma.collection.findMany({
        where: {
          isActive: true, // Only return active collections
        },
        orderBy: {
          name: 'asc',
        },
      });

      // Transform Prisma collections to Collection type
      return prismaCollections.map((c): Collection => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description ?? undefined,
        image: c.image ?? '',
        bannerImage: c.bannerImage ?? undefined,
        isActive: c.isActive,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));
    },
    mockCollections,
    'getAllCollections'
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
// In production, throw errors to prevent startup with invalid configuration
if (typeof window === 'undefined') {
  initializeDatabase().catch((error) => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      // In production, log and rethrow to prevent app from starting with invalid DB config
      logger.error('[DB] Initialization failed in production:', error instanceof Error ? error.message : 'Unknown error');
      // Don't rethrow here as it would crash the app during build/startup
      // Instead, let executeQuery handle it per-request
      dbConnected = false;
      connectionError = error instanceof Error ? error : new Error('Unknown error');
    } else {
      // In development, log and continue with mock data fallback
      logger.log('[DB] Initialization failed, using mock data (development mode):', error instanceof Error ? error.message : 'Unknown error');
      dbConnected = false;
      connectionError = error instanceof Error ? error : new Error('Unknown error');
    }
  });
}
