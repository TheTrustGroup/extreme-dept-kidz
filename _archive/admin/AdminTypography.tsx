import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Admin Typography System
 * 
 * Professional typography system for admin dashboard:
 * - Primary Font: Inter, system-ui, -apple-system, BlinkMacSystemFont
 * - Headings: font-weight 600-700, letter-spacing -0.01em
 * - Body: font-weight 400-500, line-height 1.55-1.7
 */

export interface AdminTypographyProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

// Admin Heading Components
export const AdminH1 = React.forwardRef<
  HTMLHeadingElement,
  Omit<React.HTMLAttributes<HTMLHeadingElement>, "as">
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn(
      "font-sans text-2xl sm:text-3xl font-bold tracking-[-0.01em] text-charcoal-900",
      "font-[Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif]",
      className
    )}
    style={{ fontWeight: 700, letterSpacing: '-0.01em' }}
    {...props}
  />
));
AdminH1.displayName = "AdminH1";

export const AdminH2 = React.forwardRef<
  HTMLHeadingElement,
  Omit<React.HTMLAttributes<HTMLHeadingElement>, "as">
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "font-sans text-xl sm:text-2xl font-semibold tracking-[-0.01em] text-charcoal-900",
      "font-[Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif]",
      className
    )}
    style={{ fontWeight: 600, letterSpacing: '-0.01em' }}
    {...props}
  />
));
AdminH2.displayName = "AdminH2";

export const AdminH3 = React.forwardRef<
  HTMLHeadingElement,
  Omit<React.HTMLAttributes<HTMLHeadingElement>, "as">
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-sans text-lg sm:text-xl font-semibold tracking-[-0.01em] text-charcoal-900",
      "font-[Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif]",
      className
    )}
    style={{ fontWeight: 600, letterSpacing: '-0.01em' }}
    {...props}
  />
));
AdminH3.displayName = "AdminH3";

export const AdminH4 = React.forwardRef<
  HTMLHeadingElement,
  Omit<React.HTMLAttributes<HTMLHeadingElement>, "as">
>(({ className, ...props }, ref) => (
  <h4
    ref={ref}
    className={cn(
      "font-sans text-base sm:text-lg font-semibold tracking-[-0.01em] text-charcoal-900",
      "font-[Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif]",
      className
    )}
    style={{ fontWeight: 600, letterSpacing: '-0.01em' }}
    {...props}
  />
));
AdminH4.displayName = "AdminH4";

// Admin Body Components
export const AdminBody = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "font-sans text-base text-charcoal-700",
      "font-[Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif]",
      className
    )}
    style={{ fontWeight: 400, lineHeight: '1.6' }}
    {...props}
  />
));
AdminBody.displayName = "AdminBody";

export const AdminBodyMedium = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "font-sans text-base text-charcoal-700",
      "font-[Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif]",
      className
    )}
    style={{ fontWeight: 500, lineHeight: '1.65' }}
    {...props}
  />
));
AdminBodyMedium.displayName = "AdminBodyMedium";

export const AdminBodySmall = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "font-sans text-sm text-charcoal-600",
      "font-[Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif]",
      className
    )}
    style={{ fontWeight: 400, lineHeight: '1.55' }}
    {...props}
  />
));
AdminBodySmall.displayName = "AdminBodySmall";

// Admin Caption Component
export const AdminCaption = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "font-sans text-xs text-charcoal-600 uppercase tracking-wider",
      "font-[Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif]",
      className
    )}
    style={{ fontWeight: 500 }}
    {...props}
  />
));
AdminCaption.displayName = "AdminCaption";

// Admin Table Text Component
export const AdminTableText = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "font-sans text-charcoal-900",
      "font-[Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif]",
      className
    )}
    style={{ fontSize: '0.875rem', fontWeight: 400, lineHeight: '1.5' }}
    {...props}
  />
));
AdminTableText.displayName = "AdminTableText";

// Admin Sidebar Text Component
export const AdminSidebarText = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "font-sans text-charcoal-700",
      "font-[Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif]",
      className
    )}
    style={{ fontSize: '0.9rem', fontWeight: 500, lineHeight: '1.5' }}
    {...props}
  />
));
AdminSidebarText.displayName = "AdminSidebarText";
