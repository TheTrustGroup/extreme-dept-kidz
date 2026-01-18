/**
 * Authentication Check Utilities
 * 
 * Comprehensive utilities for verifying and syncing authentication state
 * across localStorage and cookies.
 */

/**
 * Get admin token from localStorage
 * 
 * NOTE: admin-token is httpOnly and cannot be read by client-side JavaScript.
 * This function returns the token from localStorage, which is used for Authorization headers.
 * The httpOnly cookie is automatically included in API requests by the browser.
 */
export function getAdminToken(): string | null {
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
      console.error("[AuthCheck] Failed to parse localStorage:", error);
    }
  }

  // NOTE: admin-token is httpOnly, so it cannot be read via document.cookie
  // The cookie is automatically included in requests by the browser
  // We return the token from localStorage for use in Authorization headers
  return tokenFromStorage;
}

/**
 * Sync auth cookie from token
 * 
 * NOTE: admin-token is set as httpOnly by the server for security.
 * httpOnly cookies cannot be set or read by client-side JavaScript.
 * This function is kept for compatibility but doesn't actually set the cookie.
 * The cookie is automatically included in requests by the browser.
 */
export function syncAuthCookie(token: string): void {
  // NOTE: Cookie is httpOnly and managed by server
  // Client-side JavaScript cannot set httpOnly cookies
  // The cookie is set by the server in the login response
  // and is automatically included in subsequent requests by the browser
  if (typeof document === "undefined") return;
  console.log('[AuthCheck] Cookie sync called (cookie is httpOnly, managed by server)');
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
  // NOTE: admin-token is httpOnly, so it cannot be read by client-side JavaScript
  // This check will always return null for httpOnly cookies
  let tokenFromCookie: string | null = null;
  if (typeof document !== "undefined") {
    // httpOnly cookies are not accessible via document.cookie
    // This will always be null for httpOnly cookies
    const cookieMatch = document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin-token="));
    tokenFromCookie = cookieMatch?.split("=")[1] || null;
  } else {
    issues.push("Document not available");
  }

  // NOTE: Since cookie is httpOnly, we can't verify it client-side
  // The cookie is automatically included in API requests by the browser
  // If tokenFromStorage exists, the cookie should be set by the server
  if (!tokenFromCookie && tokenFromStorage) {
    issues.push("Note: admin-token is httpOnly and cannot be read client-side. Cookie is managed by server.");
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
  // NOTE: admin-token is httpOnly, so it cannot be read by client-side JavaScript
  // This check will always show "Missing" even if the cookie exists
  const cookies = document.cookie.split("; ");
  const adminCookie = cookies.find((c) => c.startsWith("admin-token="));

  if (adminCookie) {
    const token = adminCookie.split("=")[1];
    console.log("✅ admin-token cookie found (non-httpOnly):");
    console.log("  - Length:", token.length);
    console.log("  - Preview:", token.substring(0, 20) + "...");
  } else {
    console.log("ℹ️  admin-token cookie: Not visible (httpOnly cookies cannot be read client-side)");
    console.log("  - Check DevTools → Application → Cookies to verify cookie exists");
    console.log("  - httpOnly cookies are automatically included in API requests");
  }

  console.log("\n=== SYNC STATUS ===");
  const syncStatus = verifyAuthSync();
  console.log("Synced:", syncStatus.synced);
  console.log("Token available:", !!syncStatus.token);
  console.log("Issues:", syncStatus.issues.length > 0 ? syncStatus.issues : "None");

  console.log("================================");
}
