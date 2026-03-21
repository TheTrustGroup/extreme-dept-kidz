/**
 * One-Time Migration API Route
 * 
 * ⚠️ SECURITY WARNING: Delete this file after migrations are complete!
 * 
 * This route allows running Prisma migrations via API call.
 * It should only be used once during initial setup.
 * 
 * Usage:
 * curl -X POST https://your-app.vercel.app/api/migrate \
 *   -H "Content-Type: application/json" \
 *   -d '{"secret":"your-secret-key"}'
 */

import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_DEBUG_ENDPOINTS) {
    return NextResponse.json({ error: 'Migrations only available when ENABLE_DEBUG_ENDPOINTS is set' }, { status: 404 });
  }
  try {
    const body = await request.json();
    const { secret } = body;

    // Check for secret key (set this in Vercel environment variables)
    const expectedSecret = process.env.MIGRATION_SECRET || "change-this-secret";

    if (secret !== expectedSecret) {
      return NextResponse.json(
        { error: "Unauthorized. Invalid secret key." },
        { status: 401 }
      );
    }

    // Run migrations
    const { stdout, stderr } = await execAsync("npx prisma migrate deploy");

    return NextResponse.json({
      success: true,
      message: "Migrations completed successfully",
      output: stdout,
      warnings: stderr || null,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
