import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);

  if (authResult.error) {
    return authResult.error;
  }

  return NextResponse.json({
    user: authResult.user,
  });
}
