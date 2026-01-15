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
          
          // Clear any existing invalid cookies and localStorage first
          if (typeof window !== 'undefined') {
            // Clear cookie
            document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'admin-token=; path=/; domain=' + window.location.hostname + '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            
            // Clear localStorage auth data
            try {
              localStorage.removeItem('admin-auth-storage');
            } catch (e) {
              console.warn('[Auth] Could not clear localStorage:', e);
            }
            
            // Clear any stale state
            set({
              user: null,
              token: null,
              isAuthenticated: false,
            });
          }
          
          // Add cache-busting timestamp to prevent any caching
          const timestamp = Date.now();
          const response = await fetch(`/api/admin/auth/login?t=${timestamp}`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              "Pragma": "no-cache",
            },
            body: JSON.stringify({ email: email.trim(), password: password.trim() }),
            credentials: 'include', // Include cookies
            cache: 'no-store', // Prevent caching
          });

          console.log('[Auth] Login response status:', response.status, response.statusText);

          // Handle non-JSON responses
          let data;
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
          } else {
            const text = await response.text();
            console.error('[Auth] ❌ Non-JSON response:', text);
            throw new Error(`Server returned non-JSON response: ${response.statusText}`);
          }
          console.log('[Auth] Login response data:', {
            success: data.success,
            hasToken: !!data.token,
            hasUser: !!data.user,
            userEmail: data.user?.email,
          });

          if (!response.ok) {
            // Try to get error message from response
            let errorMessage = data.error || data.message || `Login failed: ${response.statusText}`;
            
            // Handle specific error cases
            if (response.status === 401) {
              errorMessage = data.error || 'Invalid email or password. Please check your credentials.';
            } else if (response.status === 403) {
              errorMessage = data.error || 'Access denied. Please contact administrator.';
            } else if (response.status === 429) {
              errorMessage = data.error || 'Too many login attempts. Please wait and try again.';
            } else if (response.status === 500) {
              errorMessage = data.error || data.message || 'Server error. Please try again later.';
              // Log server errors for debugging
              if (data.message && data.message.includes('JWT_SECRET')) {
                errorMessage = 'Authentication configuration error. Please contact administrator.';
              }
            }
            
            console.error("[Auth] ❌ Login failed:", {
              status: response.status,
              statusText: response.statusText,
              error: errorMessage,
              fullError: data,
            });
            
            // Throw error with user-friendly message
            throw new Error(errorMessage);
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
            // Handle both apiSuccess format (data.user) and direct format (user)
            const userData = data.data?.user || data.user;
            if (!userData) {
              console.error("[Auth] ❌ No user data in refresh response:", data);
              // Don't logout on malformed response, just log error
              return;
            }
            set({
              user: userData,
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
          console.warn('[Auth] No token available, clearing auth state');
          set({ isAuthenticated: false, user: null });
          return false;
        }

        try {
          lastAuthCheck = now;
          
          // Ensure cookie is synced before checking
          if (typeof window !== 'undefined') {
            get().syncCookie();
          }
          
          const response = await fetch("/api/admin/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include', // Include cookies
            cache: 'no-store', // Prevent caching
          });

          if (!response.ok) {
            // Only clear auth if it's a 401 (unauthorized), not other errors
            if (response.status === 401) {
              console.warn('[Auth] 401 Unauthorized - clearing auth state');
              set({ isAuthenticated: false, user: null, token: null });
              lastAuthCheck = 0; // Reset on auth failure
              
              // Clear cookie
              if (typeof window !== 'undefined') {
                document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
              }
              return false;
            }
            // For other errors (500, etc.), keep current state
            // This prevents logout on transient server errors
            console.warn(`[Auth] Auth check returned ${response.status}, keeping current state`);
            return isAuthenticated;
          }

          const data = await response.json();
          // Handle both apiSuccess format (data.user) and direct format (user)
          const userData = data.data?.user || data.user;
          if (!userData) {
            console.error("[Auth] ❌ No user data in response:", data);
            set({ isAuthenticated: false, user: null, token: null });
            lastAuthCheck = 0;
            return false;
          }
          
          // Update state with fresh user data
          set({
            user: userData,
            isAuthenticated: true,
            token: token, // Preserve token
          });
          
          // Ensure cookie is still set
          if (typeof window !== 'undefined') {
            get().syncCookie();
          }

          return true;
        } catch (error) {
          console.error("[Auth] Auth check error:", error);
          // On network errors, don't clear auth state - just return current state
          // This prevents logout on network issues
          // But if it's a persistent error, we might need to clear
          if (error instanceof Error && error.message.includes('Failed to fetch')) {
            // Network error - keep state
            return isAuthenticated;
          }
          // Other errors - be more cautious
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
