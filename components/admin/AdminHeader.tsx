"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { m } from "framer-motion";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Menu as MenuIcon, Search, Bell, ChevronDown } from "lucide-react";
import { useAdminAuth } from "@/lib/stores/admin-auth-store";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

/**
 * Admin Header Component
 * 
 * Top navigation bar for admin dashboard with search, notifications, and user menu.
 */
export function AdminHeader({ onMenuClick }: AdminHeaderProps): JSX.Element {
  const pathname = usePathname();
  const { user } = useAdminAuth();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  // Generate breadcrumb from pathname
  const breadcrumbs = React.useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    const crumbs = [{ label: "Dashboard", href: "/admin" }];

    if (parts.length > 1) {
      parts.slice(1).forEach((part, index) => {
        const href = `/${parts.slice(0, index + 2).join("/")}`;
        const label = part
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        crumbs.push({ label, href });
      });
    }

    return crumbs;
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        {/* Left: Menu & Breadcrumb */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 lg:hidden active:scale-95"
            aria-label="Toggle menu"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <nav className="hidden md:flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.href}>
                {idx > 0 && (
                  <span className="text-gray-400">/</span>
                )}
                <Link
                  href={crumb.href}
                  className={cn(
                    "text-gray-600 hover:text-gray-900 transition-colors duration-200",
                    idx === breadcrumbs.length - 1 && "font-semibold text-gray-900"
                  )}
                >
                  {crumb.label}
                </Link>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right: Search, Notifications, User */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200 text-sm border border-gray-200 hover:border-gray-300 active:scale-[0.98]"
            onClick={() => {
              // TODO: Open search modal
            }}
          >
            <Search className="w-4 h-4" />
            <span className="text-gray-500">Search...</span>
            <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-white border border-gray-300 rounded shadow-sm">
              ⌘K
            </kbd>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 relative active:scale-95"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <m.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-8 text-sm text-gray-600 text-center">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No new notifications</p>
                    </div>
                  </div>
                </m.div>
              </>
            )}
          </div>

          {/* User Menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-900">
                  {user.name}
                </span>
                <ChevronDown className={cn(
                  "w-4 h-4 text-gray-600 transition-transform duration-200",
                  showUserMenu && "rotate-180"
                )} />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <m.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                  >
                    <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                      <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                      <p className="text-xs text-gray-600 truncate">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">{user.role.replace("_", " ")}</p>
                    </div>
                    <div className="p-1">
                      <Link
                        href="/admin/settings/profile"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={() => {
                          // Handle logout
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        Sign Out
                      </button>
                    </div>
                  </m.div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Add missing import
import Link from "next/link";
