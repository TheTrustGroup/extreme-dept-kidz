import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';

export const dynamic = 'force-dynamic';

/**
 * Password Verification Test Endpoint
 * 
 * This endpoint helps diagnose password verification issues.
 * It tests if a password matches the stored hash for an admin user.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database connection unavailable' },
        { status: 500 }
      );
    }

    // Find user
    const user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        exists: false,
        message: 'User not found in database',
        email: email.toLowerCase(),
      });
    }

    // Test password
    const isValid = await verifyPassword(password, user.passwordHash);

    return NextResponse.json({
      exists: true,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      passwordValid: isValid,
      passwordHashPrefix: user.passwordHash.substring(0, 20) + '...',
      message: isValid 
        ? '✅ Password is valid!' 
        : '❌ Password does not match the stored hash',
    });
  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json(
      { 
        error: 'Verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
