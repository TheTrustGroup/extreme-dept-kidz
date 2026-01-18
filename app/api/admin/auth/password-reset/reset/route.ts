/**
 * Password Reset Complete Route
 * 
 * POST /api/admin/auth/password-reset/reset
 * 
 * Complete password reset using token.
 * Validates token and updates password.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resetPassword } from '@/lib/services/admin/password-reset.service';
import { apiSuccess, apiError, apiValidationError } from '@/lib/utils/api-response';
import { z } from 'zod';
import { logger } from '@/lib/utils/logger';
import { logActivity, ActivityActions } from '@/lib/services/admin/activity.service';

export const dynamic = 'force-dynamic';

const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Invalid reset token'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

/**
 * POST /api/admin/auth/password-reset/reset
 * 
 * Reset password
 * Body: { token: string, password: string }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate input
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      // Convert validation errors array to Record<string, string>
      const errors: Record<string, string> = {};
      validation.error.errors.forEach(e => {
        const field = e.path.join('.');
        errors[field] = e.message;
      });
      return apiValidationError(errors);
    }

    const { token, password } = validation.data;

    // Verify token first to get user info for logging (before it's invalidated)
    const { verifyResetToken } = await import('@/lib/services/admin/password-reset.service');
    const verification = await verifyResetToken(token);
    
    if (!verification.valid || !verification.userId) {
      return apiError('Invalid or expired reset token', 400);
    }

    // Reset password
    const result = await resetPassword(token, password);

    if (!result.success) {
      return apiError(result.message, 400);
    }

    logger.log('[PasswordReset] Password reset completed successfully');

    // Log password reset activity
    await logActivity({
      adminUserId: verification.userId,
      action: ActivityActions.ADMIN_USER_PASSWORD_RESET,
      resource: 'AdminUser',
      resourceId: verification.userId,
      details: {
        email: verification.email,
      },
    }, request);

    return apiSuccess(
      {
        message: result.message,
      },
      'Password reset successful'
    );
  } catch (error) {
    logger.error('[PasswordReset] Error in reset route:', error);
    return apiError(
      'Failed to reset password',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
