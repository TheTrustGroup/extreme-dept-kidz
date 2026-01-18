/**
 * Email Service
 * 
 * Handles sending emails for admin operations using Resend.
 * 
 * Setup:
 * 1. Get API key from https://resend.com/api-keys
 * 2. Add to environment: RESEND_API_KEY=re_...
 * 3. Verify your domain in Resend dashboard
 * 4. Set FROM_EMAIL in environment (or it will use default)
 */

import { Resend } from 'resend';
import { logger } from '@/lib/utils/logger';

// Initialize Resend client
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Default from email (can be overridden with FROM_EMAIL env var)
const DEFAULT_FROM_EMAIL = 'info@extremedeptkidz.com';
const FROM_EMAIL = process.env.FROM_EMAIL || DEFAULT_FROM_EMAIL;

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using Resend
 * 
 * @param options - Email options
 * @returns Promise<boolean> - true if sent successfully
 * 
 * @example
 * await sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Password Reset',
 *   html: '<p>Click here to reset...</p>'
 * });
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // If no Resend API key, log in development or return false in production
    if (!resend) {
      if (process.env.NODE_ENV === 'development') {
        logger.log('[Email] Resend API key not set. Would send email:', {
          to: options.to,
          subject: options.subject,
          from: FROM_EMAIL,
          preview: options.text || options.html.substring(0, 100) + '...',
        });
        logger.warn('[Email] To enable email sending, set RESEND_API_KEY in environment variables');
        return true; // Simulate success in development
      }
      
      logger.error('[Email] RESEND_API_KEY not configured. Email not sent.');
      return false;
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      logger.error('[Email] Resend API error:', error);
      return false;
    }

    if (data) {
      logger.log('[Email] Email sent successfully:', {
        id: data.id,
        to: options.to,
        subject: options.subject,
      });
      return true;
    }

    logger.warn('[Email] No data returned from Resend');
    return false;
  } catch (error) {
    logger.error('[Email] Error sending email:', error);
    return false;
  }
}

/**
 * Send password reset email
 * 
 * @param email - Recipient email
 * @param resetToken - Password reset token
 * @param resetUrl - Full URL for password reset
 * @returns Promise<boolean>
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  resetUrl: string
): Promise<boolean> {
  const subject = 'Reset Your Admin Password - EXTREME DEPT KIDZ';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 24px;">EXTREME DEPT KIDZ</h1>
        <p style="color: #e0e7ff; margin: 10px 0 0 0;">Admin Dashboard</p>
      </div>
      
      <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1e3a8a; margin-top: 0;">Password Reset Request</h2>
        
        <p>You requested to reset your admin password. Click the button below to reset it:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="display: inline-block; background: #1e3a8a; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          Or copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
        </p>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
EXTREME DEPT KIDZ - Admin Dashboard
Password Reset Request

You requested to reset your admin password. Click the link below to reset it:

${resetUrl}

This link will expire in 1 hour. If you didn't request this reset, please ignore this email.

This is an automated message. Please do not reply to this email.
  `;

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}
