"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "@/lib/stores/admin-auth-store";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { PageLoader } from "@/components/ui/PageLoader";
import { useAdminKeyboards } from "@/lib/hooks/use-admin-keyboard";

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin Layout
 * 
 * Main layout wrapper for admin dashboard with sidebar and header.
 */
export default function AdminLayout({ children }: AdminLayoutProps): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAdminAuth();

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

  // Enable keyboard shortcuts
  useAdminKeyboards();

  return (
    <div className="flex h-screen bg-cream-50 overflow-hidden">
      <AdminSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
