/**
 * CSRF Middleware Helper
 * 
 * Easy-to-use middleware for protecting API routes with CSRF validation
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireCSRFToken } from './csrf';
import { withCors } from '@/lib/utils/cors';

/**
 * CSRF protection middleware
 * Use this in API routes that perform state-changing operations
 * 
 * @example
 * export async function POST(request: NextRequest) {
 *   const csrfCheck = csrfProtection(request);
 *   if (csrfCheck.error) return csrfCheck.error;
 *   // ... rest of handler
 * }
 */
export function csrfProtection(request: NextRequest): { error?: NextResponse } {
  const result = requireCSRFToken(request);
  
  if (!result.valid && result.error) {
    // Convert Response to NextResponse
    const nextResponse = NextResponse.json(
      {
        success: false,
        error: 'CSRF token validation failed',
        message: 'Invalid or missing CSRF token. Please refresh the page and try again.',
      },
      { status: 403 }
    );
    return { error: withCors(request, nextResponse) };
  }
  
  return {};
}
