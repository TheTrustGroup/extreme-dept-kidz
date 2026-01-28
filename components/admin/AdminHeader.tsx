"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m } from "framer-motion";
import { Menu as MenuIcon, Search, Bell, ChevronDown, LogOut } from "lucide-react";
import { useAdminAuth } from "@/lib/stores/admin-auth-store";
import { DatabaseStatus } from "@/components/admin/DatabaseStatus";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AdminBody, AdminBodySmall, AdminCaption } from "@/components/admin/AdminTypography";
import { cn } from "@/lib/utils";

// Wrapper component to catch errors in DatabaseStatus
function DatabaseStatusWrapper(): JSX.Element {
  return (
    <ErrorBoundary
      fallback={null} // Fail silently - don't break the header
    >
      <DatabaseStatus />
    </ErrorBoundary>
  );
}

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
  const { user, logout, isAuthenticated } = useAdminAuth();
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
    <header className="admin-header-glass sticky top-0 z-30">
      {/* Database Status Banner - Wrapped in error boundary */}
      <div className="admin-section-sm px-[var(--admin-space-4)] lg:px-[var(--admin-space-6)] border-b border-cream-200">
        <React.Suspense fallback={null}>
          <DatabaseStatusWrapper />
        </React.Suspense>
      </div>
      <div className="admin-flex-md items-center justify-between px-[var(--admin-space-4)] lg:px-[var(--admin-space-6)]" style={{ height: 'var(--admin-header-height, 4rem)' }}>
        {/* Left: Menu & Breadcrumb */}
        <div className="admin-flex-md items-center">
          <button
            onClick={onMenuClick}
            className="p-[var(--admin-space-2)] text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-100 rounded-lg transition-all duration-200 lg:hidden active:scale-95 flex-shrink-0"
            aria-label="Toggle menu"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <nav className="hidden md:flex items-center admin-flex-sm">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.href}>
                {idx > 0 && (
                  <span className="text-charcoal-400">/</span>
                )}
                <Link
                  href={crumb.href}
                  className={cn(
                    "text-charcoal-600 hover:text-charcoal-900 transition-colors duration-200",
                    idx === breadcrumbs.length - 1 && "font-semibold text-charcoal-900"
                  )}
                >
                  <AdminBodySmall>{crumb.label}</AdminBodySmall>
                </Link>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right: Search, Notifications, User */}
        <div className="admin-flex-sm items-center flex-wrap gap-[var(--admin-space-2)] min-w-0">
          {/* Search */}
          <button
            className="hidden md:flex items-center admin-flex-sm px-[var(--admin-space-3)] sm:px-[var(--admin-space-4)] py-[var(--admin-space-2)] bg-white/60 backdrop-blur-sm rounded-lg text-charcoal-600 hover:bg-white/80 transition-all duration-200 border border-cream-200/50 hover:border-cream-300/70 active:scale-[0.98] shadow-sm hover:shadow-md flex-shrink-0"
            onClick={() => {
              // TODO: Open search modal
            }}
          >
            <Search className="w-4 h-4 flex-shrink-0" />
            <AdminBodySmall className="text-charcoal-500 hidden lg:inline">Search...</AdminBodySmall>
            <kbd className="hidden xl:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-semibold text-charcoal-500 bg-white border border-cream-300 rounded shadow-sm">
              ⌘K
            </kbd>
          </button>

          {/* Notifications */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-[var(--admin-space-2)] text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-100 rounded-lg transition-all duration-200 relative active:scale-95"
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
                  className="admin-dropdown admin-floating absolute right-0 mt-[var(--admin-space-2)] w-[calc(100vw-2rem)] sm:w-80 rounded-xl overflow-hidden z-50"
                >
                    <div className="admin-section-sm border-b border-cream-200/50 bg-cream-50/80 backdrop-blur-sm">
                      <AdminBody className="font-semibold text-charcoal-900">Notifications</AdminBody>
                    </div>
                    <div className="admin-scroll-container max-h-96">
                      <div className="admin-section-md text-center">
                        <Bell className="w-8 h-8 mx-auto mb-[var(--admin-space-2)] text-charcoal-400" />
                        <AdminBodySmall className="text-charcoal-600">No new notifications</AdminBodySmall>
                      </div>
                    </div>
                </m.div>
              </>
            )}
          </div>

          {/* Sign Out Button - CRITICAL: Always visible when user exists, never hidden */}
          {/* Ensure it renders even if user state is temporarily null by checking isAuthenticated as fallback */}
          {(user || isAuthenticated) && (
            <button
              onClick={async () => {
                try {
                  await logout();
                } catch (error) {
                  console.error("Logout error:", error);
                  // Force redirect even if logout fails
                  window.location.replace('/admin/login');
                }
              }}
              className="admin-flex-sm items-center px-[var(--admin-space-2)] sm:px-[var(--admin-space-3)] py-[var(--admin-space-2)] rounded-lg text-charcoal-700 hover:text-red-600 hover:bg-red-50/80 backdrop-blur-sm transition-all duration-200 active:scale-95 border border-transparent hover:border-red-200/50 shadow-sm hover:shadow-md flex-shrink-0 z-10"
              aria-label="Sign out"
              title="Sign out"
              style={{ 
                minWidth: 'auto',
                visibility: 'visible',
                opacity: 1,
                display: 'flex'
              }}
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <AdminBodySmall className="font-medium hidden md:inline ml-[var(--admin-space-1)]">Sign out</AdminBodySmall>
            </button>
          )}

          {/* User Menu */}
          {user && (
            <div className="relative flex-shrink-0 z-10">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="admin-flex-sm items-center px-[var(--admin-space-2)] sm:px-[var(--admin-space-3)] py-[var(--admin-space-2)] rounded-lg hover:bg-cream-100/70 backdrop-blur-sm transition-all duration-200 active:scale-95 border border-transparent hover:border-cream-200/50 min-w-0"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center shadow-md flex-shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <AdminBodySmall className="hidden md:block font-medium text-charcoal-900 truncate lg:max-w-none ml-[var(--admin-space-2)]" style={{ maxWidth: 'var(--admin-max-width-text-truncate, 7rem)' }}>
                  {user.name}
                </AdminBodySmall>
                <ChevronDown className={cn(
                  "w-4 h-4 text-charcoal-600 transition-transform duration-200 flex-shrink-0 ml-[var(--admin-space-1)]",
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
                    className="admin-dropdown admin-floating absolute right-0 mt-[var(--admin-space-2)] w-[calc(100vw-2rem)] sm:w-56 rounded-xl overflow-hidden z-50"
                  >
                    <div className="admin-section-sm bg-gradient-to-r from-navy-50/80 to-navy-100/80 backdrop-blur-sm border-b border-cream-200/50">
                      <AdminBodySmall className="font-semibold text-charcoal-900">{user.name}</AdminBodySmall>
                      <AdminCaption className="text-charcoal-600 truncate normal-case">{user.email}</AdminCaption>
                      <AdminCaption className="text-charcoal-500 mt-[var(--admin-space-1)] capitalize">{user.role.replace("_", " ")}</AdminCaption>
                    </div>
                    <div className="admin-rhythm-sm p-[var(--admin-space-1)]">
                      <Link
                        href="/admin/settings/profile"
                        className="block px-[var(--admin-space-3)] py-[var(--admin-space-2)] text-charcoal-700 hover:bg-cream-100/70 backdrop-blur-sm rounded-lg transition-all duration-200 hover:shadow-sm"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <AdminBodySmall>Profile Settings</AdminBodySmall>
                      </Link>
                      <button
                        onClick={async () => {
                          setShowUserMenu(false);
                          try {
                            await logout();
                          } catch (error) {
                            console.error("Logout error:", error);
                            // Force redirect even if logout fails
                            window.location.replace('/admin/login');
                          }
                        }}
                        className="w-full text-left px-[var(--admin-space-3)] py-[var(--admin-space-2)] text-red-600 hover:bg-red-50/80 backdrop-blur-sm rounded-lg transition-all duration-200 hover:shadow-sm"
                        aria-label="Sign out"
                      >
                        <AdminBodySmall>Sign Out</AdminBodySmall>
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

