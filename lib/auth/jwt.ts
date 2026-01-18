import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production-min-32-chars';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // Default to 15 minutes for admin tokens

// Warn if using default secret in production
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production-min-32-chars')) {
  console.error('[JWT] ⚠️ CRITICAL: JWT_SECRET is not set or using default value in production!');
  console.error('[JWT] ⚠️ This will cause token verification failures. Set JWT_SECRET in Vercel environment variables.');
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: JWTPayload): string {
  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    const errorMsg = `JWT_SECRET must be at least 32 characters long. Current length: ${JWT_SECRET?.length || 0}. Set JWT_SECRET in Vercel environment variables.`;
    console.error('[JWT] ❌', errorMsg);
    throw new Error(errorMsg);
  }
  
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    } as jwt.SignOptions);
    console.log('[JWT] ✅ Token generated successfully');
    return token;
  } catch (error) {
    console.error('[JWT] ❌ Token generation error:', error);
    throw new Error(`Failed to generate token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    if (!JWT_SECRET || JWT_SECRET.length < 32) {
      console.error('[JWT] ❌ JWT_SECRET is missing or too short:', {
        hasSecret: !!JWT_SECRET,
        length: JWT_SECRET?.length || 0,
        requiredLength: 32,
      });
      return null;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error: unknown) {
    // Log specific JWT errors for debugging
    if (error && typeof error === 'object' && 'name' in error) {
      const jwtError = error as { name: string; message?: string; expiredAt?: Date; date?: Date };
      
      if (jwtError.name === 'JsonWebTokenError') {
        console.error('[JWT] ❌ Token verification failed:', {
          name: jwtError.name,
          message: jwtError.message,
          hasSecret: !!JWT_SECRET,
          secretLength: JWT_SECRET?.length || 0,
        });
      } else if (jwtError.name === 'TokenExpiredError') {
        console.error('[JWT] ❌ Token expired:', {
          expiredAt: jwtError.expiredAt,
        });
      } else if (jwtError.name === 'NotBeforeError') {
        console.error('[JWT] ❌ Token not active yet:', {
          date: jwtError.date,
        });
      } else {
        console.error('[JWT] ❌ Token verification error:', {
          name: jwtError.name,
          message: jwtError.message,
        });
      }
    } else {
      console.error('[JWT] ❌ Unknown token verification error:', error);
    }
    return null;
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
