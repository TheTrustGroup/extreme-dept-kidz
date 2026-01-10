import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

/**
 * Comprehensive diagnostic endpoint to troubleshoot admin login issues
 * This endpoint checks:
 * - Database connection
 * - Environment variables
 * - Admin user existence
 * - Password verification
 * - JWT generation
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const diagnostics: {
    timestamp: string;
    database: {
      connected: boolean;
      error?: string;
      adminUserCount?: number;
      adminUsers?: Array<{
        id: string;
        email: string;
        name: string;
        role: string;
        isActive: boolean;
      }>;
    };
    environment: {
      databaseUrl: {
        set: boolean;
        valid: boolean;
        error?: string;
      };
      jwtSecret: {
        set: boolean;
        valid: boolean;
        length?: number;
      };
      jwtExpiresIn: {
        set: boolean;
        value?: string;
      };
    };
    testLogin: {
      email: string;
      password: string;
      userExists: boolean;
      userActive: boolean;
      passwordValid: boolean;
      jwtGenerated: boolean;
      errors: string[];
    };
  } = {
    timestamp: new Date().toISOString(),
    database: {
      connected: false,
    },
    environment: {
      databaseUrl: {
        set: false,
        valid: false,
      },
      jwtSecret: {
        set: false,
        valid: false,
      },
      jwtExpiresIn: {
        set: false,
      },
    },
    testLogin: {
      email: 'admin@extremedeptkidz.com',
      password: 'Admin123!',
      userExists: false,
      userActive: false,
      passwordValid: false,
      jwtGenerated: false,
      errors: [],
    },
  };

  // Check environment variables
  const databaseUrl = process.env.DATABASE_URL;
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

  diagnostics.environment.databaseUrl.set = !!databaseUrl;
  diagnostics.environment.databaseUrl.valid = !!databaseUrl && databaseUrl.includes('postgresql://');

  if (databaseUrl && !databaseUrl.includes('postgresql://')) {
    diagnostics.environment.databaseUrl.error = 'DATABASE_URL does not appear to be a PostgreSQL connection string';
  }

  diagnostics.environment.jwtSecret.set = !!jwtSecret;
  diagnostics.environment.jwtSecret.valid = !!jwtSecret && jwtSecret.length >= 32;
  if (jwtSecret) {
    diagnostics.environment.jwtSecret.length = jwtSecret.length;
  }

  diagnostics.environment.jwtExpiresIn.set = !!jwtExpiresIn;

  // Check database connection
  if (!prisma) {
    diagnostics.database.error = 'Prisma client is null - DATABASE_URL may not be set';
    diagnostics.testLogin.errors.push('Database connection unavailable');
  } else {
    try {
      // Test connection
      await prisma.$connect();
      diagnostics.database.connected = true;

      // Get admin users
      const adminUsers = await prisma.adminUser.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      diagnostics.database.adminUserCount = adminUsers.length;
      diagnostics.database.adminUsers = adminUsers;

      // Test login with default credentials
      const testEmail = diagnostics.testLogin.email;
      const testPassword = diagnostics.testLogin.password;

      const user = await prisma.adminUser.findUnique({
        where: { email: testEmail.toLowerCase() },
      });

      if (user) {
        diagnostics.testLogin.userExists = true;
        diagnostics.testLogin.userActive = user.isActive;

        if (user.isActive) {
          // Test password
          try {
            const isValid = await verifyPassword(testPassword, user.passwordHash);
            diagnostics.testLogin.passwordValid = isValid;

            if (isValid && diagnostics.environment.jwtSecret.valid) {
              // Test JWT generation
              try {
                const token = generateToken({
                  userId: user.id,
                  email: user.email,
                  role: user.role,
                });
                diagnostics.testLogin.jwtGenerated = !!token;
              } catch (jwtError) {
                diagnostics.testLogin.errors.push(`JWT generation failed: ${jwtError instanceof Error ? jwtError.message : 'Unknown error'}`);
              }
            } else if (!isValid) {
              diagnostics.testLogin.errors.push('Password verification failed - password hash does not match');
            } else {
              diagnostics.testLogin.errors.push('JWT_SECRET is not valid (must be at least 32 characters)');
            }
          } catch (pwdError) {
            diagnostics.testLogin.errors.push(`Password verification error: ${pwdError instanceof Error ? pwdError.message : 'Unknown error'}`);
          }
        } else {
          diagnostics.testLogin.errors.push('User exists but is inactive');
        }
      } else {
        diagnostics.testLogin.errors.push(`Admin user with email ${testEmail} not found in database`);
      }
    } catch (dbError) {
      diagnostics.database.connected = false;
      diagnostics.database.error = dbError instanceof Error ? dbError.message : 'Unknown database error';
      diagnostics.testLogin.errors.push(`Database connection failed: ${diagnostics.database.error}`);
    }
  }

  // Determine overall status
  const allChecksPass = 
    diagnostics.database.connected &&
    diagnostics.environment.databaseUrl.valid &&
    diagnostics.environment.jwtSecret.valid &&
    diagnostics.testLogin.userExists &&
    diagnostics.testLogin.userActive &&
    diagnostics.testLogin.passwordValid &&
    diagnostics.testLogin.jwtGenerated;

  return NextResponse.json({
    status: allChecksPass ? 'success' : 'issues_found',
    allChecksPass,
    diagnostics,
    recommendations: generateRecommendations(diagnostics),
  });
}

function generateRecommendations(diagnostics: any): string[] {
  const recommendations: string[] = [];

  if (!diagnostics.environment.databaseUrl.set) {
    recommendations.push('❌ DATABASE_URL is not set in Vercel environment variables. Add it in Settings → Environment Variables');
  } else if (!diagnostics.environment.databaseUrl.valid) {
    recommendations.push('⚠️ DATABASE_URL appears invalid. Check the format: postgresql://user:password@host:port/database?sslmode=require');
  }

  if (!diagnostics.environment.jwtSecret.set) {
    recommendations.push('❌ JWT_SECRET is not set in Vercel environment variables. Add it in Settings → Environment Variables');
  } else if (!diagnostics.environment.jwtSecret.valid) {
    recommendations.push(`⚠️ JWT_SECRET is too short (${diagnostics.environment.jwtSecret.length} chars). Must be at least 32 characters. Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`);
  }

  if (!diagnostics.database.connected) {
    recommendations.push('❌ Database connection failed. Check DATABASE_URL and ensure Supabase project is active');
  }

  if (diagnostics.database.adminUserCount === 0) {
    recommendations.push('❌ No admin users found in database. Run the SQL INSERT statement in Supabase SQL Editor (see FIX_LOGIN_NOW.md)');
  }

  if (!diagnostics.testLogin.userExists) {
    recommendations.push(`❌ Admin user with email ${diagnostics.testLogin.email} not found. Create it using the SQL in FIX_LOGIN_NOW.md`);
  }

  if (diagnostics.testLogin.userExists && !diagnostics.testLogin.userActive) {
    recommendations.push('⚠️ Admin user exists but is inactive. Update isActive = true in Supabase');
  }

  if (diagnostics.testLogin.userExists && diagnostics.testLogin.userActive && !diagnostics.testLogin.passwordValid) {
    recommendations.push('❌ Password verification failed. The password hash in the database does not match "Admin123!". Generate a new hash with: npm run generate-hash "Admin123!" and update the user in Supabase');
  }

  if (diagnostics.testLogin.errors.length > 0) {
    recommendations.push(`⚠️ Errors found: ${diagnostics.testLogin.errors.join('; ')}`);
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ All checks passed! Login should work correctly.');
  }

  return recommendations;
}
