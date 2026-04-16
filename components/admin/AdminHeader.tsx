"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, ExternalLink } from "lucide-react";
import { useAdminAuth } from "@/lib/stores/admin-auth-store";
import { apiUrl } from "@/lib/config/api-base";

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

function usePrimaryAction(): { href: string; label: string } {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/admin/collections")) {
    return { href: "/admin/collections/new", label: "Add Collection" };
  }
  if (pathname.startsWith("/admin/categories")) {
    return { href: "/admin/categories/new", label: "Add Category" };
  }
  if (pathname.startsWith("/admin/looks")) {
    return { href: "/admin/looks/new", label: "Create Look" };
  }
  return { href: "/admin/products/new", label: "New Product" };
}

export function AdminHeader({
  sidebarCollapsed,
  onToggleSidebar: _onToggleSidebar,
}: AdminHeaderProps): JSX.Element {
  const router    = useRouter();
  const { logout } = useAdminAuth();
  const pageTitle = usePageTitle();
  const primary = usePrimaryAction();
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [summary, setSummary] = React.useState<{
    unreadCount: number;
    pendingCodAttention: number;
    failedEmailDeliveries: number;
    deadEmailDeliveries: number;
    recentOrders: Array<{
      id: string;
      orderNumber: string;
      customerName: string;
      createdAt: string;
    }>;
  }>({
    unreadCount: 0,
    pendingCodAttention: 0,
    failedEmailDeliveries: 0,
    deadEmailDeliveries: 0,
    recentOrders: [],
  });
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const loadSummary = async (): Promise<void> => {
      try {
        const response = await fetch(apiUrl("/api/admin/notifications"), {
          credentials: "include",
        });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          data?: {
            unreadCount?: number;
            pendingCodAttention?: number;
            failedEmailDeliveries?: number;
            deadEmailDeliveries?: number;
            recentOrders?: Array<{
              id: string;
              orderNumber: string;
              customerName: string;
              createdAt: string;
            }>;
          };
        };
        const data = payload.data;
        if (!data) return;
        setSummary({
          unreadCount: Number(data.unreadCount ?? 0),
          pendingCodAttention: Number(data.pendingCodAttention ?? 0),
          failedEmailDeliveries: Number(data.failedEmailDeliveries ?? 0),
          deadEmailDeliveries: Number(data.deadEmailDeliveries ?? 0),
          recentOrders: data.recentOrders ?? [],
        });
      } catch {
        // Keep UI stable if notifications endpoint is unavailable to current role.
      }
    };

    void loadSummary();
    const interval = window.setInterval(loadSummary, 45_000);
    const clearSummaryInterval = (): void => {
      window.clearInterval(interval);
    };
    return clearSummaryInterval;
  }, []);

  React.useEffect(() => {
    if (!panelOpen) return;
    const onClickOutside = (event: MouseEvent): void => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    const removeClickListener = (): void => {
      document.removeEventListener("mousedown", onClickOutside);
    };
    return removeClickListener;
  }, [panelOpen]);

  const handleLogout = async (): Promise<void> => {
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

        <div style={{ position: "relative" }} ref={panelRef}>
          <button
            className="adm-ic-btn"
            title="Notifications"
            onClick={() => setPanelOpen((value) => !value)}
          >
            <Bell size={14} strokeWidth={1.5} />
            {summary.unreadCount > 0 && <span className="adm-ic-btn-dot" />}
          </button>
          {panelOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: 288,
                background: "var(--adm-s1)",
                border: "1px solid var(--adm-b1)",
                borderRadius: "var(--adm-radius)",
                padding: 12,
                boxShadow: "0 12px 30px rgba(0,0,0,.28)",
                zIndex: 60,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <strong style={{ fontSize: 12, color: "var(--adm-t1)", lineHeight: 1.2 }}>Notifications</strong>
                <span style={{ fontSize: 11, color: "var(--adm-t3)", lineHeight: 1.2 }}>
                  {summary.unreadCount} open
                </span>
              </div>
              <div style={{ display: "grid", gap: 6, marginBottom: 10 }}>
                <Link href="/admin/orders" style={{ textDecoration: "none", color: "var(--adm-t2)", fontSize: 11 }}>
                  COD pending ({summary.pendingCodAttention})
                </Link>
                <Link href="/admin/notifications/retry" style={{ textDecoration: "none", color: "var(--adm-t2)", fontSize: 11 }}>
                  Email retries failed ({summary.failedEmailDeliveries})
                </Link>
                <span style={{ color: "var(--adm-rose)", fontSize: 11 }}>
                  Email retries exhausted ({summary.deadEmailDeliveries})
                </span>
              </div>
              <div style={{ borderTop: "1px solid var(--adm-b1)", paddingTop: 8 }}>
                <p style={{ margin: 0, marginBottom: 6, fontSize: 10, color: "var(--adm-t3)", textTransform: "uppercase", letterSpacing: ".08em" }}>
                  Recent COD orders
                </p>
                {summary.recentOrders.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 11, color: "var(--adm-t3)" }}>No pending COD alerts.</p>
                ) : (
                  <div style={{ display: "grid", gap: 6 }}>
                    {summary.recentOrders.map((order) => (
                      <Link
                        key={order.id}
                        href={`/admin/orders/${order.id}`}
                        style={{ textDecoration: "none", color: "var(--adm-t2)", fontSize: 11 }}
                        onClick={() => setPanelOpen(false)}
                      >
                        #{order.orderNumber} - {order.customerName}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="adm-hdiv" />

        <Link
          href={primary.href}
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
          {primary.label}
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
