import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './jwt';
import { prisma } from '@/lib/db/prisma';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthResult {
  user: AuthenticatedUser | null;
  error: NextResponse | null;
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

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
    const user = await prisma.adminUser.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
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

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
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
 * Check if user has required role
 */
export function hasRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy: Record<string, number> = {
    editor: 1,
    manager: 2,
    super_admin: 3,
  };

  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
}
