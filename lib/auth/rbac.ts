/**
 * Role-Based Access Control (RBAC)
 * 
 * Implements role hierarchy and permission checking for admin routes.
 * 
 * Role Hierarchy (from lowest to highest):
 * - viewer (1): Read-only access
 * - driver (1): Read-only / delivery
 * - warehouse (2): Can manage inventory
 * - cashier (2): Can manage POS/orders
 * - manager (2): Can manage orders and inventory
 * - admin (3): Can manage products and users
 * - super_admin (4): Full system access
 */

export type AdminRole = 'super_admin' | 'admin' | 'manager' | 'cashier' | 'warehouse' | 'driver' | 'viewer';

/** POS/location a user can be assigned to (Main Town or Store). */
export type AssignedPos = 'main_town' | 'store';

/** Display labels for assigned POS. */
export const ASSIGNED_POS_LABELS: Record<AssignedPos, string> = {
  main_town: 'Main Town',
  store: 'DC/Mainstore',
};

export function getAssignedPosDisplayLabel(pos: AssignedPos | null | undefined): string {
  if (pos == null) return '—';
  return ASSIGNED_POS_LABELS[pos] ?? pos;
}

/**
 * Role hierarchy mapping
 * Higher number = more permissions
 */
const ROLE_HIERARCHY: Record<AdminRole, number> = {
  viewer: 1,
  driver: 1,
  warehouse: 2,
  cashier: 2,
  manager: 2,
  admin: 3,
  super_admin: 4,
};

/** Display labels for admin roles (single source of truth for sidebar, header, etc.) */
export const ROLE_DISPLAY_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  cashier: "Cashier",
  warehouse: "Warehouse",
  driver: "Driver",
  viewer: "Viewer",
};

/**
 * Get the display label for a role (e.g. "Cashier" for cashier).
 * Falls back to capitalized role string if unknown.
 */
export function getRoleDisplayLabel(role: string): string {
  return ROLE_DISPLAY_LABELS[role as AdminRole] ?? role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Check if user role meets or exceeds required role
 * 
 * @param userRole - The user's current role
 * @param requiredRole - The minimum role required
 * @returns true if user has sufficient permissions
 * 
 * @example
 * hasRequiredRole('manager', 'viewer') // true - manager can do viewer tasks
 * hasRequiredRole('viewer', 'admin')  // false - viewer cannot do admin tasks
 */
export function hasRequiredRole(
  userRole: string,
  requiredRole: AdminRole
): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as AdminRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

/**
 * Check if user role is in the list of allowed roles
 * 
 * @param userRole - The user's current role
 * @param allowedRoles - Array of roles that are allowed
 * @returns true if user role is in allowed roles
 * 
 * @example
 * requireRole('admin', ['admin', 'super_admin']) // true
 * requireRole('viewer', ['admin', 'super_admin']) // false
 */
export function requireRole(
  userRole: string,
  allowedRoles: AdminRole[]
): boolean {
  return allowedRoles.some(role => hasRequiredRole(userRole, role));
}

/**
 * Get role hierarchy level
 * Useful for sorting or comparing roles
 * 
 * @param role - The role to get level for
 * @returns numeric level (1-4) or 0 if invalid
 */
export function getRoleLevel(role: string): number {
  return ROLE_HIERARCHY[role as AdminRole] || 0;
}

/**
 * Check if role is valid
 * 
 * @param role - Role to validate
 * @returns true if role is a valid AdminRole
 */
export function isValidRole(role: string): role is AdminRole {
  return role in ROLE_HIERARCHY;
}

/**
 * Get all roles that have at least the specified level
 * 
 * @param minLevel - Minimum hierarchy level
 * @returns Array of roles meeting the requirement
 */
export function getRolesAtOrAbove(minLevel: number): AdminRole[] {
  return (Object.keys(ROLE_HIERARCHY) as AdminRole[]).filter(
    role => ROLE_HIERARCHY[role] >= minLevel
  );
}

/**
 * Permission definitions
 * Maps permissions to minimum required roles
 */
export const PERMISSIONS = {
  // Viewing permissions (viewer and above)
  view_dashboard: 'viewer',
  view_products: 'viewer',
  view_orders: 'viewer',
  view_analytics: 'viewer',
  view_inventory: 'viewer',
  
  // Management permissions (manager and above)
  manage_orders: 'manager',
  manage_inventory: 'manager',
  refund_orders: 'manager',
  
  // Admin permissions (admin and above)
  manage_products: 'admin',
  manage_categories: 'admin',
  manage_collections: 'admin',
  manage_settings: 'admin',
  
  // Super admin permissions (super_admin only)
  manage_users: 'super_admin',
  manage_roles: 'super_admin',
  system_settings: 'super_admin',
} as const;

/**
 * Check if user has a specific permission
 * 
 * @param userRole - The user's current role
 * @param permission - The permission to check
 * @returns true if user has the permission
 * 
 * @example
 * hasPermission('manager', 'manage_orders') // true
 * hasPermission('viewer', 'manage_users')   // false
 */
export function hasPermission(
  userRole: string,
  permission: keyof typeof PERMISSIONS
): boolean {
  const requiredRole = PERMISSIONS[permission] as AdminRole;
  return hasRequiredRole(userRole, requiredRole);
}
