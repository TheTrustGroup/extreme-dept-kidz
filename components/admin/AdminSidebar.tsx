"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingBag,
  Users, BarChart2, Settings, Boxes,
  Activity, ChevronDown, PanelLeftClose,
  PanelLeft, Shirt, Bell,
} from "lucide-react";
import { useAdminAuth } from "@/lib/stores/admin-auth-store";
import { apiUrl } from "@/lib/config/api-base";

interface NavChild { label: string; href: string }
interface NavItem {
  label:    string;
  href?:    string;
  icon:     React.ElementType;
  badge?:   number | null;
  children?: NavChild[];
}

interface AdminSidebarProps {
  collapsed:  boolean;
  onCollapse: () => void;
}

const NAV: NavItem[] = [
  { label: "Dashboard",  href: "/admin",                  icon: LayoutDashboard },
  { label: "Products",   icon: Package, children: [
    { label: "All Products",  href: "/admin/products"       },
    { label: "Add Product",   href: "/admin/products/new"   },
    { label: "Categories",    href: "/admin/categories"     },
    { label: "Collections",   href: "/admin/collections"    },
    { label: "Pricing",       href: "/admin/pricing"        },
  ]},
  { label: "Orders",     icon: ShoppingBag, children: [
    { label: "All Orders",    href: "/admin/orders"         },
  ]},
  { label: "Inventory",  icon: Boxes, children: [
    { label: "Stock",         href: "/admin/inventory"      },
    { label: "Forecast",      href: "/admin/inventory/forecast" },
    { label: "Reports",       href: "/admin/inventory/reports" },
  ]},
  { label: "Looks",      icon: Shirt, children: [
    { label: "All Looks",     href: "/admin/looks"          },
    { label: "Create Look",   href: "/admin/looks/new"      },
  ]},
  { label: "Customers",  icon: Users, children: [
    { label: "All Customers", href: "/admin/customers"      },
    { label: "Groups",        href: "/admin/customers/groups" },
  ]},
  { label: "Analytics",  icon: BarChart2, children: [
    { label: "Sales",         href: "/admin/analytics/sales" },
    { label: "Traffic",       href: "/admin/analytics/traffic" },
    { label: "Products",      href: "/admin/analytics/products" },
  ]},
  { label: "Activity",   href: "/admin/activity",         icon: Activity },
  { label: "Notifications", href: "/admin/notifications/retry", icon: Bell },
  { label: "Settings",   href: "/admin/settings",         icon: Settings },
];

function NavRow({
  item, collapsed, badge,
}: { item: NavItem; collapsed: boolean; badge?: number | null }): JSX.Element {
  const pathname   = usePathname();
  const hasChildren = !!item.children?.length;
  const isActive   = item.href
    ? item.href === "/admin"
      ? pathname === "/admin"
      : pathname?.startsWith(item.href)
    : item.children?.some((c) => pathname?.startsWith(c.href));
  const [open, setOpen] = React.useState(!!isActive);

  if (hasChildren) {
    return (
      <div>
        <button
          className={`adm-ni${isActive ? " adm-ni--on" : ""}`}
          onClick={() => !collapsed && setOpen((v) => !v)}
          title={collapsed ? item.label : undefined}
        >
          <item.icon size={14} strokeWidth={1.5} />
          <span className="adm-ni-lbl">{item.label}</span>
          {badge != null && badge > 0 && (
            <span
              className="adm-ni-badge"
              style={{ background: "var(--adm-ro2)", color: "var(--adm-rose)" }}
            >
              {badge}
            </span>
          )}
          {!collapsed && (
            <ChevronDown
              size={11}
              style={{
                marginLeft: "auto",
                color: "var(--adm-t3)",
                transition: "transform .18s",
                transform: open ? "rotate(180deg)" : "none",
                flexShrink: 0,
              }}
            />
          )}
        </button>
        <AnimatePresence initial={false}>
          {open && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ paddingLeft: 22 }}>
                {item.children!.map((c) => (
                  <Link
                    key={c.href} href={c.href}
                    style={{
                      display: "flex", alignItems: "center",
                      height: 28, padding: "0 8px",
                      borderRadius: "var(--adm-radius)",
                      fontSize: 12, textDecoration: "none", lineHeight: 1.2,
                      color: pathname === c.href ||
                        (c.href !== "/admin" && pathname?.startsWith(c.href))
                        ? "var(--adm-gold)" : "var(--adm-t3)",
                      transition: "background 100ms, color 100ms",
                      marginBottom: 1,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "rgba(255,255,255,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "none";
                    }}
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      href={item.href!}
      className={`adm-ni${isActive ? " adm-ni--on" : ""}`}
      title={collapsed ? item.label : undefined}
    >
      <item.icon size={14} strokeWidth={1.5} />
      <span className="adm-ni-lbl">{item.label}</span>
      {badge != null && badge > 0 && (
        <span
          className="adm-ni-badge"
          style={{ background: "var(--adm-ro2)", color: "var(--adm-rose)" }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

export function AdminSidebar({ collapsed, onCollapse }: AdminSidebarProps): JSX.Element {
  const { user } = useAdminAuth();
  const [orderBadge, setOrderBadge] = React.useState<number | null>(null);

  React.useEffect(() => {
    fetch(apiUrl("/api/admin/orders"), { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const all = data.data?.orders ?? data.orders ?? [];
        const n   = all.filter((o: { status: string }) =>
          o.status === "PENDING"
        ).length;
        setOrderBadge(n > 0 ? n : null);
      })
      .catch(() => {});
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AU";

  return (
    <aside
      className={`adm-sidebar${collapsed ? " adm-sidebar--col" : ""}`}
    >
      {/* Brand */}
      <div className="adm-sb-top">
        <Link href="/admin" className="adm-brand">
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "var(--adm-radius)",
              background: "var(--adm-gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 180 180"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <rect x="28" y="38" width="13" height="104" rx="2" fill="#0a0a0f" />
              <rect x="28" y="38" width="52" height="13" rx="2" fill="#0a0a0f" />
              <rect x="28" y="84" width="42" height="13" rx="2" fill="#0a0a0f" />
              <rect x="28" y="129" width="52" height="13" rx="2" fill="#0a0a0f" />
              <rect x="139" y="38" width="13" height="104" rx="2" fill="#0a0a0f" />
              <rect x="100" y="38" width="52" height="13" rx="2" fill="#0a0a0f" />
              <rect x="110" y="84" width="42" height="13" rx="2" fill="#0a0a0f" />
              <rect x="100" y="129" width="52" height="13" rx="2" fill="#0a0a0f" />
            </svg>
          </div>
          <div className="adm-brand-text">
            <b>Extreme Dept</b>
            <span>Kidz · Admin</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="adm-nav" aria-label="Admin navigation">
        <div style={{ padding: "0 0" }}>
          <p className="adm-nl">Menu</p>
          {NAV.slice(0, 6).map((item) => (
            <NavRow
              key={item.label} item={item} collapsed={collapsed}
              badge={item.label === "Orders" ? orderBadge : null}
            />
          ))}
          <p className="adm-nl" style={{ marginTop: 4 }}>Insights</p>
          {NAV.slice(6, 8).map((item) => (
            <NavRow key={item.label} item={item} collapsed={collapsed} />
          ))}
          <p className="adm-nl" style={{ marginTop: 4 }}>Config</p>
          {NAV.slice(8).map((item) => (
            <NavRow key={item.label} item={item} collapsed={collapsed} />
          ))}
        </div>
      </nav>

      {/* User + collapse */}
      <div className="adm-sb-foot">
        <div className="adm-user">
          <div className="adm-avatar">{initials}</div>
          <div className="adm-user-info">
            <b>{user?.name ?? "Admin User"}</b>
            <span>{user?.role ?? "Admin"}</span>
          </div>
          <svg
            className="adm-user-chevron"
            viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
          >
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
        <button
          onClick={onCollapse}
          title={collapsed ? "Expand" : "Collapse"}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            width: "100%", padding: "5px 8px",
            background: "none", border: "none",
            borderRadius: "var(--adm-radius)",
            color: "var(--adm-t3)", fontSize: 11, lineHeight: 1.2,
            cursor: "pointer", marginTop: 4,
            transition: "background 100ms, color 100ms",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(255,255,255,0.04)";
            (e.currentTarget as HTMLElement).style.color = "var(--adm-t2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "none";
            (e.currentTarget as HTMLElement).style.color = "var(--adm-t3)";
          }}
        >
          {collapsed
            ? <PanelLeft size={14} />
            : <><PanelLeftClose size={14} /><span>Collapse</span></>
          }
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
