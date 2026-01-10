"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "@/lib/stores/admin-auth-store";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { PageLoader } from "@/components/ui/PageLoader";
import { useAdminKeyboards } from "@/lib/hooks/use-admin-keyboard";
import { ToastProvider } from "@/components/ui/toast";
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
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAdminAuth();

  // Enable keyboard shortcuts (must be called unconditionally)
  useAdminKeyboards();

  // Redirect to login if not authenticated (except on login page)
  React.useEffect(() => {
    if (!isAuthenticated && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [isAuthenticated, pathname, router]);

  // Don't render layout on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Show loader while checking auth
  if (!isAuthenticated || !user) {
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
