"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  Shirt,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  Boxes,
  UserCog,
  Activity,
} from "lucide-react";
import { useAdminAuth } from "@/lib/stores/admin-auth-store";
import { apiUrl } from "@/lib/config/api-base";

interface NavChild {
  label: string;
  href: string;
  permission?: string;
}

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  badge?: number | null;
  permission?: string;
  children?: NavChild[];
}

interface AdminSidebarProps {
  collapsed: boolean;
  onCollapse: () => void;
}

/** Map nav keys to any store permission that should grant access (view vs manage). */
function hasNavPermission(
  hasPermission: (p: string) => boolean,
  perm?: string,
): boolean {
  if (!perm) return true;
  const groups: Record<string, string[]> = {
    view_products: ["view_products", "manage_products"],
    view_orders: ["view_orders", "manage_orders"],
    view_inventory: ["view_inventory", "manage_inventory"],
  };
  const keys = groups[perm] ?? [perm];
  return keys.some((k) => hasPermission(k));
}

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, permission: "view_dashboard" },
  {
    label: "Products",
    icon: Package,
    permission: "view_products",
    children: [
      { label: "All Products", href: "/admin/products", permission: "view_products" },
      { label: "Add Product", href: "/admin/products/new", permission: "manage_products" },
      { label: "Categories", href: "/admin/categories", permission: "manage_categories" },
      { label: "Collections", href: "/admin/collections", permission: "manage_collections" },
      { label: "Pricing", href: "/admin/pricing", permission: "manage_products" },
    ],
  },
  {
    label: "Orders",
    icon: ShoppingBag,
    permission: "view_orders",
    children: [{ label: "All Orders", href: "/admin/orders", permission: "view_orders" }],
  },
  {
    label: "Inventory",
    icon: Boxes,
    permission: "view_inventory",
    children: [
      { label: "Stock", href: "/admin/inventory", permission: "view_inventory" },
      { label: "Forecast", href: "/admin/inventory/forecast", permission: "manage_inventory" },
      { label: "Reports", href: "/admin/inventory/reports", permission: "manage_inventory" },
    ],
  },
  {
    label: "Complete Looks",
    icon: Shirt,
    permission: "manage_looks",
    children: [
      { label: "All Looks", href: "/admin/looks" },
      { label: "Create Look", href: "/admin/looks/new" },
    ],
  },
  {
    label: "Customers",
    icon: Users,
    permission: "manage_customers",
    children: [
      { label: "All Customers", href: "/admin/customers" },
      { label: "Groups", href: "/admin/customers/groups" },
    ],
  },
  {
    label: "Analytics",
    icon: BarChart3,
    permission: "view_analytics",
    children: [
      { label: "Overview", href: "/admin/analytics" },
      { label: "Sales", href: "/admin/analytics/sales" },
      { label: "Traffic", href: "/admin/analytics/traffic" },
      { label: "Products", href: "/admin/analytics/products" },
    ],
  },
  { label: "Activity", href: "/admin/activity", icon: Activity, permission: "view_analytics" },
  { label: "Admin Users", href: "/admin/users", icon: UserCog, permission: "manage_users" },
  { label: "Settings", href: "/admin/settings", icon: Settings, permission: "manage_settings" },
];

function NavItemRow({
  item,
  collapsed,
  badge,
  hasPermission,
}: {
  item: NavItem;
  collapsed: boolean;
  badge?: number | null;
  hasPermission: (p: string) => boolean;
}) {
  const pathname = usePathname();
  if (!hasNavPermission(hasPermission, item.permission)) {
    return null;
  }

  const hasChildren = !!item.children?.length;
  const visibleChildren =
    item.children?.filter((c) => hasNavPermission(hasPermission, c.permission)) ?? [];

  const isActive = item.href
    ? item.href === "/admin"
      ? pathname === "/admin"
      : pathname?.startsWith(item.href)
    : visibleChildren.some(
        (c) =>
          pathname === c.href ||
          (c.href !== "/admin" && pathname?.startsWith(c.href)),
      );

  const [open, setOpen] = React.useState(!!isActive);

  if (hasChildren && visibleChildren.length === 0) {
    return null;
  }

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          className={[
            "adm-nav-item",
            isActive ? "adm-nav-item--active" : "",
          ].join(" ")}
          onClick={() => !collapsed && setOpen((v) => !v)}
          title={collapsed ? item.label : undefined}
        >
          <item.icon className="adm-nav-item__icon" size={15} />
          <span className="adm-nav-item__label">{item.label}</span>
          {badge != null && badge > 0 && (
            <span className="adm-nav-item__badge">{badge}</span>
          )}
          {!collapsed && (
            <ChevronDown
              size={12}
              className={[
                "adm-nav-item__chevron",
                open ? "adm-nav-item__chevron--open" : "",
              ].join(" ")}
            />
          )}
        </button>
        <AnimatePresence initial={false}>
          {open && !collapsed && (
            <motion.div
              key="sub"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div className="adm-nav-sub">
                {visibleChildren.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={[
                      "adm-nav-sub-item",
                      pathname === child.href ||
                      (child.href !== "/admin" && pathname?.startsWith(child.href))
                        ? "adm-nav-sub-item--active"
                        : "",
                    ].join(" ")}
                  >
                    {child.label}
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
      className={[
        "adm-nav-item",
        isActive ? "adm-nav-item--active" : "",
      ].join(" ")}
      title={collapsed ? item.label : undefined}
    >
      <item.icon className="adm-nav-item__icon" size={15} />
      <span className="adm-nav-item__label">{item.label}</span>
      {badge != null && badge > 0 && (
        <span className="adm-nav-item__badge">{badge}</span>
      )}
    </Link>
  );
}

export function AdminSidebar({ collapsed, onCollapse }: AdminSidebarProps): JSX.Element {
  const { hasPermission } = useAdminAuth();
  const [orderBadge, setOrderBadge] = React.useState<number | null>(null);

  React.useEffect(() => {
    fetch(apiUrl("/api/admin/orders"), { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const orders = data.data?.orders ?? data.orders ?? [];
        const n = orders.filter((o: { status: string }) => o.status === "PENDING").length;
        setOrderBadge(n > 0 ? n : null);
      })
      .catch(() => {});
  }, []);

  return (
    <aside
      className={["adm-sidebar", collapsed ? "adm-sidebar--collapsed" : ""].join(" ")}
    >
      <Link href="/admin" className="adm-sidebar__logo">
        <div className="adm-sidebar__logo-mark">E3</div>
        <span className="adm-sidebar__logo-text">EDK Admin</span>
      </Link>

      <nav className="adm-sidebar__nav" aria-label="Admin navigation">
        <div className="adm-sidebar__section">
          {NAV.map((item) => (
            <NavItemRow
              key={item.label}
              item={item}
              collapsed={collapsed}
              badge={item.label === "Orders" ? orderBadge : null}
              hasPermission={hasPermission}
            />
          ))}
        </div>
      </nav>

      <div className="adm-sidebar__footer">
        <button
          type="button"
          className="adm-sidebar__collapse-btn"
          onClick={onCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft size={14} />
          ) : (
            <>
              <PanelLeftClose size={14} />
              <span style={{ fontSize: 12 }}>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
