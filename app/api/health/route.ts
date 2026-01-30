import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

/**
 * Health Check Endpoint
 * 
 * Returns 200 if the service is healthy (database connection works)
 * Returns 503 if the service is unhealthy (database unavailable)
 * 
 * Used by monitoring systems, load balancers, and deployment health checks
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get('X-Request-ID') || undefined;
  
  try {
    // Check database connection
    if (!prisma) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          message: 'Database not available',
          timestamp: new Date().toISOString(),
          ...(requestId && { requestId }),
        },
        { status: 503 }
      );
    }

    // Try a simple query to verify database connectivity
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: 'healthy',
        message: 'Service is operational',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'connected',
        },
        ...(requestId && { requestId }),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        message: 'Database connection failed',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        ...(requestId && { requestId }),
      },
      { status: 503 }
    );
  }
}
