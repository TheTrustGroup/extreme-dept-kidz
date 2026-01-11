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
          const response = await fetch("/api/admin/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            console.error("Login error:", error);
            return false;
          }

          const data = await response.json();
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          });

          // Reset auth check timer on successful login
          lastAuthCheck = Date.now();
          return true;
        } catch (error) {
          console.error("Login error:", error);
          return false;
        }
      },

      logout: (): void => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        lastAuthCheck = 0;
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
    }
  )
);
