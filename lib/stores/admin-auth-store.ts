/**
 * Admin Authentication Store
 * 
 * Zustand store for managing admin authentication state.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AdminRole = "super_admin" | "manager" | "editor";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

interface AdminAuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  refreshAuth: () => Promise<void>;
  syncCookie: () => void;
  getAuthHeaders: () => HeadersInit;
  hasPermission: (permission: string) => boolean;
}

// Permission matrix
const PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin: [
    "view_dashboard",
    "manage_products",
    "delete_products",
    "manage_orders",
    "refund_orders",
    "manage_customers",
    "view_analytics",
    "manage_settings",
    "manage_users",
    "manage_looks",
  ],
  manager: [
    "view_dashboard",
    "manage_products",
    "manage_orders",
    "refund_orders",
    "manage_customers",
    "view_analytics",
    "manage_looks",
  ],
  editor: [
    "view_dashboard",
    "manage_products",
    "view_analytics",
    "manage_looks",
  ],
};

// Track last auth check time to prevent too frequent API calls
let lastAuthCheck = 0;
const AUTH_CHECK_INTERVAL = 30000; // 30 seconds minimum between checks

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string): Promise<boolean> => {
        try {
          console.log('[Auth] Starting login for:', email);
          
          const response = await fetch("/api/admin/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            credentials: 'include', // Include cookies
          });

          console.log('[Auth] Login response status:', response.status, response.statusText);

          const data = await response.json();
          console.log('[Auth] Login response data:', {
            success: data.success,
            hasToken: !!data.token,
            hasUser: !!data.user,
            userEmail: data.user?.email,
          });

          if (!response.ok) {
            console.error("[Auth] ❌ Login failed:", {
              status: response.status,
              statusText: response.statusText,
              error: data.error,
              diagnostic: data.diagnostic,
            });
            // Throw error with message for better error handling
            throw new Error(data.error || `Login failed: ${response.statusText}`);
          }

          // Verify we have the required data
          if (!data.success || !data.token || !data.user) {
            console.error("[Auth] ❌ Login response missing required data:", {
              success: data.success,
              hasToken: !!data.token,
              hasUser: !!data.user,
              fullResponse: data,
            });
            throw new Error("Invalid login response from server");
          }
          
          console.log('[Auth] ✅ Setting auth state...');
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          });

          // CRITICAL: Sync cookie immediately after login
          if (typeof window !== 'undefined' && data.token) {
            const isProduction = process.env.NODE_ENV === 'production';
            const maxAge = 60 * 60 * 24 * 7; // 7 days
            document.cookie = `admin-token=${data.token}; path=/; max-age=${maxAge}; SameSite=Lax${isProduction ? '; Secure' : ''}`;
            console.log('[Auth] ✅ Cookie synced after login');
            
            // Verify cookie was set
            const cookieSet = document.cookie.includes('admin-token');
            console.log('[Auth] Cookie verification:', cookieSet ? '✅ Set' : '❌ Not set');
          }

          // Reset auth check timer on successful login
          lastAuthCheck = Date.now();
          console.log('[Auth] ✅ Login successful!');
          return true;
        } catch (error) {
          console.error("[Auth] ❌ Login error:", error);
          console.error("[Auth] Error details:", {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          });
          // Re-throw to allow caller to handle the error message
          throw error;
        }
      },

      logout: async (): Promise<void> => {
        // Clear cookie via API
        try {
          await fetch("/api/admin/auth/logout", {
            method: "POST",
            credentials: 'include',
          });
        } catch (error) {
          console.error("Logout API error:", error);
        }
        
        // Clear local state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        lastAuthCheck = 0;
        
        // CRITICAL: Clear cookie from client side too
        if (typeof window !== 'undefined') {
          document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          window.location.href = '/admin/login';
        }
      },

      refreshAuth: async (): Promise<void> => {
        const { token } = get();
        
        if (!token) {
          set({ user: null, token: null, isAuthenticated: false });
          return;
        }

        // Ensure cookie is synced
        if (typeof window !== 'undefined') {
          const isProduction = process.env.NODE_ENV === 'production';
          const maxAge = 60 * 60 * 24 * 7; // 7 days
          document.cookie = `admin-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax${isProduction ? '; Secure' : ''}`;
        }

        try {
          const response = await fetch("/api/admin/auth/me", {
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
          });

          if (response.ok) {
            const data = await response.json();
            set({
              user: data.user,
              isAuthenticated: true,
              token: token,
            });
          } else {
            // Auth failed, clear state
            get().logout();
          }
        } catch (error) {
          console.error("Auth refresh error:", error);
          // Don't clear on network errors, just log
        }
      },

      syncCookie: (): void => {
        const { token } = get();
        if (token && typeof window !== 'undefined') {
          const isProduction = process.env.NODE_ENV === 'production';
          const maxAge = 60 * 60 * 24 * 7; // 7 days
          document.cookie = `admin-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax${isProduction ? '; Secure' : ''}`;
        }
      },

      getAuthHeaders: (): HeadersInit => {
        const { token } = get();
        return token
          ? {
              'Authorization': `Bearer ${token}`,
            }
          : {};
      },

      checkAuth: async (): Promise<boolean> => {
        const { token, isAuthenticated, user } = get();
        
        // If we have a token and are already authenticated, check if we need to verify
        // Only verify if enough time has passed since last check
        const now = Date.now();
        if (token && isAuthenticated && user) {
          // If we recently checked (within interval), just return true
          if (now - lastAuthCheck < AUTH_CHECK_INTERVAL) {
            return true;
          }
          // Otherwise, continue to verify (but update timestamp)
        }

        if (!token) {
          set({ isAuthenticated: false, user: null });
          return false;
        }

        try {
          lastAuthCheck = now;
          const response = await fetch("/api/admin/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            // Add cache control to prevent aggressive revalidation
            cache: 'no-store',
          });

          if (!response.ok) {
            // Only clear auth if it's a 401 (unauthorized), not other errors
            if (response.status === 401) {
              set({ isAuthenticated: false, user: null, token: null });
              lastAuthCheck = 0; // Reset on auth failure
              return false;
            }
            // For other errors (500, etc.), keep current state
            // This prevents logout on transient server errors
            return isAuthenticated;
          }

          const data = await response.json();
          set({
            user: data.user,
            isAuthenticated: true,
            // Preserve token
            token: token,
          });

          return true;
        } catch (error) {
          console.error("Auth check error:", error);
          // On network errors, don't clear auth state - just return current state
          // This prevents logout on network issues
          return isAuthenticated;
        }
      },

      hasPermission: (permission: string): boolean => {
        const { user } = get();
        if (!user) return false;

        const userPermissions = PERMISSIONS[user.role] || [];
        return userPermissions.includes(permission);
      },
    }),
    {
      name: "admin-auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // CRITICAL: Sync cookie on page load/hydration
        if (state?.token && typeof window !== 'undefined') {
          const isProduction = process.env.NODE_ENV === 'production';
          const maxAge = 60 * 60 * 24 * 7; // 7 days
          document.cookie = `admin-token=${state.token}; path=/; max-age=${maxAge}; SameSite=Lax${isProduction ? '; Secure' : ''}`;
          console.log('[Auth] Cookie synced on hydration');
        }
      },
    }
  )
);
