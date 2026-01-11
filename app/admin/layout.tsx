"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "@/lib/stores/admin-auth-store";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { PageLoader } from "@/components/ui/PageLoader";
import { useAdminKeyboards } from "@/lib/hooks/use-admin-keyboard";
import { ToastProvider } from "@/components/ui/Toast";
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

  // Enable keyboard shortcuts (must be called unconditionally)
  useAdminKeyboards();

  // Check authentication on mount only (not on every route change)
  React.useEffect(() => {
    // Don't check auth on login page
    if (pathname === "/admin/login") {
      setCheckingAuth(false);
      setHasCheckedAuth(false);
      return;
    }

    // Only check auth once, not on every route change
    if (hasCheckedAuth) {
      setCheckingAuth(false);
      return;
    }

    // If we have a token and user from persisted state, trust it initially
    if (token && isAuthenticated && user && !hasCheckedAuth) {
      // Do a background check without blocking UI
      setCheckingAuth(false);
      setHasCheckedAuth(true);
      
      // Verify in background (non-blocking)
      checkAuth().then((authenticated) => {
        if (!authenticated) {
          router.push("/admin/login");
        }
      }).catch((error) => {
        console.error("Background auth check error:", error);
      });
      return;
    }

    // Only check auth once on mount if we don't have persisted state
    const verifyAuth = async (): Promise<void> => {
      setCheckingAuth(true);
      setHasCheckedAuth(true);
      try {
        const authenticated = await checkAuth();
        if (!authenticated) {
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // Only redirect if we're definitely not authenticated
        if (!isAuthenticated || !user) {
          router.push("/admin/login");
        }
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount, not on pathname changes

  // Don't render layout on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Show loader while checking auth or if not authenticated
  if (checkingAuth || !isAuthenticated || !user) {
    return <PageLoader />;
  }

  return (
    <ToastProvider>
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

          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
