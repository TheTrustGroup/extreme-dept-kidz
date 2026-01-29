"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminBreadcrumbContext } from "./AdminBreadcrumbContext";

interface AdminBreadcrumbProps {
  /** Custom label overrides for specific paths */
  customLabels?: Record<string, string>;
  /** Generate structured data for SEO */
  generateStructuredData?: boolean;
  className?: string;
}

interface BreadcrumbItem {
  label: string;
  href: string;
  isLast: boolean;
}

/**
 * Admin Breadcrumb Component
 * 
 * Intelligent breadcrumb navigation for admin pages.
 * - Positioned below header, above page title
 * - Home icon before Dashboard
 * - Light gray for inactive, darker for current page
 * - Mobile optimized (shows only last 2 levels on small screens)
 * - Includes back button alternative on mobile
 */
export function AdminBreadcrumb({
  customLabels = {},
  generateStructuredData = true,
  className,
}: AdminBreadcrumbProps): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const context = React.useContext(AdminBreadcrumbContext);
  const dynamicLabels = context?.dynamicLabels || {};

  // Breadcrumb mapping for special routes
  const routeLabels: Record<string, string> = {
    admin: "Dashboard",
    products: "Products",
    orders: "Orders",
    customers: "Customers",
    categories: "Categories",
    inventory: "Inventory",
    analytics: "Analytics",
    settings: "Settings",
    users: "Admin Users",
    activity: "Activity Log",
    looks: "Complete Looks",
    collections: "Collections",
    pricing: "Pricing",
    reports: "Reports",
    forecast: "Forecast",
    sales: "Sales",
    traffic: "Traffic",
    new: "Add New",
    edit: "Edit",
    view: "View",
    ...customLabels,
  };

  // Generate breadcrumbs from pathname
  const breadcrumbs = React.useMemo((): BreadcrumbItem[] => {
    const parts = pathname.split("/").filter(Boolean);
    const crumbs: BreadcrumbItem[] = [];

    // Always start with Dashboard
    crumbs.push({
      label: "Dashboard",
      href: "/admin",
      isLast: parts.length === 1,
    });

    // Build breadcrumbs from path parts
    let currentPath = "/admin";
    parts.slice(1).forEach((part, index) => {
      currentPath += `/${part}`;
      const isLast = index === parts.length - 2;

      // Check for dynamic labels first (e.g., product names, order numbers)
      if (dynamicLabels[currentPath]) {
        crumbs.push({
          label: dynamicLabels[currentPath],
          href: currentPath,
          isLast,
        });
        return;
      }

      // Check for custom labels
      if (customLabels[part]) {
        crumbs.push({
          label: customLabels[part],
          href: currentPath,
          isLast,
        });
        return;
      }

      // Handle special cases
      if (part === "new" && index > 0) {
        // Determine parent context (previous part in the sliced array)
        const parent = parts[index - 1];
        const parentLabel = routeLabels[parent] || parent;
        // Remove 's' from plural if it ends with 's'
        const singularLabel = parentLabel.endsWith('s') ? parentLabel.slice(0, -1) : parentLabel;
        crumbs.push({
          label: `Add New ${singularLabel}`,
          href: currentPath,
          isLast,
        });
        return;
      }

      if (part === "edit" && index > 0) {
        // Check if previous part is an ID - if so, go back one more to get the parent
        const prevPart = parts[index - 1];
        let parent = prevPart;
        
        // If previous part looks like an ID, get the parent before that
        const isPrevPartId = /^[a-f0-9-]{36}$/i.test(prevPart) || 
          (prevPart.length > 15 && /^[a-z0-9-]+$/i.test(prevPart)) ||
          (prevPart.includes('-') && prevPart.length > 10);
        
        if (isPrevPartId && index > 1) {
          parent = parts[index - 2];
        }
        
        const parentLabel = routeLabels[parent] || parent;
        // Remove 's' from plural if it ends with 's'
        const singularLabel = parentLabel.endsWith('s') ? parentLabel.slice(0, -1) : parentLabel;
        crumbs.push({
          label: `Edit ${singularLabel}`,
          href: currentPath,
          isLast,
        });
        return;
      }

      // Handle ID-based routes (show as "View" or use dynamic label)
      // Check if part looks like an ID (UUID, long alphanumeric, or has hyphens)
      const isLikelyId = index > 0 && (
        /^[a-f0-9-]{36}$/i.test(part) || // UUID format
        (part.length > 15 && /^[a-z0-9-]+$/i.test(part)) || // Long alphanumeric
        (part.includes('-') && part.length > 10) // Has hyphens and is reasonably long
      ) && !routeLabels[part];

      if (isLikelyId) {
        // Likely an ID - check if we have a dynamic label
        if (dynamicLabels[currentPath]) {
          crumbs.push({
            label: dynamicLabels[currentPath],
            href: currentPath,
            isLast,
          });
        } else {
          // Default to "View" for ID routes
          const parent = parts[index - 1];
          const parentLabel = routeLabels[parent] || parent;
          // Remove 's' from plural if it ends with 's'
          const singularLabel = parentLabel.endsWith('s') ? parentLabel.slice(0, -1) : parentLabel;
          crumbs.push({
            label: `View ${singularLabel}`,
            href: currentPath,
            isLast,
          });
        }
        return;
      }

      // Use route label or format the part
      const label = routeLabels[part] || part
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      crumbs.push({
        label,
        href: currentPath,
        isLast,
      });
    });

    return crumbs;
  }, [pathname, customLabels, dynamicLabels]);

  // Mobile: Show only last 2 levels
  const mobileBreadcrumbs = React.useMemo(() => {
    if (breadcrumbs.length <= 2) return breadcrumbs;
    return [
      breadcrumbs[0], // Dashboard
      ...breadcrumbs.slice(-1), // Last item
    ];
  }, [breadcrumbs]);

  // Generate structured data for SEO
  const structuredData = React.useMemo(() => {
    if (!generateStructuredData) return null;

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.label,
        item: `https://extremedeptkidz.com${crumb.href}`,
      })),
    };
  }, [breadcrumbs, generateStructuredData]);

  // Truncate long labels
  const truncateLabel = (label: string, maxLength: number = 30): string => {
    if (label.length <= maxLength) return label;
    return `${label.substring(0, maxLength - 3)}...`;
  };

  if (breadcrumbs.length <= 1) {
    return <></>; // Don't show breadcrumb on dashboard itself
  }

  return (
    <>
      {/* Structured Data for SEO */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      <nav
        className={cn(
          "mb-4 sm:mb-6",
          className
        )}
        aria-label="Breadcrumb"
      >
        {/* Desktop Breadcrumb */}
        <ol className="hidden sm:flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center gap-2">
              {index === 0 ? (
                <Link
                  href={crumb.href}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>{crumb.label}</span>
                </Link>
              ) : crumb.isLast ? (
                <span className="text-gray-900 font-medium" aria-current="page">
                  {truncateLabel(crumb.label, 40)}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {truncateLabel(crumb.label, 30)}
                </Link>
              )}
              {!crumb.isLast && (
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
              )}
            </li>
          ))}
        </ol>

        {/* Mobile Breadcrumb */}
        <div className="flex sm:hidden items-center gap-2">
          {breadcrumbs.length > 2 && (
            <button
              onClick={() => router.back()}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              aria-label="Go back"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          )}
          <ol className="flex items-center gap-2 text-sm">
            {mobileBreadcrumbs.map((crumb, index) => (
              <li key={crumb.href} className="flex items-center gap-2">
                {index === 0 ? (
                  <Link
                    href={crumb.href}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[100px]">{crumb.label}</span>
                  </Link>
                ) : crumb.isLast ? (
                  <span className="text-gray-900 font-medium truncate max-w-[150px]" aria-current="page">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-gray-500 hover:text-gray-700 transition-colors truncate max-w-[100px]"
                  >
                    {crumb.label}
                  </Link>
                )}
                {!crumb.isLast && (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  );
}
