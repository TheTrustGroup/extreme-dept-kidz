import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * CRITICAL SECURITY: Legacy admin password auth route
 * 
 * ⚠️ DEPRECATED: This route uses simple password comparison.
 * The main admin auth uses JWT tokens via /api/admin/auth/login.
 * 
 * This route is kept for backward compatibility but:
 * - Requires ADMIN_PASSWORD env var (no defaults)
 * - Fails closed if env var is missing
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // CRITICAL: No default password - fail closed
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || adminPassword.trim() === '') {
      // In production, don't reveal that this route exists
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: "Authentication not configured" },
          { status: 503 }
        );
      }
      // In development, provide clear error
      return NextResponse.json(
        { 
          error: "Admin authentication not configured",
          message: "ADMIN_PASSWORD environment variable is required. Set it in .env.local for development."
        },
        { status: 500 }
      );
    }

    const providedPassword = password.trim();
    const expectedPassword = adminPassword.trim();

    // Constant-time comparison to prevent timing attacks
    if (providedPassword.length !== expectedPassword.length) {
      // Delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 100));
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Constant-time string comparison
    let matches = true;
    for (let i = 0; i < expectedPassword.length; i++) {
      if (providedPassword[i] !== expectedPassword[i]) {
        matches = false;
      }
    }

    if (!matches) {
      // Delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 100));
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
