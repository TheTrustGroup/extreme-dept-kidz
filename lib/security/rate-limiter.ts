/**
 * ENTERPRISE-GRADE RATE LIMITING
 * Prevents brute force, DDoS, and bot attacks
 */

import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
    blocked: boolean;
  };
}

const store: RateLimitStore = {};

// Predefined rate limit tiers
export const RATE_LIMITS = {
  // Strict limits for auth endpoints
  AUTH_LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  AUTH_REGISTER: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 registrations per hour per IP
    message: 'Too many registration attempts. Please try again later.',
  },
  
  // Moderate limits for sensitive operations
  ADMIN_WRITE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 writes per minute
    message: 'Too many requests. Please slow down.',
  },
  FILE_UPLOAD: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 uploads per minute
    message: 'Upload limit reached. Please wait before uploading more.',
  },
  PAYMENT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 payment attempts per minute
    message: 'Too many payment attempts. Please wait.',
  },

  // Standard limits for public APIs
  PUBLIC_READ: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    message: 'Rate limit exceeded. Please try again later.',
  },
  
  // Very strict limits for expensive operations
  SEARCH: {
    windowMs: 60 * 1000,
    maxRequests: 30,
    message: 'Too many search requests.',
  },
};

/**
 * Get client identifier (IP + User Agent fingerprint)
 */
function getClientId(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const userAgent = request.headers.get('user-agent') || '';
  
  // Create fingerprint
  const fingerprint = `${ip}:${userAgent.substring(0, 50)}`;
  
  return fingerprint;
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const clientId = getClientId(request);
  const key = `${clientId}:${config.windowMs}`;
  const now = Date.now();

  // Clean up old entries
  cleanupStore();

  // Get or create rate limit entry
  let entry = store[key];

  if (!entry || now > entry.resetTime) {
    // New window
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
      blocked: false,
    };
    store[key] = entry;
  }

  // Increment count
  entry.count++;

  // Check if blocked
  if (entry.count > config.maxRequests) {
    entry.blocked = true;
    
    // Exponential backoff for repeated violations
    if (entry.count > config.maxRequests * 2) {
      entry.resetTime += config.windowMs; // Double the wait time
    }

    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Clean up expired entries
 */
function cleanupStore() {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now - 60000) { // Keep for 1 min after expiry
      delete store[key];
    }
  });
}

/**
 * Middleware factory for rate limiting
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return (request: NextRequest) => {
    const result = checkRateLimit(request, config);
    
    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: config.message || 'Rate limit exceeded',
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetTime.toString(),
          },
        }
      );
    }

    return null; // Allow request to proceed
  };
}
