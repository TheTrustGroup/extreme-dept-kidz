"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, ExternalLink, Menu } from "lucide-react";
import { useAdminAuth } from "@/lib/stores/admin-auth-store";
import { getRoleDisplayLabel } from "@/lib/auth/rbac";

interface AdminHeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

function usePageTitle(): string {
  const pathname = usePathname() ?? "";
  const segments = pathname.replace("/admin", "").split("/").filter(Boolean);
  if (segments.length === 0) return "Dashboard";
  return segments
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " "))
    .join(" / ");
}

export function AdminHeader({
  sidebarCollapsed,
  onToggleSidebar,
}: AdminHeaderProps): JSX.Element {
  const router = useRouter();
  const { user, logout } = useAdminAuth();
  const pageTitle = usePageTitle();
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "A";

  const handleLogout = async (): Promise<void> => {
    await logout();
    router.replace("/admin/login");
  };

  return (
    <header
      className={[
        "adm-header",
        sidebarCollapsed ? "adm-header--collapsed" : "",
      ].join(" ")}
    >
      <button
        type="button"
        className="adm-header__btn md:hidden"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu size={14} />
      </button>

      <div className="adm-header__breadcrumb">
        <span style={{ color: "var(--adm-text-3)", fontSize: 12 }}>EDK</span>
        <span className="adm-header__breadcrumb-sep">/</span>
        <span className="adm-header__breadcrumb-current">{pageTitle}</span>
      </div>

      <div className="adm-header__actions">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="adm-header__btn"
          title="View storefront"
        >
          <ExternalLink size={14} />
        </Link>

        <button type="button" className="adm-header__btn" title="Notifications">
          <Bell size={14} />
          <span className="adm-header__badge" />
        </button>

        <div className="adm-header__divider" />

        <div className="adm-header__user">
          <div className="adm-header__avatar">{initials}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="adm-header__user-name">{user?.name ?? "Admin"}</span>
            <span className="adm-header__user-role">
              {user?.role ? getRoleDisplayLabel(user.role) : ""}
            </span>
          </div>
        </div>

        <div className="adm-header__divider" />

        <button
          type="button"
          className="adm-header__btn"
          onClick={handleLogout}
          title="Sign out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}

export default AdminHeader;
