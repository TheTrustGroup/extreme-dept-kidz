"use client";

import * as React from "react";
import { useAdminAuth } from "@/lib/stores/admin-auth-store";

/**
 * AuthSync Component
 * 
 * Automatically syncs authentication state between localStorage and cookies.
 * Runs on mount, periodically, and on visibility changes.
 */
export function AuthSync(): JSX.Element {
  const { refreshAuth, token, isAuthenticated, syncCookie } = useAdminAuth();

  // Sync auth on mount
  React.useEffect(() => {
    if (token && isAuthenticated) {
      syncCookie();
      // Delay refresh to avoid race conditions with initial auth check
      // Increased delay to ensure everything is initialized
      setTimeout(() => {
        refreshAuth().catch((error) => {
          console.error("[AuthSync] Initial refresh error:", error);
          // Check if error is persistent (not just network)
          if (error instanceof Error && !error.message.includes('fetch') && !error.message.includes('network')) {
            // Persistent auth error - might need to logout
            const currentState = useAdminAuth.getState();
            if (!currentState.token || !currentState.isAuthenticated) {
              console.warn('[AuthSync] Persistent auth error, clearing state');
              useAdminAuth.getState().logout();
            }
          }
        });
      }, 2000); // Increased to 2 seconds to ensure proper initialization
    }
  }, []); // Only on mount

  // Sync cookie periodically (every 5 minutes)
  React.useEffect(() => {
    if (!token || !isAuthenticated) return;

    const interval = setInterval(() => {
      syncCookie();
      console.log("[AuthSync] Periodic cookie sync");
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [token, isAuthenticated, syncCookie]);

  // Sync on visibility change (when user returns to tab)
  React.useEffect(() => {
    if (!token || !isAuthenticated) return;

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === "visible") {
        syncCookie();
        // Only refresh if we still have auth state
        const currentState = useAdminAuth.getState();
        if (currentState.token && currentState.isAuthenticated) {
          refreshAuth().catch((error) => {
            console.error("[AuthSync] Visibility change refresh error:", error);
            // Don't logout on refresh errors - might be transient
          });
          console.log("[AuthSync] Synced on visibility change");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [token, isAuthenticated, syncCookie, refreshAuth]);

  return <></>; // This is a utility component with no UI
}
