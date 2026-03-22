"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "@/lib/stores/admin-auth-store";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminBreadcrumbProvider } from "@/components/admin/AdminBreadcrumbContext";
import { BrandSpinner } from "@/components/ui/PageLoader";
import { useAdminKeyboards } from "@/lib/hooks/use-admin-keyboard";
import { ToastProvider } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "@/app/admin/admin-globals.css";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const { checkAuth, user, isAuthenticated } = useAdminAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [checkingAuth, setCheckingAuth] = React.useState(true);

  const publicRoutes = [
    "/admin/login",
    "/admin/forgot-password",
    "/admin/reset-password",
  ];
  const isPublicRoute = publicRoutes.some((r) => pathname?.startsWith(r));

  useAdminKeyboards();

  React.useEffect(() => {
    if (isPublicRoute) {
      setCheckingAuth(false);
      return;
    }
    if (user && isAuthenticated) {
      setCheckingAuth(false);
      return;
    }
    setCheckingAuth(true);
    checkAuth()
      .then((ok) => {
        if (!ok) {
          router.replace(
            `/admin/login?from=${encodeURIComponent(pathname ?? "/admin")}`,
          );
        }
      })
      .catch(() => {
        router.replace(
          `/admin/login?from=${encodeURIComponent(pathname ?? "/admin")}`,
        );
      })
      .finally(() => {
        setCheckingAuth(false);
      });
  }, [
    pathname,
    isPublicRoute,
    user,
    isAuthenticated,
    checkAuth,
    router,
  ]);

  if (isPublicRoute) {
    return (
      <div data-admin style={{ minHeight: "100vh" }}>
        <ErrorBoundary>
          <ToastProvider>{children}</ToastProvider>
        </ErrorBoundary>
      </div>
    );
  }

  if (checkingAuth) {
    return (
      <div data-admin style={{ minHeight: "100vh" }}>
        <BrandSpinner />
      </div>
    );
  }

  if (!user || !isAuthenticated) {
    return (
      <div data-admin style={{ minHeight: "100vh" }}>
        <BrandSpinner />
      </div>
    );
  }

  return (
    <div data-admin style={{ minHeight: "100vh" }}>
      <ErrorBoundary>
        <ToastProvider>
          <AdminBreadcrumbProvider>
            <AdminSidebar
              collapsed={sidebarCollapsed}
              onCollapse={() => setSidebarCollapsed((v) => !v)}
            />
            <AdminHeader
              sidebarCollapsed={sidebarCollapsed}
              onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
            />
            <main
              className={[
                "adm-main",
                sidebarCollapsed ? "adm-main--collapsed" : "",
              ].join(" ")}
            >
              <div className="adm-page">{children}</div>
            </main>
          </AdminBreadcrumbProvider>
        </ToastProvider>
      </ErrorBoundary>
    </div>
  );
}
