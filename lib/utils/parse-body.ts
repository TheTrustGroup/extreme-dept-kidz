/**
 * Safe JSON body parsing for API routes.
 * Returns 400 Bad Request for invalid or empty JSON instead of throwing (500).
 */

import { NextRequest, NextResponse } from 'next/server';

export type ParseJsonResult =
  | { ok: true; data: unknown }
  | { ok: false; response: NextResponse };

/**
 * Parse request body as JSON. Returns 400 with clear message if body is invalid.
 * Use before Zod validation so invalid JSON yields 400, not 500.
 */
export async function parseJsonBody(request: NextRequest): Promise<ParseJsonResult> {
  try {
    const data = await request.json();
    return { ok: true, data };
  } catch (error) {
    const message = error instanceof SyntaxError
      ? 'Request body must be valid JSON'
      : 'Invalid request format';
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Invalid request format',
          details: message,
          code: 'INVALID_JSON',
        },
        { status: 400 }
      ),
    };
  }
}
