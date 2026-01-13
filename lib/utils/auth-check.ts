/**
 * Authentication Check Utilities
 * 
 * Comprehensive utilities for verifying and syncing authentication state
 * across localStorage and cookies.
 */

/**
 * Get admin token from localStorage or cookie
 */
export function getAdminToken(): string | null {
  // Check localStorage first
  const localStorageData = typeof window !== "undefined" 
    ? localStorage.getItem("admin-auth-storage")
    : null;
  
  let tokenFromStorage: string | null = null;

  if (localStorageData) {
    try {
      const parsed = JSON.parse(localStorageData);
      tokenFromStorage = parsed.state?.token || null;
    } catch (error) {
      console.error("[AuthCheck] Failed to parse localStorage:", error);
    }
  }

  // Check cookie
  let tokenFromCookie: string | null = null;
  if (typeof document !== "undefined") {
    const cookieMatch = document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin-token="));
    tokenFromCookie = cookieMatch?.split("=")[1] || null;
  }

  return tokenFromCookie || tokenFromStorage;
}

/**
 * Sync auth cookie from token
 */
export function syncAuthCookie(token: string): void {
  if (typeof document === "undefined") return;
  
  const isProduction = process.env.NODE_ENV === "production";
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `admin-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax${isProduction ? "; Secure" : ""}`;
}

/**
 * Verify auth sync status
 */
export function verifyAuthSync(): {
  synced: boolean;
  token: string | null;
  issues: string[];
} {
  const issues: string[] = [];

  // Check localStorage
  const localStorageData = typeof window !== "undefined"
    ? localStorage.getItem("admin-auth-storage")
    : null;
  
  let tokenFromStorage: string | null = null;

  if (localStorageData) {
    try {
      const parsed = JSON.parse(localStorageData);
      tokenFromStorage = parsed.state?.token || null;
    } catch (error) {
      issues.push("Failed to parse localStorage");
    }
  } else {
    issues.push("No localStorage data");
  }

  // Check cookie
  let tokenFromCookie: string | null = null;
  if (typeof document !== "undefined") {
    const cookieMatch = document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin-token="));
    tokenFromCookie = cookieMatch?.split("=")[1] || null;
  } else {
    issues.push("Document not available");
  }

  if (!tokenFromCookie && tokenFromStorage) {
    issues.push("Token in localStorage but not in cookie - syncing...");
    syncAuthCookie(tokenFromStorage);
  }

  const synced = tokenFromStorage === tokenFromCookie && tokenFromStorage !== null;
  const token = tokenFromCookie || tokenFromStorage;

  return { synced, token, issues };
}

/**
 * Log comprehensive auth diagnostics
 */
export function logAuthDiagnostics(): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    console.log("[AuthCheck] Running in server environment - skipping diagnostics");
    return;
  }

  console.log("=== AUTHENTICATION DIAGNOSTIC ===");

  const localStorageData = localStorage.getItem("admin-auth-storage");
  if (localStorageData) {
    try {
      const parsed = JSON.parse(localStorageData);
      console.log("✅ localStorage data found:");
      console.log("  - Token exists:", !!parsed.state?.token);
      console.log("  - Token length:", parsed.state?.token?.length || 0);
      console.log("  - Token preview:", parsed.state?.token?.substring(0, 20) + "..." || "none");
      console.log("  - Is authenticated:", parsed.state?.isAuthenticated);
      console.log("  - User email:", parsed.state?.user?.email || "none");
    } catch (error) {
      console.error("❌ Failed to parse localStorage:", error);
    }
  } else {
    console.error("❌ No localStorage data found");
  }

  console.log("\n=== COOKIES ===");
  const cookies = document.cookie.split("; ");
  const adminCookie = cookies.find((c) => c.startsWith("admin-token="));

  if (adminCookie) {
    const token = adminCookie.split("=")[1];
    console.log("✅ admin-token cookie found:");
    console.log("  - Length:", token.length);
    console.log("  - Preview:", token.substring(0, 20) + "...");
  } else {
    console.error("❌ admin-token cookie: Missing");
  }

  console.log("\n=== SYNC STATUS ===");
  const syncStatus = verifyAuthSync();
  console.log("Synced:", syncStatus.synced);
  console.log("Token available:", !!syncStatus.token);
  console.log("Issues:", syncStatus.issues.length > 0 ? syncStatus.issues : "None");

  console.log("================================");
}
