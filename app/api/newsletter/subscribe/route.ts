import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { isValidEmail } from '@/lib/utils/validation';
import { sendEmail } from '@/lib/services/email.service';
import { logger } from '@/lib/utils/logger';

const prisma = new PrismaClient();

/**
 * POST /api/newsletter/subscribe
 * 
 * Subscribe an email to the newsletter
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { email, source } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Normalize email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { error: 'This email is already subscribed' },
          { status: 409 }
        );
      } else {
        // Reactivate subscription
        await prisma.newsletterSubscriber.update({
          where: { email: normalizedEmail },
          data: {
            isActive: true,
            subscribedAt: new Date(),
            unsubscribedAt: null,
            source: source || 'footer',
          },
        });

        // Send welcome email
        await sendWelcomeEmail(normalizedEmail);

        return NextResponse.json(
          { message: 'Successfully resubscribed to newsletter' },
          { status: 200 }
        );
      }
    }

    // Get IP address and user agent for metadata
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create new subscription
    await prisma.newsletterSubscriber.create({
      data: {
        email: normalizedEmail,
        isActive: true,
        source: source || 'footer',
        metadata: {
          ipAddress,
          userAgent,
          subscribedAt: new Date().toISOString(),
        },
      },
    });

    // Send welcome email
    await sendWelcomeEmail(normalizedEmail);

    logger.log('[Newsletter] New subscription:', {
      email: normalizedEmail,
      source: source || 'footer',
    });

    return NextResponse.json(
      { message: 'Successfully subscribed to newsletter' },
      { status: 201 }
    );
  } catch (error) {
    logger.error('[Newsletter] Subscription error:', error);
    
    // Handle Prisma unique constraint error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Send welcome email to new subscriber
 */
async function sendWelcomeEmail(email: string): Promise<void> {
  const subject = 'Welcome to EXTREME DEPT KIDZ Newsletter! 🎉';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to EXTREME DEPT KIDZ</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1c1c1c; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #faf7ed;">
      <div style="background: linear-gradient(135deg, #1c1c1c 0%, #2d2d2d 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: #faf7ed; margin: 0; font-size: 28px; font-weight: bold;">EXTREME DEPT KIDZ</h1>
        <p style="color: #d4af37; margin: 10px 0 0 0; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">Welcome to the Family</p>
      </div>
      
      <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
        <h2 style="color: #1c1c1c; margin-top: 0; font-size: 24px; font-weight: 600;">Thanks for joining us! 🎉</h2>
        
        <p style="color: #4a4a4a; font-size: 16px; margin: 20px 0;">
          We're thrilled to have you on board. Get ready for exclusive drops, style tips, and early access to new collections.
        </p>

        <div style="background: linear-gradient(135deg, #1c1c1c 0%, #2d2d2d 100%); padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
          <h3 style="color: #faf7ed; margin: 0 0 10px 0; font-size: 20px; font-weight: 600;">🎁 Special Welcome Offer</h3>
          <p style="color: #d4af37; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 1px;">
            10% OFF
          </p>
          <p style="color: #faf7ed; margin: 10px 0 0 0; font-size: 14px;">
            Your First Order
          </p>
          <p style="color: #faf7ed; margin: 15px 0 0 0; font-size: 12px; opacity: 0.9;">
            Use code: <strong style="letter-spacing: 2px;">WELCOME10</strong>
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://extremedeptkidz.com'}/collections" 
             style="display: inline-block; background: #1c1c1c; color: #faf7ed; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px;">
            Shop Now
          </a>
        </div>

        <div style="background: #f9f9f9; border-left: 4px solid #1c1c1c; padding: 15px; margin: 30px 0; border-radius: 4px;">
          <p style="margin: 0; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
            <strong>What to expect:</strong><br>
            • Exclusive early access to new collections<br>
            • Style tips and outfit inspiration<br>
            • Special offers and promotions<br>
            • Behind-the-scenes content
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e5e5; padding-top: 20px; line-height: 1.6;">
          You're receiving this email because you subscribed to our newsletter. 
          If you no longer wish to receive these emails, you can 
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://extremedeptkidz.com'}/unsubscribe?email=${encodeURIComponent(email)}" 
             style="color: #1c1c1c; text-decoration: underline;">unsubscribe here</a>.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
EXTREME DEPT KIDZ - Welcome to the Family!

Thanks for joining us! 🎉

We're thrilled to have you on board. Get ready for exclusive drops, style tips, and early access to new collections.

🎁 Special Welcome Offer
10% OFF Your First Order
Use code: WELCOME10

Shop now: ${process.env.NEXT_PUBLIC_APP_URL || 'https://extremedeptkidz.com'}/collections

What to expect:
• Exclusive early access to new collections
• Style tips and outfit inspiration
• Special offers and promotions
• Behind-the-scenes content

You're receiving this email because you subscribed to our newsletter. If you no longer wish to receive these emails, you can unsubscribe at any time.
  `;

  await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}
