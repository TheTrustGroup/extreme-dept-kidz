/**
 * Password Reset Request Route
 * 
 * POST /api/admin/auth/password-reset/request
 * 
 * Request a password reset for an admin user.
 * Generates a secure token and sends reset email.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordReset } from '@/lib/services/admin/password-reset.service';
import { sendPasswordResetEmail } from '@/lib/services/email.service';
import { apiSuccess, apiError, apiValidationError } from '@/lib/utils/api-response';
import { z } from 'zod';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';

const requestResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

/**
 * POST /api/admin/auth/password-reset/request
 * 
 * Request password reset
 * Body: { email: string }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = requestResetSchema.safeParse(body);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach(e => {
        errors[e.path.join('.')] = e.message;
      });
      return apiValidationError(errors);
    }

    const { email } = validation.data;

    // Request password reset
    const result = await requestPasswordReset(email);

    if (!result.success) {
      return apiError(result.message, 500);
    }

    // If token was generated, send email
    if (result.token && result.expiresAt) {
      // Build reset URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                     process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                     'http://localhost:3000';
      
      const resetUrl = `${baseUrl}/admin/reset-password?token=${result.token}`;

      // Send email (in development, this will just log)
      const emailSent = await sendPasswordResetEmail(email, result.token, resetUrl);

      if (!emailSent) {
        logger.warn('[PasswordReset] Email sending failed, but token was generated');
        // In development, return token in response for testing
        if (process.env.NODE_ENV === 'development') {
          return apiSuccess(
            {
              message: 'Password reset token generated. In development, token is returned in response.',
              token: result.token, // Only in development!
              resetUrl,
              expiresAt: result.expiresAt,
            },
            'Password reset requested (development mode - token in response)'
          );
        }
      }

      logger.log(`[PasswordReset] Password reset email sent to ${email}`);
    }

    // Always return success message (security: don't reveal if email exists)
    return apiSuccess(
      {
        message: 'If an account with that email exists, a password reset link has been sent.',
      },
      'Password reset requested'
    );
  } catch (error) {
    logger.error('[PasswordReset] Error in request route:', error);
    return apiError(
      'Failed to process password reset request',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
