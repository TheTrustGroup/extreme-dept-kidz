"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { m } from "framer-motion";
import { Search, Bell, ChevronDown } from "lucide-react";
import { Menu } from "lucide-react"; // Used in mobile menu button
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
    <header className="sticky top-0 z-30 bg-cream-50 border-b border-cream-200 shadow-sm">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left: Menu & Breadcrumb */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-100 rounded-lg transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <nav className="hidden md:flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.href}>
                {idx > 0 && (
                  <span className="text-charcoal-400">/</span>
                )}
                <Link
                  href={crumb.href}
                  className={cn(
                    "text-charcoal-600 hover:text-charcoal-900 transition-colors",
                    idx === breadcrumbs.length - 1 && "font-semibold text-charcoal-900"
                  )}
                >
                  {crumb.label}
                </Link>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right: Search, Notifications, User */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <button
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-cream-100 rounded-lg text-charcoal-600 hover:bg-cream-200 transition-colors text-sm"
            onClick={() => {
              // TODO: Open search modal
            }}
          >
            <Search className="w-4 h-4" />
            <span className="text-charcoal-500">Search...</span>
            <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-semibold text-charcoal-500 bg-cream-200 border border-cream-300 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-100 rounded-lg transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {showNotifications && (
              <m.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-80 bg-cream-50 rounded-lg shadow-xl border border-cream-200 overflow-hidden"
              >
                <div className="p-4 border-b border-cream-200">
                  <h3 className="font-semibold text-charcoal-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 text-sm text-charcoal-600 text-center">
                    No new notifications
                  </div>
                </div>
              </m.div>
            )}
          </div>

          {/* User Menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-cream-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-navy-900 flex items-center justify-center">
                  <span className="text-cream-50 text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium text-charcoal-900">
                  {user.name}
                </span>
                <ChevronDown className="w-4 h-4 text-charcoal-600" />
              </button>

              {showUserMenu && (
                <m.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-cream-50 rounded-lg shadow-xl border border-cream-200 overflow-hidden"
                >
                  <div className="p-2">
                    <div className="px-3 py-2 text-sm">
                      <p className="font-semibold text-charcoal-900">{user.name}</p>
                      <p className="text-xs text-charcoal-600">{user.email}</p>
                    </div>
                    <div className="border-t border-cream-200 mt-2 pt-2">
                      <Link
                        href="/admin/settings/profile"
                        className="block px-3 py-2 text-sm text-charcoal-700 hover:bg-cream-100 rounded transition-colors"
                      >
                        Profile Settings
                      </Link>
                    </div>
                  </div>
                </m.div>
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
