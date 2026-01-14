import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

/**
 * Database Connection Test Endpoint
 * 
 * ⚠️ SECURITY: Only available in development mode
 * Tests database connectivity and provides detailed diagnostics.
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  // Block in production unless explicitly enabled via environment variable
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEBUG_ENDPOINTS !== 'true') {
    return NextResponse.json(
      { error: 'Debug endpoints are disabled in production' },
      { status: 403 }
    );
  }
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlLength: process.env.DATABASE_URL?.length || 0,
    databaseUrlPreview: process.env.DATABASE_URL 
      ? `${process.env.DATABASE_URL.substring(0, 20)}...` 
      : 'Not set',
    prismaAvailable: !!prisma,
    nodeEnv: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
  };

  // Test Prisma client
  if (!prisma) {
    return NextResponse.json({
      success: false,
      error: 'Prisma client is not available',
      diagnostics: {
        ...diagnostics,
        reason: !process.env.DATABASE_URL 
          ? 'DATABASE_URL environment variable is not set'
          : 'Prisma client initialization failed',
      },
      recommendations: [
        'Check if DATABASE_URL is set in Vercel environment variables',
        'Verify the connection string format is correct',
        'Ensure the connection string uses the Supabase Connection Pooler (port 6543)',
        'Check Supabase project status (not paused)',
      ],
    }, { status: 500 });
  }

  // Test database connection
  try {
    // Use $connect() instead of $queryRaw to avoid prepared statement issues with poolers
    await prisma.$connect();
    
    // Try to count admin users (this will also test the connection)
    const adminCount = await prisma.adminUser.count();
    
    diagnostics.connectionTest = 'success';
    diagnostics.adminUserCount = adminCount;
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      diagnostics,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorCode = (error as any)?.code;
    
    console.error('Database connection test failed:', error);
    
    // Check for specific error codes
    const isPreparedStatementError = errorCode === '42P05' || errorMessage.includes('prepared statement');
    const isConnectionError = errorMessage.includes('Can\'t reach') || errorMessage.includes('Connection');
    const isAuthError = errorMessage.includes('Authentication failed') || errorCode === 'P1000';
    
    const recommendations = [
      'Verify DATABASE_URL is correct in Vercel environment variables',
      'Check if Supabase project is active (not paused)',
      'Verify database password is correct and URL-encoded',
    ];
    
    if (isPreparedStatementError) {
      recommendations.unshift(
        '⚠️ Prepared statement error detected - this is a connection pooler issue',
        'Solution: Ensure DATABASE_URL uses Connection Pooler (port 6543) with ?pgbouncer=true parameter',
        'Example: postgresql://user:pass@host:6543/db?pgbouncer=true&sslmode=require'
      );
    } else if (isConnectionError) {
      recommendations.unshift(
        'Ensure connection string uses Connection Pooler: port 6543',
        'Check Supabase network restrictions/allowlist',
      );
    } else if (isAuthError) {
      recommendations.unshift(
        'Authentication failed - verify password is correct',
        'Make sure password is URL-encoded (e.g., ! becomes %21)',
      );
    }
    
    recommendations.push('Try the connection string from Supabase Dashboard → Settings → Database');
    
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      diagnostics: {
        ...diagnostics,
        connectionTest: 'failed',
        error: errorMessage,
        errorCode: errorCode || undefined,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        isPreparedStatementError,
        isConnectionError,
        isAuthError,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack }),
      },
      recommendations,
    }, { status: 500 });
  }
}
