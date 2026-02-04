"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  Shirt,
  Building2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  FileText,
  UserCog,
  Plus,
  FolderOpen,
  Boxes,
  PackageCheck,
  Truck,
  CheckCircle,
  RotateCcw,
  TrendingUp,
  Eye,
  PackageSearch,
} from "lucide-react";
import { useAdminAuth } from "@/lib/stores/admin-auth-store";
import { AdminSidebarText, AdminCaption } from "@/components/admin/AdminTypography";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/lib/config/api-base";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: NavItem[];
}

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Admin Sidebar Component
 * 
 * Navigation sidebar for admin dashboard with collapsible sections.
 */
export function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps): JSX.Element {
  const pathname = usePathname();
  const { user } = useAdminAuth();
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = React.useState<number | null>(null);
  const [lowStockCount, setLowStockCount] = React.useState<number | null>(null);
  
  // Fetch pending orders count for badge
  React.useEffect(() => {
    const fetchPendingOrdersCount = async (): Promise<void> => {
      try {
        const response = await fetch(apiUrl("/api/admin/orders"), {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          const orders = data.data?.orders || data.orders || [];
          const pendingCount = orders.filter((order: { status: string }) => order.status === 'PENDING').length;
          setPendingOrdersCount(pendingCount > 0 ? pendingCount : null);
        }
      } catch (error) {
        console.error('[AdminSidebar] Failed to fetch pending orders count:', error);
        // Fail silently - don't break the UI
      }
    };

    if (user) {
      fetchPendingOrdersCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchPendingOrdersCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Fetch low stock count for Products badge
  React.useEffect(() => {
    const fetchLowStockCount = async (): Promise<void> => {
      try {
        const response = await fetch(apiUrl("/api/admin/inventory"), {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          const lowStock = data.data?.lowStock || data.lowStock || 0;
          setLowStockCount(lowStock > 0 ? lowStock : null);
        }
      } catch (error) {
        console.error('[AdminSidebar] Failed to fetch low stock count:', error);
        // Fail silently - don't break the UI
      }
    };

    if (user) {
      fetchLowStockCount();
      // Refresh every 60 seconds
      const interval = setInterval(fetchLowStockCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Responsive breakpoint detection - Desktop: 1024px+, Tablet: 768px-1023px, Mobile: <768px
  React.useEffect(() => {
    const checkScreenSize = (): void => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // On desktop (1024px+), use collapsed state; on tablet/mobile, use isOpen
  const sidebarExpanded = isDesktop ? !collapsed : isOpen;

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Products",
      href: "/admin/products",
      icon: Package,
      badge: lowStockCount ?? undefined,
      children: [
        { label: "All Products", href: "/admin/products", icon: PackageSearch },
        { label: "Add New", href: "/admin/products/new", icon: Plus },
        { label: "Categories", href: "/admin/categories", icon: FolderOpen },
      ],
    },
    {
      label: "Inventory",
      href: "/admin/inventory",
      icon: Boxes,
      children: [
        { label: "Dashboard", href: "/admin/inventory", icon: Boxes },
        { label: "Forecast", href: "/admin/inventory/forecast", icon: TrendingUp },
        { label: "Reports", href: "/admin/inventory/reports", icon: FileText },
      ],
    },
    {
      label: "Complete Looks",
      href: "/admin/looks",
      icon: Shirt,
      children: [
        { label: "All Looks", href: "/admin/looks", icon: Shirt },
        { label: "Create Look", href: "/admin/looks/new", icon: Plus },
      ],
    },
    {
      label: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
      badge: pendingOrdersCount ?? undefined,
      children: [
        { label: "All Orders", href: "/admin/orders", icon: ShoppingBag },
        { label: "Processing", href: "/admin/orders?status=pending", icon: PackageCheck },
        { label: "Completed", href: "/admin/orders?status=delivered", icon: CheckCircle },
        { label: "Returns", href: "/admin/orders?status=returned", icon: RotateCcw },
      ],
    },
    {
      label: "Customers",
      href: "/admin/customers",
      icon: Users,
      children: [
        { label: "All Customers", href: "/admin/customers", icon: Users },
        { label: "Customer Groups", href: "/admin/customers/groups", icon: Users },
      ],
    },
    {
      label: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      children: [
        { label: "Sales", href: "/admin/analytics/sales", icon: TrendingUp },
        { label: "Traffic", href: "/admin/analytics/traffic", icon: Eye },
        { label: "Products", href: "/admin/analytics/products", icon: Package },
      ],
    },
    {
      label: "Admin Users",
      href: "/admin/users",
      icon: UserCog,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  // Auto-expand parent items when a child is active
  React.useEffect(() => {
    navItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => {
          if (child.href === "/admin") {
            return pathname === "/admin";
          }
          return pathname.startsWith(child.href);
        });
        if (hasActiveChild) {
          setExpandedItems((prev) => {
            if (!prev.has(item.label)) {
              return new Set(prev).add(item.label);
            }
            return prev;
          });
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleExpanded = (label: string): void => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const isActive = (href: string): boolean => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem, level = 0): JSX.Element => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.label);
    const active = isActive(item.href);
    const hasActiveChild = hasChildren && item.children?.some((child) => isActive(child.href));
    const isItemActive = active || hasActiveChild;
    const Icon = item.icon;

    // Base padding: level 0 = 1rem, level 1+ = 1rem + (level * 0.75rem)
    const paddingLeft = level === 0 ? "1rem" : `${1 + level * 0.75}rem`;

    return (
      <div key={item.href} className="mb-0.5">
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleExpanded(item.label)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 text-left group relative",
                "text-sm font-medium",
                isItemActive
                  ? "bg-navy-600/90 text-white shadow-lg shadow-navy-500/20"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
              style={{ 
                paddingLeft,
                transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            >
              {/* Active state left border accent (3-4px) */}
              {isItemActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-navy-400 rounded-r-full" />
              )}
              
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                  isItemActive && "text-white"
                )} />
                <span className={cn(
                  "transition-opacity duration-300 truncate text-sm",
                  sidebarExpanded ? "opacity-100" : "opacity-0 w-0"
                )}>{item.label}</span>
                {item.badge && sidebarExpanded && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </div>
              
              {/* Arrow indicator - always show for parent items */}
              {sidebarExpanded && (
                <ChevronRight className={cn(
                  "w-4 h-4 flex-shrink-0 transition-transform duration-200 ml-2",
                  isExpanded && "rotate-90",
                  isItemActive ? "text-white" : "text-white/50"
                )} />
              )}
            </button>
            <AnimatePresence>
              {isExpanded && (
                <m.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="py-1">
                    {item.children?.map((child) => renderNavItem(child, level + 1))}
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative",
              "text-sm font-medium",
              active
                ? "bg-navy-600/90 text-white shadow-lg shadow-navy-500/20"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
            style={{ 
              paddingLeft,
              transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            {/* Active state left border accent (3-4px) */}
            {active && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-navy-400 rounded-r-full" />
            )}
            
            <Icon className={cn(
              "w-5 h-5 flex-shrink-0 transition-transform duration-200",
              active && "text-white"
            )} />
            <span className={cn(
              "transition-opacity duration-300 truncate text-sm",
              sidebarExpanded ? "opacity-100" : "opacity-0 w-0"
            )}>{item.label}</span>
            {item.badge && sidebarExpanded && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {item.badge}
              </span>
            )}
          </Link>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-charcoal-900/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <m.aside
        initial={false}
        animate={{
          width: isDesktop 
            ? (sidebarExpanded ? 250 : 80)
            : (isOpen ? '100%' : 0),
          x: isDesktop || isOpen ? 0 : "-100%",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 bg-[#0f0f0f] text-white flex flex-col",
          "border-r border-[rgba(255,255,255,0.08)] shadow-2xl",
          "lg:translate-x-0 overflow-hidden",
          "backdrop-blur-sm"
        )}
        style={{
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.12), 2px 0 8px rgba(0, 0, 0, 0.08)"
        }}
      >
        {/* Header */}
        <div className="admin-flex-md items-center justify-between admin-section-sm lg:admin-section-md border-b border-[rgba(255,255,255,0.1)] flex-shrink-0">
          {sidebarExpanded ? (
            <div className="admin-flex-sm items-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center shadow-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <AdminSidebarText className="font-bold text-white leading-tight">EXTREME</AdminSidebarText>
                <AdminCaption className="text-xs text-white/60 leading-tight normal-case">DEPT KIDZ</AdminCaption>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center shadow-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
          <button
            onClick={onToggle}
            className={cn(
              "p-[var(--admin-space-2)] text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 flex-shrink-0",
              "lg:hidden"
            )}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
          {sidebarExpanded && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "hidden lg:flex p-[var(--admin-space-2)] text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 flex-shrink-0",
              )}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {!sidebarExpanded && (
            <button
              onClick={() => setCollapsed(false)}
              className={cn(
                "hidden lg:flex p-[var(--admin-space-2)] text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 flex-shrink-0",
              )}
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {sidebarExpanded && (
          <div className="admin-section-sm px-[var(--admin-space-4)] flex-shrink-0">
            <AdminCaption className="text-xs font-semibold text-white/40">Menu</AdminCaption>
          </div>
        )}

        {/* Navigation */}
        {/* CRITICAL: Optimized scroll container with native momentum scrolling */}
        <nav 
          className="admin-scroll-container flex-1 px-[var(--admin-space-2)] py-[var(--admin-space-2)] admin-rhythm-sm"
          data-scroll-container
        >
          {navItems.map((item) => renderNavItem(item))}
        </nav>

        {/* User Section - Includes Sign Out button as backup */}
        {user && (
          <div className="admin-section-sm border-t border-[rgba(255,255,255,0.1)] flex-shrink-0">
            <div className={cn(
              "admin-flex-md items-center transition-opacity duration-300",
              sidebarExpanded ? "opacity-100" : "opacity-0"
            )}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              {sidebarExpanded && (
                <div className="flex-1 min-w-0">
                  <AdminSidebarText className="font-semibold text-white truncate">
                    {user.name}
                  </AdminSidebarText>
                  <AdminCaption className="text-xs text-white/60 truncate capitalize">
                    {user.role.replace("_", " ")}
                  </AdminCaption>
                </div>
              )}
            </div>
          </div>
        )}
      </m.aside>
    </>
  );
}
