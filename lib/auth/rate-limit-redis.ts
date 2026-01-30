/**
 * Redis-Backed Rate Limiting
 * 
 * Distributed rate limiting using Redis (Upstash compatible)
 * Falls back to in-memory store if Redis unavailable
 */

import type { NextRequest } from 'next/server';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  identifier: string; // Unique identifier (IP, email, etc.)
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

// In-memory fallback store
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const memoryStore: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(memoryStore).forEach((key) => {
    if (memoryStore[key].resetTime < now) {
      delete memoryStore[key];
    }
  });
}, 5 * 60 * 1000);

// Redis client (lazy-loaded)
let redisClient: any = null;

/**
 * Initialize Redis client
 * Supports both Upstash REST URL and Redis protocol URL
 */
async function initRedis(): Promise<boolean> {
  if (redisClient) return true;

  // Check for Redis URL (Redis protocol) or Upstash REST URL
  const redisUrl = process.env.REDIS_URL;
  const upstashRestUrl = process.env.UPSTASH_REDIS_REST_URL;
  
  if (!redisUrl && !upstashRestUrl) {
    return false;
  }

  // If Upstash REST URL is provided, we need to use Upstash REST API (not ioredis)
  // For now, we'll use ioredis with Redis protocol URL
  // Note: Upstash provides both REST URL and Redis URL - use Redis URL for ioredis
  if (upstashRestUrl && !redisUrl) {
    console.warn('[RateLimit] UPSTASH_REDIS_REST_URL provided but REDIS_URL not set. For ioredis, use Redis protocol URL from Upstash Console (redis:// or rediss:// format). Falling back to in-memory store.');
    console.info('[RateLimit] To use Upstash: Get Redis URL from Upstash Console → Redis Connect → Node.js (ioredis) → Copy the redis:// URL');
    return false;
  }

  if (!redisUrl) {
    return false;
  }

  try {
    // Dynamic import to avoid requiring ioredis if not used
    const Redis = (await import('ioredis')).default;
    
    // Parse Redis URL - Upstash format: rediss://:password@endpoint:port
    // ioredis requires the colon before password: rediss://:PASSWORD@HOST:PORT
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        if (times > 3) {
          return null; // Stop retrying
        }
        return Math.min(times * 200, 2000);
      },
      enableReadyCheck: true,
      connectTimeout: 5000,
      // Upstash uses TLS by default
      tls: redisUrl.startsWith('rediss://') ? {} : undefined,
    });

    redisClient.on('error', (err: Error) => {
      console.error('[RateLimit] Redis error:', err.message);
      redisClient = null; // Fallback to memory cache
    });

    // Test connection
    await redisClient.ping();
    console.log('[RateLimit] ✅ Redis connected successfully');
    return true;
  } catch (error) {
    console.warn('[RateLimit] Redis unavailable, using in-memory store:', error instanceof Error ? error.message : 'Unknown error');
    redisClient = null;
    return false;
  }
}

/**
 * Check rate limit using Redis (with fallback to memory)
 */
export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { windowMs, maxRequests, identifier } = options;
  const now = Date.now();
  const key = `rate_limit:${identifier}:${windowMs}`;
  const resetTime = now + windowMs;

  // Try Redis first
  const redisAvailable = await initRedis();
  
  if (redisAvailable && redisClient) {
    try {
      // Use Redis pipeline for atomic operations
      const pipeline = redisClient.pipeline();
      
      // Increment counter and set expiry
      pipeline.incr(key);
      pipeline.expire(key, Math.ceil(windowMs / 1000));
      
      // Get current count
      pipeline.get(key);
      
      const results = await pipeline.exec();
      
      if (results && results.length >= 3) {
        const count = results[2][1] as number;
        const remaining = Math.max(0, maxRequests - count);
        const allowed = count <= maxRequests;
        
        // Get TTL to calculate actual reset time
        const ttl = await redisClient.ttl(key);
        const actualResetTime = ttl > 0 ? now + (ttl * 1000) : resetTime;
        
        return {
          allowed,
          remaining,
          resetTime: actualResetTime,
        };
      }
    } catch (error) {
      console.warn('[RateLimit] Redis operation failed, falling back to memory:', error instanceof Error ? error.message : 'Unknown error');
      redisClient = null; // Disable Redis for this session
    }
  }

  // Fallback to in-memory store
  const entry = memoryStore[key];

  // If no entry or window expired, create new entry
  if (!entry || entry.resetTime < now) {
    memoryStore[key] = {
      count: 1,
      resetTime,
    };
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime,
    };
  }

  // Increment count
  entry.count += 1;

  // Check if limit exceeded
  if (entry.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client IP from request
 */
export function getClientIP(request: NextRequest): string {
  // Try various headers (for proxies, load balancers, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback (won't work in serverless, but helps in development)
  return 'unknown';
}

/**
 * Reset rate limit for an identifier (useful for testing or manual resets)
 */
export async function resetRateLimit(identifier: string, windowMs: number): Promise<void> {
  const key = `rate_limit:${identifier}:${windowMs}`;
  
  // Try Redis first
  if (await initRedis() && redisClient) {
    try {
      await redisClient.del(key);
      return;
    } catch (error) {
      console.warn('[RateLimit] Failed to reset in Redis:', error);
    }
  }
  
  // Fallback to memory
  delete memoryStore[key];
}
