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
  Sparkles,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAdminAuth } from "@/lib/stores/admin-auth-store";
import { cn } from "@/lib/utils";

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
  const { user, logout } = useAdminAuth();
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = React.useState(false);
  
  // On desktop, use collapsed state; on mobile, use isOpen
  const sidebarExpanded = typeof window !== 'undefined' && window.innerWidth >= 1024 
    ? !collapsed 
    : isOpen;

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
      children: [
        { label: "All Products", href: "/admin/products", icon: Package },
        { label: "Add New", href: "/admin/products/new", icon: Package },
        { label: "Categories", href: "/admin/categories", icon: Package },
        { label: "Inventory", href: "/admin/inventory", icon: Package },
      ],
    },
    {
      label: "Complete Looks",
      href: "/admin/looks",
      icon: Sparkles,
      children: [
        { label: "All Looks", href: "/admin/looks", icon: Sparkles },
        { label: "Create Look", href: "/admin/looks/new", icon: Sparkles },
      ],
    },
    {
      label: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
      badge: 12, // Pending orders count
      children: [
        { label: "All Orders", href: "/admin/orders", icon: ShoppingBag },
        { label: "Pending", href: "/admin/orders?status=pending", icon: ShoppingBag },
        { label: "Shipped", href: "/admin/orders?status=shipped", icon: ShoppingBag },
        { label: "Delivered", href: "/admin/orders?status=delivered", icon: ShoppingBag },
      ],
    },
    {
      label: "Customers",
      href: "/admin/customers",
      icon: Users,
    },
    {
      label: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

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
    const Icon = item.icon;

    return (
      <div key={item.href}>
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleExpanded(item.label)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 text-left group",
                active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
              style={{ paddingLeft: `${level * 1 + 1}rem` }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                  active && "scale-110"
                )} />
                <span className={cn(
                  "font-medium transition-opacity duration-300 truncate",
                  sidebarExpanded ? "opacity-100" : "opacity-0 w-0"
                )}>{item.label}</span>
                {item.badge && sidebarExpanded && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              {sidebarExpanded && (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform duration-200" />
                ) : (
                  <ChevronRight className="w-4 h-4 flex-shrink-0 transition-transform duration-200" />
                )
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
              active
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
            style={{ paddingLeft: `${level * 1 + 1}rem` }}
          >
            {active && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-400 rounded-r-full" />
            )}
            <Icon className={cn(
              "w-5 h-5 flex-shrink-0 transition-transform duration-200",
              active && "scale-110"
            )} />
            <span className={cn(
              "font-medium transition-opacity duration-300 truncate",
              sidebarExpanded ? "opacity-100" : "opacity-0 w-0"
            )}>{item.label}</span>
            {item.badge && sidebarExpanded && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
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
          width: sidebarExpanded ? 250 : 80,
          x: isOpen ? 0 : "-100%",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 bg-[#0f0f0f] text-white flex flex-col",
          "border-r border-[rgba(255,255,255,0.1)] shadow-2xl",
          "lg:translate-x-0 overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-[rgba(255,255,255,0.1)]">
          {sidebarExpanded ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white leading-tight">EXTREME</h2>
                <p className="text-xs text-white/60 leading-tight">DEPT KIDZ</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
          <button
            onClick={onToggle}
            className={cn(
              "p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200",
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
                "hidden lg:flex p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200",
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
                "hidden lg:flex p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200",
              )}
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {sidebarExpanded && (
          <div className="px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">
            Menu
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {navItems.map((item) => renderNavItem(item))}
        </nav>

        {/* User Section */}
        {user && (
          <div className="border-t border-[rgba(255,255,255,0.1)] p-4">
            <div className={cn(
              "flex items-center gap-3 mb-3 transition-opacity duration-300",
              sidebarExpanded ? "opacity-100" : "opacity-0"
            )}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              {sidebarExpanded && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-white/60 truncate capitalize">
                    {user.role.replace("_", " ")}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={logout}
              className={cn(
                "w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 text-sm font-medium",
                "group"
              )}
            >
              <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              {sidebarExpanded && <span>Logout</span>}
            </button>
          </div>
        )}
      </m.aside>
    </>
  );
}
