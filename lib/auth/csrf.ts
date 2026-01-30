/**
 * CSRF Protection
 * 
 * Generates and validates CSRF tokens for state-changing operations
 * Uses double-submit cookie pattern for stateless CSRF protection
 */

import { randomBytes } from 'crypto';
import type { NextRequest } from 'next/server';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Get CSRF token from request (cookie or header)
 */
export function getCSRFToken(request: NextRequest): string | null {
  // Try header first (for API requests)
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (headerToken) {
    return headerToken;
  }

  // Fallback to cookie (for form submissions)
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  return cookieToken || null;
}

/**
 * Validate CSRF token
 * Uses double-submit cookie pattern: token in cookie must match token in header/body
 */
export function validateCSRFToken(request: NextRequest): boolean {
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const submittedToken = getCSRFToken(request);

  if (!cookieToken || !submittedToken) {
    return false;
  }

  // Compare tokens (constant-time comparison to prevent timing attacks)
  return constantTimeEqual(cookieToken, submittedToken);
}

/**
 * Constant-time string comparison (prevents timing attacks)
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Set CSRF token cookie
 */
export function setCSRFTokenCookie(response: Response, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  
  response.headers.append(
    'Set-Cookie',
    `${CSRF_COOKIE_NAME}=${token}; HttpOnly; Secure=${isProduction}; SameSite=Strict; Path=/; Max-Age=${60 * 60 * 24 * 7}` // 7 days
  );
}

/**
 * Middleware to validate CSRF token for state-changing operations
 * Only applies to POST, PUT, DELETE, PATCH requests
 */
export function requireCSRFToken(request: NextRequest): { valid: boolean; error?: Response } {
  const method = request.method.toUpperCase();
  
  // Only check CSRF for state-changing methods
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return { valid: true };
  }

  // Skip CSRF check for public endpoints (login, etc.)
  const pathname = request.nextUrl.pathname;
  const publicPaths = ['/api/admin/auth/login', '/api/admin/auth/logout'];
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return { valid: true };
  }

  // Validate CSRF token
  if (!validateCSRFToken(request)) {
    return {
      valid: false,
      error: new Response(
        JSON.stringify({
          success: false,
          error: 'CSRF token validation failed',
          message: 'Invalid or missing CSRF token. Please refresh the page and try again.',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      ),
    };
  }

  return { valid: true };
}
