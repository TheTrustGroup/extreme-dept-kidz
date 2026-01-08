/**
 * Database Seed API Route
 * 
 * ⚠️ SECURITY WARNING: Delete this file after seeding is complete!
 * 
 * This route allows seeding the database via API call.
 * It should only be used once during initial setup.
 * 
 * Usage:
 * curl -X POST https://your-app.vercel.app/api/seed \
 *   -H "Content-Type: application/json" \
 *   -d '{"secret":"your-secret-key"}'
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
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

    // Dynamically import and run seed script
    // Using dynamic import to avoid build-time evaluation
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);

    console.log("Running database seed...");
    const { stdout, stderr } = await execAsync("npm run db:seed");

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      output: stdout,
      warnings: stderr || null,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
