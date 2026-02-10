"use client";

import * as React from "react";
import { AdminUserTable, type AdminUser } from "@/components/admin/users/AdminUserTable";
import { AdminUserForm, type AdminUserFormData } from "@/components/admin/users/AdminUserForm";
import { H1 } from "@/components/ui/typography";
import { useToast } from "@/components/ui/Toast";
import { useAdminAuth } from "@/lib/stores/admin-auth-store";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function AdminUsersPage(): JSX.Element {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<AdminUser | null>(null);
  const [formLoading, setFormLoading] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<AdminUser | null>(null);
  const { showToast } = useToast();
  const { user: currentUser } = useAdminAuth();

  React.useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers(): Promise<void> {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 403) {
          showToast({
            type: "error",
            title: "Access Denied",
            message: "You don't have permission to view admin users. Super admin role required.",
          });
          return;
        }
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data?.users || []);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to load users:", error);
      }
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to load admin users. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = (): void => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEdit = (user: AdminUser): void => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = async (user: AdminUser): Promise<void> => {
    setDeleteConfirm(user);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deleteConfirm) return;

    const user = deleteConfirm;
    setDeleteConfirm(null);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      showToast({
        type: "success",
        title: "User Deactivated",
        message: `${user.name} has been deactivated successfully`,
      });

      await loadUsers();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to delete user:", error);
      }
      showToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to deactivate user",
      });
    }
  };

  const handleToggleStatus = async (user: AdminUser): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          isActive: !user.isActive,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user status');
      }

      showToast({
        type: "success",
        title: "Status Updated",
        message: `${user.name} has been ${!user.isActive ? 'activated' : 'deactivated'}`,
      });

      await loadUsers();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to update user status:", error);
      }
      showToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to update user status",
      });
    }
  };

  const handleFormSubmit = async (data: AdminUserFormData): Promise<void> => {
    setFormLoading(true);
    try {
      const isEdit = !!editingUser;
      const url = isEdit ? `/api/admin/users/${editingUser.id}` : '/api/admin/users';
      const method = isEdit ? 'PUT' : 'POST';

      const body: any = {
        name: data.name,
        role: data.role,
      };

      if (isEdit) {
        if (data.password) {
          body.password = data.password;
        }
        body.isActive = data.isActive;
      } else {
        body.email = data.email;
        body.password = data.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let err: { error?: string; details?: string } = {};
        try {
          err = await response.json();
        } catch {
          const text = await response.text();
          throw new Error(text || `Server error (${response.status})`);
        }
        const detail = typeof err.details === "string" ? err.details : "";
        const message = err.error
          ? (detail ? `${err.error}: ${detail}` : err.error)
          : `Failed to ${isEdit ? "update" : "create"} user`;
        throw new Error(message);
      }

      showToast({
        type: "success",
        title: isEdit ? "User Updated" : "User Created",
        message: `${data.name} has been ${isEdit ? 'updated' : 'created'} successfully`,
      });

      setShowForm(false);
      setEditingUser(null);
      await loadUsers();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to save user:", error);
      }
      showToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : `Failed to ${editingUser ? 'update' : 'create'} user`,
      });
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <H1 className="text-3xl font-bold text-gray-900 mb-2">Admin Users</H1>
          <p className="text-gray-600 text-sm">
            Manage admin users and their permissions
          </p>
          <p className="text-gray-500 text-xs mt-1">
            New users sign in at: <strong>/admin/login</strong> on this site (e.g. {typeof window !== "undefined" ? `${window.location.origin}/admin/login` : "this domain"})
          </p>
        </div>
      </div>

      <AdminUserTable
        users={users}
        loading={loading}
        currentUserId={currentUser?.id}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onCreate={handleCreate}
      />

      <AdminUserForm
        user={editingUser}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingUser(null);
        }}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Deactivate User"
        message={`Are you sure you want to deactivate ${deleteConfirm?.name}? This action cannot be undone.`}
        confirmText="Deactivate"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
