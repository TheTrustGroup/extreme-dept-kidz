/**
 * Admin Authentication Store
 * 
 * Zustand store for managing admin authentication state.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AdminRole = "super_admin" | "manager" | "editor";

export interface AdminUser {
  email: string;
  name: string;
  role: AdminRole;
  id: string;
}

interface AdminAuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

// Mock admin users (in production, this would be in a database)
const ADMIN_USERS: Array<{
  email: string;
  password: string;
  name: string;
  role: AdminRole;
  id: string;
}> = [
  {
    email: "admin@extremedeptkidz.com",
    password: "Admin123!",
    name: "Super Admin",
    role: "super_admin",
    id: "admin-1",
  },
  {
    email: "manager@extremedeptkidz.com",
    password: "Manager123!",
    name: "Store Manager",
    role: "manager",
    id: "admin-2",
  },
  {
    email: "editor@extremedeptkidz.com",
    password: "Editor123!",
    name: "Content Editor",
    role: "editor",
    id: "admin-3",
  },
];

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

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string): Promise<boolean> => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const adminUser = ADMIN_USERS.find(
          (u) => u.email === email && u.password === password
        );

        if (adminUser) {
          const user: AdminUser = {
            email: adminUser.email,
            name: adminUser.name,
            role: adminUser.role,
            id: adminUser.id,
          };

          set({
            user,
            isAuthenticated: true,
          });

          return true;
        }

        return false;
      },

      logout: (): void => {
        set({
          user: null,
          isAuthenticated: false,
        });
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
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
