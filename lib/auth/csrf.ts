/**
 * CSRF Protection Utilities
 * 
 * Simple CSRF token generation and validation
 */

import { randomBytes } from 'crypto';

const CSRF_TOKENS = new Map<string, { token: string; expiresAt: number }>();

// Clean up expired tokens every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of CSRF_TOKENS.entries()) {
    if (value.expiresAt < now) {
      CSRF_TOKENS.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(sessionId: string): string {
  const token = randomBytes(32).toString('hex');
  CSRF_TOKENS.set(sessionId, {
    token,
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
  });
  return token;
}

/**
 * Verify a CSRF token
 */
export function verifyCSRFToken(sessionId: string, token: string): boolean {
  const stored = CSRF_TOKENS.get(sessionId);
  if (!stored) {
    return false;
  }

  if (stored.expiresAt < Date.now()) {
    CSRF_TOKENS.delete(sessionId);
    return false;
  }

  return stored.token === token;
}

/**
 * Get CSRF token for session
 */
export function getCSRFToken(sessionId: string): string | null {
  const stored = CSRF_TOKENS.get(sessionId);
  if (!stored || stored.expiresAt < Date.now()) {
    return null;
  }
  return stored.token;
}
