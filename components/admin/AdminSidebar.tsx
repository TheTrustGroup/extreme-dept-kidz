"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
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
                "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-left",
                active
                  ? "bg-navy-900 text-cream-50"
                  : "text-charcoal-700 hover:bg-cream-100"
              )}
              style={{ paddingLeft: `${level * 1 + 1}rem` }}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-cream-50 text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
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
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              active
                ? "bg-navy-900 text-cream-50"
                : "text-charcoal-700 hover:bg-cream-100"
            )}
            style={{ paddingLeft: `${level * 1 + 1}rem` }}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className="ml-auto bg-red-500 text-cream-50 text-xs font-bold px-2 py-0.5 rounded-full">
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
          x: isOpen ? 0 : "-100%",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-navy-900 text-cream-50 flex flex-col shadow-xl lg:shadow-none",
          "lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-navy-800">
          <div className="flex items-center gap-3">
            <Image
              src="/IMG_8640.PNG"
              alt="EXTREME DEPT KIDZ"
              width={120}
              height={24}
              className="h-6 w-auto object-contain"
            />
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden text-cream-50 hover:text-cream-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-2 py-2 text-xs font-semibold text-cream-100/60 uppercase tracking-wider">
          Admin Panel
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          {navItems.map((item) => renderNavItem(item))}
        </nav>

        {/* User Section */}
        {user && (
          <div className="border-t border-navy-800 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center">
                <span className="text-cream-50 font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-cream-50 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-cream-100/60 truncate">
                  {user.role.replace("_", " ")}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-cream-50 hover:bg-navy-800 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </m.aside>
    </>
  );
}
