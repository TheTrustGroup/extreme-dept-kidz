"use client";

import * as React from "react";
import { m } from "framer-motion";
import { X, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdminRole } from "@/lib/auth/rbac";

// Must match Prisma AdminRole enum and API createUserSchema (app/api/admin/users/route.ts)
const ADMIN_ROLES: { value: AdminRole; label: string }[] = [
  { value: "viewer", label: "Viewer" },
  { value: "driver", label: "Driver" },
  { value: "warehouse", label: "Warehouse" },
  { value: "cashier", label: "Cashier" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
];

export interface AdminUserFormData {
  email: string;
  name: string;
  password: string;
  role: AdminRole;
  isActive: boolean;
}

interface AdminUserFormProps {
  user?: {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
    isActive: boolean;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AdminUserFormData) => Promise<void>;
  loading?: boolean;
}

export function AdminUserForm({
  user,
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: AdminUserFormProps): JSX.Element {
  const [formData, setFormData] = React.useState<AdminUserFormData>({
    email: user?.email || '',
    name: user?.name || '',
    password: '',
    role: user?.role || 'viewer',
    isActive: user?.isActive ?? true,
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = React.useState<{
    score: number;
    feedback: string[];
  }>({ score: 0, feedback: [] });

  const isEditMode = !!user;

  // Only reset form when modal opens or when switching to a different user (by id).
  // Using openKey avoids resetting on every parent re-render when user is a new object reference.
  const openKey = isOpen ? (user?.id ?? "create") : "closed";
  React.useEffect(() => {
    if (!isOpen) return;
    if (user) {
      setFormData({
        email: user.email,
        name: user.name,
        password: '',
        role: user.role,
        isActive: user.isActive,
      });
    } else {
      setFormData({
        email: '',
        name: '',
        password: '',
        role: 'viewer',
        isActive: true,
      });
    }
    setErrors({});
    setPasswordStrength({ score: 0, feedback: [] });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- openKey intentionally replaces user/isOpen to avoid form reset on parent re-render
  }, [openKey]);

  const validatePassword = (password: string): void => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    else feedback.push('At least 8 characters');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('One uppercase letter');

    if (/[a-z]/.test(password)) score++;
    else feedback.push('One lowercase letter');

    if (/[0-9]/.test(password)) score++;
    else feedback.push('One number');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    else feedback.push('One special character');

    setPasswordStrength({ score, feedback });
  };

  const handlePasswordChange = (value: string): void => {
    setFormData(prev => ({ ...prev, password: value }));
    if (value) {
      validatePassword(value);
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!isEditMode && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password && passwordStrength.score < 5) {
      newErrors.password = 'Password does not meet requirements';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="admin-modal bg-white rounded-xl p-[var(--admin-space-4)] sm:p-[var(--admin-space-5)] lg:p-[var(--admin-space-6)] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit User' : 'Create New User'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={isEditMode}
              className={cn(
                "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white",
                errors.email ? "border-red-300" : "border-gray-300",
                isEditMode && "bg-gray-100 cursor-not-allowed"
              )}
              placeholder="user@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={cn(
                "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white",
                errors.name ? "border-red-300" : "border-gray-300"
              )}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isEditMode ? 'New Password (leave blank to keep current)' : 'Password'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className={cn(
                  "w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white",
                  errors.password ? "border-red-300" : "border-gray-300"
                )}
                placeholder={isEditMode ? "Enter new password" : "Enter password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formData.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1 flex-1 rounded",
                        i <= passwordStrength.score
                          ? "bg-green-500"
                          : "bg-gray-200"
                      )}
                    />
                  ))}
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <ul className="text-xs text-gray-600 space-y-1">
                    {passwordStrength.feedback.map((msg, idx) => (
                      <li key={idx} className="flex items-center gap-1">
                        <span className={passwordStrength.score > idx ? "text-green-600" : "text-gray-400"}>
                          {passwordStrength.score > idx ? "✓" : "○"}
                        </span>
                        {msg}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as AdminRole }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
            >
              {ADMIN_ROLES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Active Status */}
          {isEditMode && (
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </m.div>
    </div>
  );
}
