/**
 * Password Reset Service
 * 
 * Handles password reset token generation, validation, and password updates.
 * 
 * Security features:
 * - Secure token generation (crypto.randomBytes)
 * - Token expiration (1 hour)
 * - One-time use tokens
 * - Rate limiting on reset requests
 */

import { randomBytes } from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/password';
import { logger } from '@/lib/utils/logger';

const TOKEN_EXPIRY_HOURS = 1;
const TOKEN_BYTES = 32; // 256-bit token

export interface PasswordResetToken {
  token: string;
  expiresAt: Date;
}

export interface PasswordResetResult {
  success: boolean;
  message: string;
  token?: string;
  expiresAt?: Date;
}

/**
 * Generate a secure password reset token
 * 
 * @returns PasswordResetToken with token and expiration
 */
export function generateResetToken(): PasswordResetToken {
  const token = randomBytes(TOKEN_BYTES).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);
  
  return { token, expiresAt };
}

/**
 * Request password reset for an admin user
 * 
 * @param email - Admin user email
 * @returns PasswordResetResult
 */
export async function requestPasswordReset(
  email: string
): Promise<PasswordResetResult> {
  try {
    if (!prisma) {
      logger.error('[PasswordReset] Prisma client not available');
      return {
        success: false,
        message: 'Database connection unavailable',
      };
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await prisma.adminUser.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive',
        },
        isActive: true,
      },
    });

    // Don't reveal if user exists (security best practice)
    // Always return success message to prevent email enumeration
    if (!user) {
      logger.warn(`[PasswordReset] Password reset requested for non-existent user: ${normalizedEmail}`);
      // Return success to prevent email enumeration
      return {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Check rate limiting - prevent abuse
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    if (user.passwordResetRequestedAt && user.passwordResetRequestedAt > oneHourAgo) {
      logger.warn(`[PasswordReset] Rate limit: Reset requested too soon for ${user.email}`);
      // Still return success to prevent enumeration
      return {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Generate reset token
    const { token, expiresAt } = generateResetToken();

    // Store token in database
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpiresAt: expiresAt,
        passwordResetRequestedAt: new Date(),
      },
    });

    logger.log(`[PasswordReset] Reset token generated for ${user.email}`);

    return {
      success: true,
      message: 'Password reset link has been sent to your email.',
      token, // In production, this would be sent via email, not returned
      expiresAt,
    };
  } catch (error) {
    logger.error('[PasswordReset] Error requesting password reset:', error);
    return {
      success: false,
      message: 'Failed to process password reset request. Please try again later.',
    };
  }
}

/**
 * Verify password reset token
 * 
 * @param token - Reset token to verify
 * @returns true if token is valid, false otherwise
 */
export async function verifyResetToken(token: string): Promise<{
  valid: boolean;
  userId?: string;
  email?: string;
  message?: string;
}> {
  try {
    if (!prisma) {
      return {
        valid: false,
        message: 'Database connection unavailable',
      };
    }

    if (!token || token.length < 10) {
      return {
        valid: false,
        message: 'Invalid reset token',
      };
    }

    // Find user with this token
    const user = await prisma.adminUser.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiresAt: {
          gt: new Date(), // Token not expired
        },
        isActive: true,
      },
    });

    if (!user) {
      return {
        valid: false,
        message: 'Invalid or expired reset token',
      };
    }

    return {
      valid: true,
      userId: user.id,
      email: user.email,
    };
  } catch (error) {
    logger.error('[PasswordReset] Error verifying token:', error);
    return {
      valid: false,
      message: 'Failed to verify reset token',
    };
  }
}

/**
 * Reset password using token
 * 
 * @param token - Reset token
 * @param newPassword - New password
 * @returns PasswordResetResult
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<PasswordResetResult> {
  try {
    if (!prisma) {
      return {
        success: false,
        message: 'Database connection unavailable',
      };
    }

    // Validate password
    if (!newPassword || newPassword.length < 8) {
      return {
        success: false,
        message: 'Password must be at least 8 characters long',
      };
    }

    // Verify token
    const verification = await verifyResetToken(token);
    if (!verification.valid || !verification.userId) {
      return {
        success: false,
        message: verification.message || 'Invalid or expired reset token',
      };
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password and clear reset token
    await prisma.adminUser.update({
      where: { id: verification.userId },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        passwordResetRequestedAt: null,
        updatedAt: new Date(),
      },
    });

    logger.log(`[PasswordReset] Password reset successful for ${verification.email}`);

    return {
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    };
  } catch (error) {
    logger.error('[PasswordReset] Error resetting password:', error);
    return {
      success: false,
      message: 'Failed to reset password. Please try again.',
    };
  }
}
