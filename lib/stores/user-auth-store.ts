"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * User Authentication Store
 * 
 * Zustand store for managing customer/user authentication state.
 * This is separate from admin authentication.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

interface UserAuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

export const useUserAuth = create<UserAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
          // TODO: Replace with actual API endpoint when backend is ready
          // For now, simulate login with mock data
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim(), password: password.trim() }),
          });

          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            return {
              success: false,
              error: data.error || data.message || "Invalid email or password",
            };
          }

          const data = await response.json();
          
          if (data.success && data.user && data.token) {
            set({
              user: data.user,
              token: data.token,
              isAuthenticated: true,
            });
            return { success: true };
          }

          return {
            success: false,
            error: data.error || "Login failed",
          };
        } catch (error) {
          console.error("[UserAuth] Login error:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Network error. Please try again.",
          };
        }
      },

      signup: async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
          // TODO: Replace with actual API endpoint when backend is ready
          const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: name.trim(),
              email: email.trim(),
              password: password.trim(),
            }),
          });

          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            return {
              success: false,
              error: data.error || data.message || "Account creation failed",
            };
          }

          const data = await response.json();
          
          if (data.success && data.user && data.token) {
            set({
              user: data.user,
              token: data.token,
              isAuthenticated: true,
            });
            return { success: true };
          }

          return {
            success: false,
            error: data.error || "Account creation failed",
          };
        } catch (error) {
          console.error("[UserAuth] Signup error:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Network error. Please try again.",
          };
        }
      },

      logout: (): void => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        
        // TODO: Call logout API endpoint when backend is ready
        fetch("/api/auth/logout", {
          method: "POST",
        }).catch(() => {
          // Ignore errors on logout
        });
      },

      checkAuth: async (): Promise<boolean> => {
        const { token } = get();
        if (!token) return false;

        try {
          // TODO: Replace with actual API endpoint when backend is ready
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            set({ user: null, token: null, isAuthenticated: false });
            return false;
          }

          const data = await response.json();
          if (data.user) {
            set({ user: data.user, isAuthenticated: true });
            return true;
          }

          return false;
        } catch (error) {
          console.error("[UserAuth] Auth check error:", error);
          return false;
        }
      },
    }),
    {
      name: "user-auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
