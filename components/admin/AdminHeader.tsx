"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, ExternalLink } from "lucide-react";
import { useAdminAuth } from "@/lib/stores/admin-auth-store";

interface AdminHeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar:  () => void;
}

function usePageTitle(): string {
  const p = usePathname() ?? "";
  const segs = p.replace("/admin", "").split("/").filter(Boolean);
  if (!segs.length) return "Dashboard";
  return segs
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " "))
    .join(" / ");
}

export function AdminHeader({
  sidebarCollapsed,
  onToggleSidebar: _onToggleSidebar,
}: AdminHeaderProps): JSX.Element {
  const router    = useRouter();
  const { logout } = useAdminAuth();
  const pageTitle = usePageTitle();

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  return (
    <header
      className={`adm-header${sidebarCollapsed ? " adm-header--col" : ""}`}
    >
      {/* Breadcrumb */}
      <div className="adm-hdr-path">
        <span className="adm-hdr-seg">EDK</span>
        <span className="adm-hdr-sep">/</span>
        <span className="adm-hdr-cur">{pageTitle}</span>
      </div>

      {/* Actions — minimal, purposeful */}
      <div className="adm-hdr-r">
        <Link
          href="/" target="_blank"
          className="adm-ic-btn" title="View storefront"
        >
          <ExternalLink size={14} strokeWidth={1.5} />
        </Link>

        <button className="adm-ic-btn" title="Notifications">
          <Bell size={14} strokeWidth={1.5} />
          <span className="adm-ic-btn-dot" />
        </button>

        <div className="adm-hdiv" />

        <Link
          href="/admin/products/new"
          className="adm-new-btn"
        >
          <svg
            style={{ width: 12, height: 12 }}
            viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5"  y1="12" x2="19" y2="12"/>
          </svg>
          New Product
        </Link>

        <div className="adm-hdiv" />

        <button
          className="adm-ic-btn"
          onClick={handleLogout}
          title="Sign out"
        >
          <LogOut size={14} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}

export default AdminHeader;
