/**
 * Password Reset Token Verification Route
 * 
 * GET /api/admin/auth/password-reset/verify?token=...
 * 
 * Verify if a password reset token is valid.
 * Used by the reset password page to check token before showing form.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyResetToken } from '@/lib/services/admin/password-reset.service';
import { apiSuccess, apiError } from '@/lib/utils/api-response';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/auth/password-reset/verify?token=...
 * 
 * Verify reset token
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return apiError('Reset token is required', 400);
    }

    // Verify token
    const verification = await verifyResetToken(token);

    if (!verification.valid) {
      return apiError(
        verification.message || 'Invalid or expired reset token',
        400
      );
    }

    // Return success with user email (masked for security)
    const maskedEmail = verification.email 
      ? verification.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
      : undefined;

    return apiSuccess(
      {
        valid: true,
        email: maskedEmail, // Masked email for display
      },
      'Reset token is valid'
    );
  } catch (error) {
    logger.error('[PasswordReset] Error in verify route:', error);
    return apiError(
      'Failed to verify reset token',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
