"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { m } from "framer-motion";
import {
  Users,
  Mail,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Search,
  Plus,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getRoleDisplayLabel, getAssignedPosDisplayLabel } from "@/lib/auth/rbac";
import type { AssignedPos } from "@/lib/auth/rbac";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "admin" | "manager" | "cashier" | "warehouse" | "driver" | "viewer";
  assignedPos?: AssignedPos | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    activityLogs: number;
  };
}

interface AdminUserTableProps {
  users: AdminUser[];
  loading?: boolean;
  currentUserId?: string;
  onEdit?: (user: AdminUser) => void;
  onDelete?: (user: AdminUser) => void;
  onToggleStatus?: (user: AdminUser) => void;
  onCreate?: () => void;
}

type SortField = 'name' | 'email' | 'role' | 'isActive' | 'lastLoginAt' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export function AdminUserTable({
  users,
  loading = false,
  currentUserId,
  onEdit,
  onDelete,
  onToggleStatus,
  onCreate,
}: AdminUserTableProps): JSX.Element {
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortField, setSortField] = React.useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');
  const [showActionsMenu, setShowActionsMenu] = React.useState<string | null>(null);
  const [menuPosition, setMenuPosition] = React.useState<{ top: number; left: number } | null>(null);

  // Filter and sort users
  const filteredAndSorted = React.useMemo(() => {
    let filtered = [...users];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        u =>
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower)
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter(u => u.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter(u => !u.isActive);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | number | boolean | Date | null;
      let bVal: string | number | boolean | Date | null;

      switch (sortField) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'email':
          aVal = a.email;
          bVal = b.email;
          break;
        case 'role':
          aVal = a.role;
          bVal = b.role;
          break;
        case 'isActive':
          aVal = a.isActive;
          bVal = b.isActive;
          break;
        case 'lastLoginAt':
          aVal = a.lastLoginAt;
          bVal = b.lastLoginAt;
          break;
        case 'createdAt':
          aVal = a.createdAt;
          bVal = b.createdAt;
          break;
        default:
          return 0;
      }

      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else if (aVal instanceof Date && bVal instanceof Date) {
        return sortDirection === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      } else if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        // Boolean comparison: true > false
        return sortDirection === 'asc'
          ? (aVal === bVal ? 0 : aVal ? 1 : -1)
          : (aVal === bVal ? 0 : aVal ? -1 : 1);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc'
          ? aVal - bVal
          : bVal - aVal;
      } else {
        // Fallback: convert to string for comparison
        return sortDirection === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      }
    });

    return filtered;
  }, [users, search, roleFilter, statusFilter, sortField, sortDirection]);

  const handleSort = (field: SortField): void => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-indigo-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-indigo-600" />
    );
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-indigo-100 text-indigo-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'cashier':
        return 'bg-emerald-100 text-emerald-800';
      case 'warehouse':
        return 'bg-amber-100 text-amber-800';
      case 'driver':
        return 'bg-teal-100 text-teal-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string): string => getRoleDisplayLabel(role);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            density="compact"
            className="pl-10 bg-white border-gray-300 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
          />
          <p className="adm-help-text mt-1">Rows are striped for scanability, with inactive accounts still visibly muted.</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-control-compact px-compact-4 border border-gray-300 rounded-compact bg-white text-compact-md leading-compact-normal focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="cashier">Cashier</option>
            <option value="warehouse">Warehouse</option>
            <option value="driver">Driver</option>
            <option value="viewer">Viewer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-control-compact px-compact-4 border border-gray-300 rounded-compact bg-white text-compact-md leading-compact-normal focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Create Button */}
        {onCreate && (
          <Button
            onClick={onCreate}
            size="compact"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="admin-card-strong rounded-xl overflow-hidden">
        <div className="admin-table-container">
          <table className="admin-table w-full">
            <thead className="bg-cream-50 border-b border-cream-200 sticky top-0 z-10">
              <tr>
                <th className="text-left text-compact-sm font-bold uppercase tracking-compact-label leading-compact-tight text-charcoal-700">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2 hover:text-charcoal-900"
                  >
                    User
                    {getSortIcon('name')}
                  </button>
                </th>
                <th className="text-left text-compact-sm font-bold uppercase tracking-compact-label leading-compact-tight text-charcoal-700">
                  <button
                    onClick={() => handleSort('role')}
                    className="flex items-center gap-2 hover:text-charcoal-900"
                  >
                    Role
                    {getSortIcon('role')}
                  </button>
                </th>
                <th className="text-left text-compact-sm font-bold uppercase tracking-compact-label leading-compact-tight text-charcoal-700">
                  POS
                </th>
                <th className="text-left text-compact-sm font-bold uppercase tracking-compact-label leading-compact-tight text-charcoal-700">
                  <button
                    onClick={() => handleSort('isActive')}
                    className="flex items-center gap-2 hover:text-charcoal-900"
                  >
                    Status
                    {getSortIcon('isActive')}
                  </button>
                </th>
                <th className="text-left text-compact-sm font-bold uppercase tracking-compact-label leading-compact-tight text-charcoal-700">
                  <button
                    onClick={() => handleSort('lastLoginAt')}
                    className="flex items-center gap-2 hover:text-charcoal-900"
                  >
                    Last Login
                    {getSortIcon('lastLoginAt')}
                  </button>
                </th>
                <th className="text-left text-compact-sm font-bold uppercase tracking-compact-label leading-compact-tight text-charcoal-700">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center gap-2 hover:text-charcoal-900"
                  >
                    Created
                    {getSortIcon('createdAt')}
                  </button>
                </th>
                <th className="text-right text-compact-sm font-bold uppercase tracking-compact-label leading-compact-tight text-charcoal-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-300/70">
              {filteredAndSorted.map((user, index) => {
                const isCurrentUser = user.id === currentUserId;
                const isInactive = !user.isActive;

                return (
                  <m.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "transition-colors border-b border-cream-300/70 hover:bg-cream-50/90",
                      index % 2 === 0 ? "bg-white" : "bg-cream-50/70",
                      isInactive && "bg-cream-50 opacity-75"
                    )}
                  >
                    <td className="px-[var(--admin-space-4)] py-3 min-h-[3rem]">
                      <div className="flex items-center gap-[var(--admin-space-3)]">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-compact-md leading-compact-normal text-gray-900 truncate">{user.name}</div>
                          <div className="text-compact-sm leading-compact-normal text-gray-500 flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-[var(--admin-space-4)] py-3 min-h-[3rem]">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 text-compact-sm leading-compact-tight font-medium rounded-full",
                        getRoleColor(user.role)
                      )}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-[var(--admin-space-4)] py-3 min-h-[3rem] text-charcoal-600 text-compact-md leading-compact-normal">
                      {getAssignedPosDisplayLabel(user.assignedPos)}
                    </td>
                    <td className="px-[var(--admin-space-4)] py-3 min-h-[3rem]">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 text-compact-sm leading-compact-tight font-medium rounded-full",
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      )}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-[var(--admin-space-4)] py-3 text-charcoal-600">
                      {user.lastLoginAt ? (
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(user.lastLoginAt), 'MMM d, yyyy')}
                        </div>
                      ) : (
                        <span className="text-charcoal-400 text-xs">Never</span>
                      )}
                    </td>
                    <td className="px-[var(--admin-space-4)] py-3 text-charcoal-600 text-compact-md leading-compact-normal">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-[var(--admin-space-4)] py-3 text-right overflow-visible">
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={(e) => {
                            if (showActionsMenu === user.id) {
                              setShowActionsMenu(null);
                              setMenuPosition(null);
                            } else {
                              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                              setMenuPosition({ top: rect.bottom + 4, left: rect.right });
                              setShowActionsMenu(user.id);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </m.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAndSorted.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-compact-md leading-compact-normal text-gray-600">No users found</p>
          </div>
        )}
      </div>

      {/* Actions dropdown: render in portal so it is not clipped by table overflow */}
      {showActionsMenu && menuPosition && typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[100]"
              aria-hidden
              onClick={() => {
                setShowActionsMenu(null);
                setMenuPosition(null);
              }}
            />
            <m.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.12 }}
              className="fixed z-[101] min-w-[11rem] bg-white rounded-lg shadow-lg border border-gray-200 py-1"
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
                transform: "translateX(-100%)",
              }}
            >
              {(() => {
                const menuUser = users.find((u) => u.id === showActionsMenu);
                if (!menuUser) return null;
                const isCurrentUser = menuUser.id === currentUserId;
                return (
                  <>
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          onEdit(menuUser);
                          setShowActionsMenu(null);
                          setMenuPosition(null);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4 flex-shrink-0" />
                        Edit
                      </button>
                    )}
                    {onToggleStatus && (
                      <button
                        type="button"
                        onClick={() => {
                          onToggleStatus(menuUser);
                          setShowActionsMenu(null);
                          setMenuPosition(null);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 border-t border-gray-100"
                      >
                        {menuUser.isActive ? (
                          <>
                            <UserX className="w-4 h-4 flex-shrink-0" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 flex-shrink-0" />
                            Activate
                          </>
                        )}
                      </button>
                    )}
                    {onDelete && !isCurrentUser && (
                      <button
                        type="button"
                        onClick={() => {
                          onDelete(menuUser);
                          setShowActionsMenu(null);
                          setMenuPosition(null);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                      >
                        <Trash2 className="w-4 h-4 flex-shrink-0" />
                        Delete
                      </button>
                    )}
                  </>
                );
              })()}
            </m.div>
          </>,
          document.body
        )}
    </div>
  );
}
