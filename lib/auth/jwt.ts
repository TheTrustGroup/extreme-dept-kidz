import jwt from 'jsonwebtoken';
import { getRequiredEnv } from '@/lib/config/env';

/**
 * CRITICAL SECURITY: JWT_SECRET must be set via environment variable.
 * No defaults, no fallbacks. App will crash if missing.
 */
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === '') {
    throw new Error(
      '❌ CRITICAL: JWT_SECRET environment variable is missing.\n' +
      '   The application cannot start without JWT_SECRET.\n' +
      '   Set JWT_SECRET in Vercel → Settings → Environment Variables.\n' +
      '   It must be at least 32 characters long.'
    );
  }
  if (secret.length < 32) {
    throw new Error(
      `❌ CRITICAL: JWT_SECRET must be at least 32 characters long.\n` +
      `   Current length: ${secret.length}\n` +
      `   Set a longer JWT_SECRET in Vercel environment variables.`
    );
  }
  return secret;
}

const JWT_SECRET = getJWTSecret();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // Match cookie maxAge (7d) so token stays valid for full session

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  tokenVersion?: number; // Token version for session invalidation
}

/**
 * Generate a JWT token for a user
 */
/**
 * Generate a JWT token for a user
 * 
 * CRITICAL: Token includes userId, email, role, iat, and exp.
 * Token version is included for session invalidation.
 */
export function generateToken(payload: JWTPayload): string {
  // JWT_SECRET is validated at module load time, so this should never fail
  // But we check again for safety
  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET is not properly configured. Application cannot generate tokens.');
  }
  
  try {
    const token = jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        tokenVersion: payload.tokenVersion ?? 0,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'extremedeptkidz-admin',
        audience: 'extremedeptkidz-admin',
      } as jwt.SignOptions
    );
    return token;
  } catch (error) {
    throw new Error(`Failed to generate token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify and decode a JWT token
 */
/**
 * Verify and decode a JWT token
 * 
 * CRITICAL SECURITY: Strict verification with:
 * - Signature verification (prevents token forgery)
 * - Expiration check (rejects expired tokens)
 * - Issuer/audience validation
 * - Token structure validation
 * 
 * Returns null if token is invalid, expired, or tampered with.
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    if (!JWT_SECRET || JWT_SECRET.length < 32) {
      // This should never happen if env validation worked, but fail safe
      throw new Error('JWT_SECRET is not properly configured');
    }
    
    // Strict verification with issuer/audience check
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'extremedeptkidz-admin',
      audience: 'extremedeptkidz-admin',
    }) as JWTPayload & { iat?: number; exp?: number };
    
    // Ensure required fields are present
    if (!decoded.userId || !decoded.email || !decoded.role) {
      return null; // Invalid token structure
    }
    
    // Return validated payload
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      tokenVersion: decoded.tokenVersion ?? 0,
    };
  } catch (error: unknown) {
    // All verification failures return null (fail closed)
    // Don't log sensitive token details in production
    if (process.env.NODE_ENV === 'development') {
      if (error && typeof error === 'object' && 'name' in error) {
        const jwtError = error as { name: string; message?: string };
        if (jwtError.name === 'TokenExpiredError') {
          console.warn('[JWT] Token expired');
        } else if (jwtError.name === 'JsonWebTokenError') {
          console.warn('[JWT] Token verification failed:', jwtError.message);
        }
      }
    }
    return null; // Fail closed - reject invalid tokens
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
