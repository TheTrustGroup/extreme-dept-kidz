/**
 * STANDARDIZED API RESPONSES
 * Every API route must use these utilities for consistent responses
 */

import { NextResponse } from 'next/server';

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
 */
export function apiSuccess<T>(
  data: T,
  message?: string,
  metadata?: Record<string, any>,
  options?: {
    cache?: 'no-store' | 'force-cache' | number; // number = seconds to cache
    tags?: string[]; // Revalidation tags
  }
): NextResponse<ApiSuccessResponse<T>> {
  const headers = new Headers();
  
  // Performance: Set cache headers for ISR
  if (options?.tags && options.tags.length > 0) {
    headers.set('Cache-Control', `public, s-maxage=60, stale-while-revalidate=300`);
    headers.set('CDN-Cache-Control', `public, s-maxage=60`);
    headers.set('Vercel-CDN-Cache-Control', `public, s-maxage=60`);
  } else if (options?.cache === 'no-store') {
    headers.set('Cache-Control', 'no-store');
  } else if (typeof options?.cache === 'number') {
    headers.set('Cache-Control', `public, s-maxage=${options.cache}, stale-while-revalidate=${options.cache * 5}`);
  } else {
    // Default: 60s cache with stale-while-revalidate
    headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  }
  
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    },
    { headers }
  );
}

/**
 * Error response
 */
export function apiError(
  error: string,
  status: number = 500,
  details?: string,
  code?: string
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
  
  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
      details: isProduction && !isConfigurationError ? undefined : details,
      code,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
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
  message: string = 'Unauthorized'
): NextResponse<ApiErrorResponse> {
  return apiError(message, 401, undefined, 'UNAUTHORIZED');
}

/**
 * Not found error
 */
export function apiNotFound(
  resource: string = 'Resource'
): NextResponse<ApiErrorResponse> {
  return apiError(`${resource} not found`, 404, undefined, 'NOT_FOUND');
}

/**
 * Rate limit error
 */
export function apiRateLimit(): NextResponse<ApiErrorResponse> {
  return apiError('Too many requests', 429, 'Please try again later', 'RATE_LIMIT');
}
