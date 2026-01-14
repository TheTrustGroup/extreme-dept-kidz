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
 */
export function apiSuccess<T>(
  data: T,
  message?: string,
  metadata?: Record<string, any>
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  });
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
  
  return NextResponse.json(
    {
      success: false,
      error: isProduction && status === 500 ? 'Internal server error' : error,
      details: isProduction ? undefined : details,
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
