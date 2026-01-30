/**
 * Server-Side Caching Layer
 * 
 * Implements:
 * - In-memory caching with stale-while-revalidate
 * - Redis caching (if available)
 * - Cache invalidation via tags
 * - Query batching support
 */

import { logger } from "@/lib/utils/logger";

// Cache configuration
const CACHE_CONFIG = {
  defaultTTL: 60, // 60 seconds
  staleWhileRevalidate: 300, // 5 minutes
  maxSize: 1000, // Max cache entries
};

// In-memory cache store (fallback when Redis unavailable)
const memoryCache = new Map<string, { data: any; expiresAt: number; tags: string[] }>();

// Redis client (optional - only if REDIS_URL is set)
let redisClient: any = null;

/**
 * Initialize Redis client if available
 */
async function initRedis(): Promise<boolean> {
  if (redisClient) return true;
  
  if (process.env.REDIS_URL) {
    try {
      // Dynamic import to avoid requiring redis in package.json if not used
      // @ts-ignore - ioredis is optional dependency
      const Redis = (await import('ioredis')).default;
      redisClient = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });
      
      redisClient.on('error', (err: Error) => {
        logger.error('[Redis] Connection error:', err.message);
        redisClient = null; // Fallback to memory cache
      });
      
      logger.log('[Redis] Connected successfully');
      return true;
    } catch (error) {
      logger.warn('[Redis] Failed to connect, using memory cache:', error instanceof Error ? error.message : 'Unknown error');
      redisClient = null;
      return false;
    }
  }
  
  return false;
}

/**
 * Get cache key from query name and params
 */
function getCacheKey(queryName: string, params?: Record<string, any>): string {
  const paramsStr = params ? JSON.stringify(params) : '';
  return `cache:${queryName}:${paramsStr}`;
}

/**
 * Get cached data
 */
async function getCached<T>(
  key: string,
  tags?: string[]
): Promise<T | null> {
  // Try Redis first
  if (await initRedis() && redisClient) {
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.data;
      }
    } catch (error) {
      logger.warn('[Redis] Get error, falling back to memory cache:', error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  // Fallback to memory cache
  const cached = memoryCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T;
  }
  
  // Check if stale but still valid for stale-while-revalidate
  if (cached && cached.expiresAt + CACHE_CONFIG.staleWhileRevalidate * 1000 > Date.now()) {
    return cached.data as T;
  }
  
  return null;
}

/**
 * Set cached data
 */
async function setCached<T>(
  key: string,
  data: T,
  ttl: number = CACHE_CONFIG.defaultTTL,
  tags?: string[]
): Promise<void> {
  const expiresAt = Date.now() + ttl * 1000;
  
  // Try Redis first
  if (await initRedis() && redisClient) {
    try {
      await redisClient.setex(key, ttl, JSON.stringify({ data, expiresAt, tags }));
      
      // Store tags for invalidation
      if (tags && tags.length > 0) {
        for (const tag of tags) {
          await redisClient.sadd(`tag:${tag}`, key);
          await redisClient.expire(`tag:${tag}`, ttl + CACHE_CONFIG.staleWhileRevalidate);
        }
      }
      
      return;
    } catch (error) {
      logger.warn('[Redis] Set error, falling back to memory cache:', error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  // Fallback to memory cache
  memoryCache.set(key, { data, expiresAt, tags: tags || [] });
  
  // Cleanup old entries if cache is too large
  if (memoryCache.size > CACHE_CONFIG.maxSize) {
    const entries = Array.from(memoryCache.entries());
    entries.sort((a, b) => a[1].expiresAt - b[1].expiresAt);
    const toDelete = entries.slice(0, entries.length - CACHE_CONFIG.maxSize + 100);
    toDelete.forEach(([key]) => memoryCache.delete(key));
  }
}

/**
 * Invalidate cache by tag
 */
async function invalidateByTag(tag: string): Promise<void> {
  // Try Redis first
  if (await initRedis() && redisClient) {
    try {
      const keys = await redisClient.smembers(`tag:${tag}`);
      if (keys.length > 0) {
        await redisClient.del(...keys);
        await redisClient.del(`tag:${tag}`);
      }
      return;
    } catch (error) {
      logger.warn('[Redis] Invalidate error, falling back to memory cache:', error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  // Fallback to memory cache
  const keysToDelete: string[] = [];
  for (const [key, value] of memoryCache.entries()) {
    if (value.tags.includes(tag)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(key => memoryCache.delete(key));
}

/**
 * Clear all cache
 */
async function clearCache(): Promise<void> {
  // Try Redis first
  if (await initRedis() && redisClient) {
    try {
      await redisClient.flushdb();
      return;
    } catch (error) {
      logger.warn('[Redis] Clear error, falling back to memory cache:', error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  // Fallback to memory cache
  memoryCache.clear();
}

/**
 * Cached query wrapper with stale-while-revalidate
 */
export async function cachedQuery<T>(
  queryFn: () => Promise<T>,
  queryName: string,
  options?: {
    ttl?: number;
    tags?: string[];
    params?: Record<string, any>;
  }
): Promise<T> {
  const key = getCacheKey(queryName, options?.params);
  const ttl = options?.ttl || CACHE_CONFIG.defaultTTL;
  const tags = options?.tags || [];
  
  // Try to get cached data
  const cached = await getCached<T>(key, tags);
  if (cached !== null) {
    // Check if stale but still valid
    const cachedEntry = memoryCache.get(key);
    if (cachedEntry && cachedEntry.expiresAt < Date.now()) {
      // Stale but valid - return cached, refresh in background
      queryFn()
        .then((freshData) => setCached(key, freshData, ttl, tags))
        .catch((error) => {
          logger.error(`[Cache] Background refresh failed for ${queryName}:`, error instanceof Error ? error.message : 'Unknown error');
        });
    }
    return cached;
  }
  
  // Cache miss - execute query and cache result
  try {
    const data = await queryFn();
    await setCached(key, data, ttl, tags);
    return data;
  } catch (error) {
    logger.error(`[Cache] Query failed for ${queryName}:`, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Batch multiple queries together
 */
export async function batchQueries<T extends Record<string, () => Promise<any>>>(
  queries: T
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  const keys = Object.keys(queries) as Array<keyof T>;
  const results = await Promise.all(keys.map(key => queries[key]()));
  
  return keys.reduce((acc, key, index) => {
    acc[key] = results[index];
    return acc;
  }, {} as { [K in keyof T]: Awaited<ReturnType<T[K]>> });
}

/**
 * Export cache utilities
 */
export { invalidateByTag, clearCache, initRedis };
