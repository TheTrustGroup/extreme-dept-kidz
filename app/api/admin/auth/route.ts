import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Get admin password from environment variable
    // Trim whitespace to avoid issues
    const adminPassword = (process.env.ADMIN_PASSWORD || "admin123").trim();
    const providedPassword = password.trim();

    if (providedPassword === adminPassword) {
      return NextResponse.json({ success: true });
    } else {
      // In development, provide helpful error message
      const isDevelopment = process.env.NODE_ENV === "development";
      return NextResponse.json(
        { 
          error: "Invalid password",
          hint: isDevelopment && !process.env.ADMIN_PASSWORD 
            ? "Default password is 'admin123' (without quotes)" 
            : undefined
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
