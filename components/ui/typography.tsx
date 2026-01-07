import * as React from "react";
import { cn } from "@/lib/utils";

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  variant?: "h1" | "h2" | "h3" | "h4" | "body" | "caption";
  serif?: boolean;
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  (
    { className, as, variant = "body", serif = false, children, ...props },
    ref
  ) => {
    const Component = as || getDefaultElement(variant);

    const variants = {
      h1: "font-serif text-display-2xl font-bold text-charcoal-900 tracking-tight",
      h2: "font-serif text-display-xl font-semibold text-charcoal-900 tracking-tight",
      h3: "font-serif text-display-lg font-semibold text-charcoal-900 tracking-tight",
      h4: "font-serif text-display-md font-medium text-charcoal-800 tracking-tight",
      body: "font-sans text-base text-charcoal-700 leading-relaxed",
      caption:
        "font-sans text-sm text-charcoal-600 leading-normal uppercase tracking-wider",
    };

    const serifOverride = serif ? "font-serif" : "";

    return (
      <Component
        className={cn(variants[variant], serifOverride, className)}
        ref={ref as React.Ref<HTMLElement>}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = "Typography";

function getDefaultElement(variant: TypographyProps["variant"]): string {
  switch (variant) {
    case "h1":
      return "h1";
    case "h2":
      return "h2";
    case "h3":
      return "h3";
    case "h4":
      return "h4";
    case "caption":
      return "span";
    default:
      return "p";
  }
}

// Convenience components for common typography patterns
// These provide better type safety than using Typography directly
export const H1 = React.forwardRef<
  HTMLHeadingElement,
  Omit<React.HTMLAttributes<HTMLHeadingElement>, "as">
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn(
      "font-serif text-display-2xl font-bold tracking-tight text-charcoal-900",
      className
    )}
    {...props}
  />
));
H1.displayName = "H1";

export const H2 = React.forwardRef<
  HTMLHeadingElement,
  Omit<React.HTMLAttributes<HTMLHeadingElement>, "as">
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "font-serif text-display-xl font-semibold tracking-tight text-charcoal-900",
      className
    )}
    {...props}
  />
));
H2.displayName = "H2";

export const H3 = React.forwardRef<
  HTMLHeadingElement,
  Omit<React.HTMLAttributes<HTMLHeadingElement>, "as">
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-serif text-display-lg font-semibold tracking-tight text-charcoal-900",
      className
    )}
    {...props}
  />
));
H3.displayName = "H3";

export const H4 = React.forwardRef<
  HTMLHeadingElement,
  Omit<React.HTMLAttributes<HTMLHeadingElement>, "as">
>(({ className, ...props }, ref) => (
  <h4
    ref={ref}
    className={cn(
      "font-serif text-display-md font-medium tracking-tight text-charcoal-800",
      className
    )}
    {...props}
  />
));
H4.displayName = "H4";

export const Body = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "font-sans text-base leading-relaxed text-charcoal-700",
      className
    )}
    {...props}
  />
));
Body.displayName = "Body";

export const Caption = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "font-sans text-sm uppercase leading-normal tracking-wider text-charcoal-600",
      className
    )}
    {...props}
  />
));
Caption.displayName = "Caption";
