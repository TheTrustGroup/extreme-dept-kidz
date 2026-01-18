import * as React from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  as?: React.ElementType;
}

/**
 * Container Component
 * 
 * Refactored to match Figma design system specifications:
 * - Max-width: 1280px (lg size) - Design System standard
 * - Padding: 16px (mobile), 24px (tablet), 32px (desktop)
 * - Centered with auto margins
 */
const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "lg", as, children, ...props }, ref) => {
    const Component = as || "div";

    // Size variants (Design System: 1280px max-width for standard sections)
    const sizes = {
      sm: "max-w-2xl", // 672px - Narrow content
      md: "max-w-4xl", // 896px - Medium content
      lg: "max-w-[1280px]", // 1280px - Design System standard (was max-w-6xl)
      xl: "max-w-7xl", // 1280px - Same as lg but using Tailwind class
      full: "max-w-full", // Full width
    };

    // Base styles (Design System: Padding 16px mobile, 24px tablet, 32px desktop)
    const baseStyles = cn(
      "mx-auto w-full",
      // Padding (Design System: 16px mobile, 24px tablet, 32px desktop)
      "px-4", // 16px mobile
      "md:px-6", // 24px tablet
      "lg:px-8" // 32px desktop
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

