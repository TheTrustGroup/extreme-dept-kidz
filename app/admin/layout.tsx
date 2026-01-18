"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "@/lib/stores/admin-auth-store";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
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

  // Enable keyboard shortcuts (must be called unconditionally)
  useAdminKeyboards();

  // CRITICAL: Middleware is the ONLY source of auth protection
  // If middleware allowed this request, the cookie is valid - trust it
  // Do NOT perform any auth checks or redirects here
  React.useEffect(() => {
    // Don't check auth on public pages (login, forgot-password, reset-password)
    const publicRoutes = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];
    if (publicRoutes.includes(pathname)) {
      setCheckingAuth(false);
      return;
    }

    // Middleware already validated the cookie - just set checking to false
    // No auth checks, no redirects - middleware handles everything
    setCheckingAuth(false);
  }, [pathname]);

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
        <div className="flex h-screen bg-[#f8f9fa] overflow-hidden admin-background">
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

          <div className="flex-1 flex flex-col overflow-hidden relative z-10">
            <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </div>
            </main>
          </div>
        </div>
      </ErrorBoundary>
    </ToastProvider>
  );
}
