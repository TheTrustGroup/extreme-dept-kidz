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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const { checkAuth, user, isAuthenticated } = useAdminAuth();
  const [collapsed, setCollapsed] = React.useState(false);
  const [checkingAuth, setCheckingAuth] = React.useState(true);

  const publicRoutes = [
    "/admin/login",
    "/admin/forgot-password",
    "/admin/reset-password",
  ];
  const isPublic = publicRoutes.some((r) => pathname?.startsWith(r));

  useAdminKeyboards();

  React.useEffect(() => {
    if (isPublic) {
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
    isPublic,
    user,
    isAuthenticated,
    checkAuth,
    router,
  ]);

  if (isPublic) {
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
              collapsed={collapsed}
              onCollapse={() => setCollapsed((v) => !v)}
            />
            <AdminHeader
              sidebarCollapsed={collapsed}
              onToggleSidebar={() => setCollapsed((v) => !v)}
            />
            <main
              className={`adm-main${collapsed ? " adm-main--col" : ""}`}
            >
              <div className="adm-page">{children}</div>
            </main>
          </AdminBreadcrumbProvider>
        </ToastProvider>
      </ErrorBoundary>
    </div>
  );
}
