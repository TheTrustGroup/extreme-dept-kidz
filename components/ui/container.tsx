import * as React from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  as?: React.ElementType;
}

/**
 * Container — PHASE 2: Mobile-first, precise spacing, zero overlap.
 * Max-width 1280px (lg). Intentional padding: 16px → 24px → 32px.
 */
const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "lg", as, children, ...props }, ref) => {
    const Component = as || "div";

    const sizes = {
      sm: "max-w-2xl",
      md: "max-w-4xl",
      lg: "max-w-[1280px]",
      xl: "max-w-7xl",
      full: "max-w-full",
    };

    const baseStyles = cn(
      "mx-auto w-full",
      "px-[var(--space-inline,1rem)]",
      "md:px-[var(--space-block,1.5rem)]",
      "lg:px-8"
    );

    return (
      <Component
        className={cn(baseStyles, sizes[size], className)}
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Container.displayName = "Container";

export { Container };

