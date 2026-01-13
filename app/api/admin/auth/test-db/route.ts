import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

/**
 * Database Connection Test Endpoint
 * 
 * Tests database connectivity and provides detailed diagnostics.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
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
    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Try to count admin users
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
    
    console.error('Database connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      diagnostics: {
        ...diagnostics,
        connectionTest: 'failed',
        error: errorMessage,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack }),
      },
      recommendations: [
        'Verify DATABASE_URL is correct in Vercel environment variables',
        'Check if Supabase project is active (not paused)',
        'Ensure connection string uses Connection Pooler: port 6543',
        'Verify database password is correct and URL-encoded',
        'Check Supabase network restrictions/allowlist',
        'Try the connection string from Supabase Dashboard → Settings → Database',
      ],
    }, { status: 500 });
  }
}
