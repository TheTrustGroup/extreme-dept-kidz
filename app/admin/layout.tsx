"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "@/lib/stores/admin-auth-store";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { PageLoader } from "@/components/ui/PageLoader";
import { useAdminKeyboards } from "@/lib/hooks/use-admin-keyboard";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthSync } from "@/components/admin/AuthSync";
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
  const [hasCheckedAuth, setHasCheckedAuth] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, checkAuth, token } = useAdminAuth();
  const setAuthState = useAdminAuth.getState();

  // Enable keyboard shortcuts (must be called unconditionally)
  useAdminKeyboards();

  // Check authentication on mount only (not on every route change)
  React.useEffect(() => {
    // Don't check auth on public pages (login, forgot-password, reset-password)
    const publicRoutes = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];
    if (publicRoutes.includes(pathname)) {
      setCheckingAuth(false);
      setHasCheckedAuth(false);
      return;
    }

    // Only check auth once, not on every route change
    if (hasCheckedAuth) {
      setCheckingAuth(false);
      return;
    }

    // CRITICAL FIX: If middleware allowed this request through, the cookie is valid
    // Trust middleware's decision - only verify auth state, don't redirect if we have persisted state
    // This prevents the loop where middleware allows request but AdminLayout redirects anyway
    if (token && isAuthenticated && user && !hasCheckedAuth) {
      // Middleware already validated the cookie, so we can trust the persisted state
      // Just verify in background without redirecting on failure (middleware will handle it)
      setCheckingAuth(false);
      setHasCheckedAuth(true);
      
      // Verify in background without redirecting - middleware is the source of truth for route protection
      setTimeout(() => {
        checkAuth().catch((error) => {
          console.error("[AdminLayout] Background auth check error:", error);
          // Don't redirect - middleware will handle invalid auth on next request
        });
      }, 500);
      return;
    }

    // Only check auth once on mount if we don't have persisted state
    const verifyAuth = async (): Promise<void> => {
      setCheckingAuth(true);
      setHasCheckedAuth(true);
      try {
        const authenticated = await checkAuth();
        // CRITICAL: Don't redirect if middleware already allowed the request
        // If we reach here without persisted state, middleware already validated the cookie
        // Only clear state if checkAuth fails, but don't redirect (middleware will handle it)
        if (!authenticated) {
          console.warn('[AdminLayout] Auth check failed, but trusting middleware decision');
          // Clear invalid state but don't redirect - middleware will redirect on next request if needed
          const currentState = useAdminAuth.getState();
          if (!currentState.token) {
          // Only clear state if we truly have no token
          useAdminAuth.setState({ isAuthenticated: false, user: null, token: null });
          }
        }
      } catch (error) {
        console.error("[AdminLayout] Auth check error:", error);
        // Don't redirect - middleware is the source of truth
        // Only clear state if we truly have no token
        const currentState = useAdminAuth.getState();
        if (!currentState.token) {
          useAdminAuth.setState({ isAuthenticated: false, user: null, token: null });
        }
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount, not on pathname changes

  // Don't render layout on public pages (login, forgot-password, reset-password)
  const publicRoutes = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Show loader while checking auth or if not authenticated
  if (checkingAuth || !isAuthenticated || !user) {
    return <PageLoader />;
  }

  return (
    <ToastProvider>
      <AuthSync />
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
