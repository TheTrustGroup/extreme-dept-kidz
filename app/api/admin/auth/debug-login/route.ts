import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/**
 * Debug Login Endpoint
 * 
 * Comprehensive diagnostic endpoint to identify exactly why login is failing.
 * This provides detailed information about each step of the login process.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required',
      }, { status: 400 });
    }

    const diagnostics: Record<string, any> = {
      timestamp: new Date().toISOString(),
      input: {
        email: email,
        emailNormalized: email.toLowerCase().trim(),
        passwordLength: password.length,
        passwordTrimmedLength: password.trim().length,
      },
      database: {
        prismaAvailable: !!prisma,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      },
      steps: {},
    };

    // Step 1: Check Prisma
    if (!prisma) {
      return NextResponse.json({
        success: false,
        error: 'Prisma client not available',
        diagnostics,
      }, { status: 500 });
    }

    diagnostics.steps.prismaCheck = '✅ Passed';

    // Step 2: Find user
    const normalizedEmail = email.toLowerCase().trim();
    let user;
    try {
      user = await prisma.adminUser.findUnique({
        where: { email: normalizedEmail },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          passwordHash: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (dbError) {
      diagnostics.steps.findUser = {
        status: '❌ Failed',
        error: dbError instanceof Error ? dbError.message : 'Unknown error',
      };
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        diagnostics,
      }, { status: 500 });
    }

    if (!user) {
      // Get all users to help debug
      const allUsers = await prisma.adminUser.findMany({
        select: {
          email: true,
          name: true,
          role: true,
        },
      });

      diagnostics.steps.findUser = {
        status: '❌ Failed',
        message: 'User not found',
        searchedEmail: normalizedEmail,
        allUsersInDatabase: allUsers,
      };

      return NextResponse.json({
        success: false,
        error: 'User not found',
        diagnostics,
      }, { status: 404 });
    }

    diagnostics.steps.findUser = {
      status: '✅ Passed',
      userFound: true,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      hasPasswordHash: !!user.passwordHash,
      passwordHashLength: user.passwordHash?.length || 0,
      passwordHashPrefix: user.passwordHash?.substring(0, 30) || 'none',
    };

    // Step 3: Check if active
    if (!user.isActive) {
      diagnostics.steps.activeCheck = {
        status: '❌ Failed',
        message: 'Account is inactive',
      };
      return NextResponse.json({
        success: false,
        error: 'Account is inactive',
        diagnostics,
      }, { status: 403 });
    }

    diagnostics.steps.activeCheck = '✅ Passed';

    // Step 4: Verify password
    const trimmedPassword = password.trim();
    
    // Test with verifyPassword function
    let verifyPasswordResult = false;
    let verifyPasswordError: string | null = null;
    try {
      verifyPasswordResult = await verifyPassword(trimmedPassword, user.passwordHash);
    } catch (error) {
      verifyPasswordError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Also test with bcrypt directly for comparison
    let bcryptDirectResult = false;
    let bcryptDirectError: string | null = null;
    try {
      bcryptDirectResult = await bcrypt.compare(trimmedPassword, user.passwordHash);
    } catch (error) {
      bcryptDirectError = error instanceof Error ? error.message : 'Unknown error';
    }

    diagnostics.steps.passwordVerification = {
      status: verifyPasswordResult ? '✅ Passed' : '❌ Failed',
      verifyPasswordResult,
      verifyPasswordError,
      bcryptDirectResult,
      bcryptDirectError,
      passwordHashFormat: user.passwordHash?.startsWith('$2') ? 'bcrypt' : 'unknown',
      passwordHashRounds: user.passwordHash?.match(/\$(\d+)\$/)?.[1] || 'unknown',
    };

    // Step 5: Check JWT secret
    const jwtSecret = process.env.JWT_SECRET;
    diagnostics.steps.jwtCheck = {
      status: jwtSecret && jwtSecret.length >= 32 ? '✅ Passed' : '❌ Failed',
      hasJwtSecret: !!jwtSecret,
      jwtSecretLength: jwtSecret?.length || 0,
      jwtSecretValid: jwtSecret && jwtSecret.length >= 32,
    };

    // Final result
    const success = verifyPasswordResult && user.isActive;

    return NextResponse.json({
      success,
      message: success 
        ? '✅ All checks passed - login should work!' 
        : '❌ Login failed - see diagnostics below',
      diagnostics,
      recommendation: !user
        ? 'User not found. Create admin user using SQL script.'
        : !user.isActive
        ? 'User exists but is inactive. Update isActive to true.'
        : !verifyPasswordResult
        ? 'Password verification failed. The password hash may not match. Try resetting the password.'
        : 'All checks passed but login still fails. Check JWT_SECRET and token generation.',
    });
  } catch (error) {
    console.error('Debug login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
