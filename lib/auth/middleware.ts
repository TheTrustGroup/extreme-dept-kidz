import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './jwt';
import { prisma } from '@/lib/db/prisma';
import { hasRequiredRole, requireRole, type AdminRole } from './rbac';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  /** When set, APIs should scope data (e.g. orders) to this POS. */
  assignedPos?: string | null;
}

export interface AuthResult {
  user: AuthenticatedUser | null;
  error: NextResponse | null;
}

export interface AuthAndRoleResult extends AuthResult {
  authorized: boolean;
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthResult> {
  // Try Authorization header first
  let token: string | null = null;
  const authHeader = request.headers.get('authorization');
  token = extractTokenFromHeader(authHeader);

  // Fallback to cookie if no Authorization header
  if (!token) {
    const cookieToken = request.cookies.get('admin-token')?.value;
    if (cookieToken) {
      token = cookieToken;
    }
  }

  if (!token) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      ),
    };
  }

  // Verify user still exists and is active
  try {
    if (!prisma) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Database connection unavailable' },
          { status: 500 }
        ),
      };
    }

    const user = await prisma.adminUser.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        assignedPos: true,
        isActive: true,
        tokenVersion: true,
      },
    });

    if (!user || !user.isActive) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'User not found or inactive' },
          { status: 401 }
        ),
      };
    }

    // Verify token version matches (session invalidation check)
    const tokenVersion = payload.tokenVersion ?? 0;
    if (user.tokenVersion !== tokenVersion) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Session expired. Please log in again.' },
          { status: 401 }
        ),
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        assignedPos: user.assignedPos ?? undefined,
      },
      error: null,
    };
  } catch (error) {
    console.error('Database error in authentication:', error);
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Authenticate and authorize request with role check
 * 
 * @param request - Next.js request object
 * @param requiredRole - Minimum role required (or array of allowed roles)
 * @returns AuthAndRoleResult with user, error, and authorization status
 * 
 * @example
 * const result = await authenticateAndAuthorize(request, 'admin');
 * if (result.error) return result.error;
 * if (!result.authorized) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
 */
export async function authenticateAndAuthorize(
  request: NextRequest,
  requiredRole: AdminRole | AdminRole[]
): Promise<AuthAndRoleResult> {
  // First authenticate
  const authResult = await authenticateRequest(request);
  
  if (authResult.error || !authResult.user) {
    return {
      ...authResult,
      authorized: false,
    };
  }

  // Then check authorization
  const userRole = authResult.user.role;
  let authorized: boolean;

  if (Array.isArray(requiredRole)) {
    // Multiple roles allowed
    authorized = requireRole(userRole, requiredRole);
  } else {
    // Single role required (hierarchical)
    authorized = hasRequiredRole(userRole, requiredRole);
  }

  if (!authorized) {
    return {
      user: authResult.user,
      error: NextResponse.json(
        {
          error: 'Insufficient permissions',
          message: `This action requires ${Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole} role or higher`,
          userRole: userRole,
          requiredRole: Array.isArray(requiredRole) ? requiredRole : [requiredRole],
        },
        { status: 403 }
      ),
      authorized: false,
    };
  }

  return {
    user: authResult.user,
    error: null,
    authorized: true,
  };
}

/**
 * Check if user has required role
 * 
 * @deprecated Use hasRequiredRole from '@/lib/auth/rbac' instead
 * Kept for backward compatibility during migration
 */
export function hasRole(userRole: string, requiredRole: string): boolean {
  // Import the new RBAC function
  const { hasRequiredRole } = require('./rbac');
  return hasRequiredRole(userRole, requiredRole as any);
}
