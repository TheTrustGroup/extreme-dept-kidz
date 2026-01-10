import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Domain Test Endpoint
 * 
 * Tests if API routes are accessible on custom domain.
 * Helps diagnose domain-specific issues.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  
  return NextResponse.json({
    success: true,
    message: 'API route is accessible',
    domain: url.hostname,
    protocol: url.protocol,
    path: url.pathname,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasJwtSecret: !!process.env.JWT_SECRET,
      jwtSecretLength: process.env.JWT_SECRET?.length || 0,
      vercelUrl: process.env.VERCEL_URL,
      vercelEnv: process.env.VERCEL_ENV,
    },
    timestamp: new Date().toISOString(),
  });
}
