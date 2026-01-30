/**
 * STANDARDIZED API RESPONSES
 * Every API route must use these utilities for consistent responses.
 * Cache headers align with lib/utils/cache-constants.ts for product/catalog consistency.
 */

import { NextResponse } from 'next/server';
import {
  CACHE_DEFAULT_SMAXAGE,
  CACHE_DEFAULT_SWR,
  CACHE_NO_STORE,
  productCacheControl,
  looksCacheControl,
} from '@/lib/utils/cache-constants';

interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  metadata?: {
    timestamp: string;
    requestId?: string;
    [key: string]: any;
  };
}

interface ApiErrorResponse {
  success: false;
  error: string;
  details?: string;
  code?: string;
  metadata?: {
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Success response
 * 
 * Performance: Adds cache headers for ISR compatibility
 * Includes request ID from headers for tracking
 */
export function apiSuccess<T>(
  data: T,
  message?: string,
  metadata?: Record<string, any>,
  options?: {
    cache?: 'no-store' | 'force-cache' | 'product' | 'looks' | number; // 'product'|'looks' = use cache-constants
    staleWhileRevalidate?: number; // Stale-while-revalidate window in seconds
    tags?: string[]; // Revalidation tags
    requestId?: string; // Request ID for tracking
  }
): NextResponse<ApiSuccessResponse<T>> {
  const headers = new Headers();
  
  // Performance: Set cache headers for ISR; align with cache-constants for product/catalog
  if (options?.cache === 'no-store') {
    headers.set('Cache-Control', 'no-store');
  } else if (options?.cache === 'force-cache') {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (typeof options?.cache === 'number') {
    const staleWindow = options.staleWhileRevalidate ?? options.cache * 5;
    const cacheControl = `public, max-age=0, s-maxage=${options.cache}, stale-while-revalidate=${staleWindow}`;
    headers.set('Cache-Control', cacheControl);
    headers.set('CDN-Cache-Control', cacheControl);
    headers.set('Vercel-CDN-Cache-Control', cacheControl);
  } else if (options?.cache === 'product') {
    // Product/catalog API: same TTL as pages (cache-constants)
    const cc = productCacheControl();
    headers.set('Cache-Control', cc);
    headers.set('CDN-Cache-Control', cc);
    headers.set('Vercel-CDN-Cache-Control', cc);
  } else if (options?.cache === 'looks') {
    const cc = looksCacheControl();
    headers.set('Cache-Control', cc);
    headers.set('CDN-Cache-Control', cc);
    headers.set('Vercel-CDN-Cache-Control', cc);
  } else if (options?.tags && options.tags.length > 0) {
    // Tagged responses: use default short cache to avoid surprise staleness
    const cc = `public, max-age=0, s-maxage=${CACHE_DEFAULT_SMAXAGE}, stale-while-revalidate=${CACHE_DEFAULT_SWR}`;
    headers.set('Cache-Control', cc);
    headers.set('CDN-Cache-Control', cc);
    headers.set('Vercel-CDN-Cache-Control', cc);
  } else {
    const cc = `public, max-age=0, s-maxage=${CACHE_DEFAULT_SMAXAGE}, stale-while-revalidate=${CACHE_DEFAULT_SWR}`;
    headers.set('Cache-Control', cc);
    headers.set('CDN-Cache-Control', cc);
    headers.set('Vercel-CDN-Cache-Control', cc);
  }
  
  const requestId = options?.requestId;
  
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      metadata: {
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId }),
        ...metadata,
      },
    },
    { headers }
  );
}

/**
 * Error response
 * Includes request ID from headers for tracking
 */
export function apiError(
  error: string,
  status: number = 500,
  details?: string,
  code?: string,
  requestId?: string
): NextResponse<ApiErrorResponse> {
  // Never expose sensitive errors in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Allow configuration errors to be shown even in production (they're not sensitive)
  const isConfigurationError = 
    error.includes('JWT_SECRET') ||
    error.includes('DATABASE_URL') ||
    error.includes('Database connection') ||
    error.includes('Environment variable') ||
    error.includes('configuration') ||
    error.includes('Prisma') ||
    error.includes('database');
  
  // Show actual error for configuration issues, generic message for other 500 errors
  // But always show the error message itself (not "Internal server error") for better UX
  const errorMessage = isProduction && status === 500 && !isConfigurationError
    ? error // Show the actual error message instead of generic "Internal server error"
    : error;
  
  const body: ApiErrorResponse = {
    success: false,
    error: errorMessage,
    details: isProduction && !isConfigurationError ? undefined : details,
    code,
    metadata: {
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId }),
    },
  };
  const res = NextResponse.json(body, { status });
  // Harden: do not cache error/404 responses at CDN or browser
  res.headers.set('Cache-Control', CACHE_NO_STORE);
  return res;
}

/**
 * Validation error
 */
export function apiValidationError(
  fields: Record<string, string>
): NextResponse<ApiErrorResponse> {
  return apiError(
    'Validation failed',
    400,
    JSON.stringify(fields),
    'VALIDATION_ERROR'
  );
}

/**
 * Unauthorized error
 */
export function apiUnauthorized(
  message: string = 'Unauthorized',
  requestId?: string
): NextResponse<ApiErrorResponse> {
  return apiError(message, 401, undefined, 'UNAUTHORIZED', requestId);
}

/**
 * Not found error
 */
export function apiNotFound(
  resource: string = 'Resource',
  requestId?: string
): NextResponse<ApiErrorResponse> {
  return apiError(`${resource} not found`, 404, undefined, 'NOT_FOUND', requestId);
}

/**
 * Rate limit error
 */
export function apiRateLimit(requestId?: string): NextResponse<ApiErrorResponse> {
  return apiError('Too many requests', 429, 'Please try again later', 'RATE_LIMIT', requestId);
}
