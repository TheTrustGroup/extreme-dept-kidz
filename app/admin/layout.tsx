"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "@/lib/stores/admin-auth-store";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminBreadcrumbProvider } from "@/components/admin/AdminBreadcrumbContext";
import { PageLoader } from "@/components/ui/PageLoader";
import { useAdminKeyboards } from "@/lib/hooks/use-admin-keyboard";
import { ToastProvider } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "@/app/admin/admin-globals.css";

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin Layout
 * 
 * Main layout wrapper for admin dashboard with sidebar and header.
 * Premium design with background image support.
 */
export default function AdminLayout({ children }: AdminLayoutProps): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [checkingAuth, setCheckingAuth] = React.useState(true);
  const pathname = usePathname();
  const { checkAuth, user } = useAdminAuth();

  // Enable keyboard shortcuts (must be called unconditionally)
  useAdminKeyboards();

  // CRITICAL: Initialize user state on mount
  // Middleware validates the cookie, but we need to fetch user info for UI
  React.useEffect(() => {
    // Don't check auth on public pages (login, forgot-password, reset-password)
    const publicRoutes = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];
    if (publicRoutes.includes(pathname)) {
      setCheckingAuth(false);
      return;
    }

    // Initialize user state from cookie (middleware already validated it)
    // This ensures the sign out button and user menu show up
    checkAuth()
      .then((authenticated) => {
        if (!authenticated) {
          console.warn("[AdminLayout] Auth check failed, but middleware allowed access");
        }
        setCheckingAuth(false);
      })
      .catch((error) => {
        console.error("[AdminLayout] Auth check error:", error);
        // Don't block rendering - middleware already validated cookie
        setCheckingAuth(false);
      });
  }, [pathname, checkAuth]);

  // Don't render layout on public pages (login, forgot-password, reset-password)
  const publicRoutes = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Show loader only while checking (brief moment on mount)
  // Do NOT check isAuthenticated or user - middleware already validated cookie
  if (checkingAuth) {
    return <PageLoader />;
  }

  return (
    <ToastProvider>
      <ErrorBoundary>
        <div className="admin-container flex h-screen bg-cream-50 overflow-hidden admin-background" style={{ isolation: 'isolate', position: 'relative', zIndex: 1 }}>
          {/* Background Image Layer */}
          <div 
            className="fixed inset-0 z-0 pointer-events-none"
            style={{
              backgroundImage: "url('/admin-bg.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
              opacity: 0.03,
            }}
          />
          
          <AdminSidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />

          <div className="flex-1 flex flex-col overflow-hidden relative" style={{ zIndex: 10, isolation: 'isolate' }}>
            <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

            <main className="admin-scroll-container flex-1 p-[var(--admin-space-4)] sm:p-[var(--admin-space-5)] lg:p-[var(--admin-space-7)]">
              <div className="max-w-7xl mx-auto admin-rhythm-lg">
                <ErrorBoundary>
                  <AdminBreadcrumbProvider>
                    <AdminBreadcrumb />
                    {children}
                  </AdminBreadcrumbProvider>
                </ErrorBoundary>
              </div>
            </main>
          </div>
        </div>
      </ErrorBoundary>
    </ToastProvider>
  );
}
