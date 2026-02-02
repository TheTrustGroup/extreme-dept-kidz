/**
 * Admin Route Guard Utility
 * 
 * CRITICAL SECURITY: Server-side authentication and authorization guard
 * for all /api/admin/* routes.
 * 
 * This utility MUST be used on all admin API routes to ensure:
 * - Request is authenticated (valid JWT token)
 * - User has admin role (viewer, manager, admin, or super_admin)
 * - Token is not expired or invalid
 * - User account is active
 * 
 * Usage:
 * ```typescript
 * import { requireAdmin } from '@/lib/auth/requireAdmin';
 * 
 * export async function GET(request: NextRequest) {
 *   const auth = await requireAdmin(request, 'manager'); // or 'admin', 'super_admin', 'viewer'
 *   if (auth.error) return auth.error;
 *   // auth.user is guaranteed to be non-null here
 *   // ... rest of route handler
 * }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateAndAuthorize, type AuthenticatedUser } from './middleware';
import type { AdminRole } from './rbac';

export type AdminAuthResult = {
  user: AuthenticatedUser;
  error: null;
} | {
  user: null;
  error: NextResponse;
};

/**
 * Require admin authentication and authorization
 * 
 * This is a convenience wrapper around authenticateAndAuthorize that:
 * - Returns a type-safe result
 * - Ensures user is non-null if no error
 * - Provides consistent error responses
 * 
 * @param request - Next.js request object
 * @param requiredRole - Minimum role required (default: 'viewer')
 * @returns AdminAuthResult with user (if authenticated) or error response
 * 
 * @example
 * const auth = await requireAdmin(request, 'admin');
 * if (auth.error) return auth.error;
 * // auth.user is guaranteed to be AuthenticatedUser here
 */
export async function requireAdmin(
  request: NextRequest,
  requiredRole: AdminRole = 'viewer'
): Promise<AdminAuthResult> {
  const authResult = await authenticateAndAuthorize(request, requiredRole);
  
  if (authResult.error || !authResult.user) {
    return {
      user: null,
      error: authResult.error || NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }
  
  if (!authResult.authorized) {
    return {
      user: null,
      error: NextResponse.json(
        {
          error: 'Insufficient permissions',
          message: `This action requires ${requiredRole} role or higher`,
        },
        { status: 403 }
      ),
    };
  }
  
  // Type assertion: user is guaranteed to be non-null here
  return {
    user: authResult.user as AuthenticatedUser,
    error: null,
  };
}

/**
 * Require super admin role
 * Convenience function for routes that require super_admin
 */
export async function requireSuperAdmin(request: NextRequest): Promise<AdminAuthResult> {
  return requireAdmin(request, 'super_admin');
}

/**
 * Require admin role or higher
 * Convenience function for routes that require admin or super_admin
 */
export async function requireAdminRole(request: NextRequest): Promise<AdminAuthResult> {
  return requireAdmin(request, 'admin');
}

/**
 * Require manager role or higher
 * Convenience function for routes that require manager, admin, or super_admin
 */
export async function requireManager(request: NextRequest): Promise<AdminAuthResult> {
  return requireAdmin(request, 'manager');
}
