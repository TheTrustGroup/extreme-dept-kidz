import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClassValue } from "clsx";

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "asChild"> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  loadingText?: string;
  asChild?: boolean;
}

/**
 * Button Component
 * 
 * Refactored to match Figma design system specifications:
 * - Typography: Inter, Semibold, Uppercase, 0.5px letter-spacing
 * - Primary: Navy 900 background, Cream 50 text
 * - Secondary: Transparent with Navy 900 border
 * - Ghost: Transparent with hover background
 * - Animations: 200ms hover, 100ms active (per motion guidelines)
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      children,
      disabled,
      loading = false,
      loadingText,
      asChild = false,
      ...props
    },
    ref
  ) => {
    // Base styles: typography, transitions, accessibility
    const baseStyles = cn(
      // Layout
      "inline-flex items-center justify-center",
      // Typography (Design System: Button Text)
      "font-sans font-semibold uppercase tracking-wide",
      // Shape
      "rounded-lg",
      // Transitions (Motion Guidelines: 200ms hover, 100ms active)
      "transition-all duration-200 ease-in-out",
      // Focus & Accessibility
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      // Touch targets (minimum 44px for mobile)
      "min-h-[44px] touch-manipulation",
      // Disabled state
      "disabled:pointer-events-none"
    );

    // Variant styles (Design System: Button Styles)
    const variants = {
      primary: cn(
        "bg-navy-900 text-cream-50",
        "hover:bg-navy-800 hover:scale-[1.02] hover:shadow-navy",
        "transition-all duration-normal ease-in-out",
        "active:bg-navy-950 active:scale-[0.98] active:transition-all active:duration-100",
        // Focus ring
        "focus-visible:ring-navy-500",
        // Disabled state (Design System: Charcoal 200 bg, Charcoal 400 text, 0.5 opacity)
        "disabled:bg-charcoal-200 disabled:text-charcoal-400 disabled:opacity-50"
      ),
      secondary: cn(
        // Default state (Design System: Transparent with Navy 900 border)
        "bg-transparent border-2 border-navy-900 text-navy-900",
        // Hover state (Design System: Navy 900 bg, Cream 50 text)
        "hover:bg-navy-900 hover:text-cream-50 hover:scale-[1.02]",
        // Active state
        "active:scale-[0.98] active:transition-all active:duration-100",
        // Focus ring
        "focus-visible:ring-navy-500",
        // Disabled state
        "disabled:border-charcoal-200 disabled:text-charcoal-400 disabled:opacity-50"
      ),
      ghost: cn(
        // Default state (Design System: Transparent, Charcoal 900 text)
        "bg-transparent text-charcoal-900",
        // Hover state (Design System: Cream 200 background)
        "hover:bg-cream-200 hover:text-charcoal-900",
        // Active state
        "active:bg-cream-300 active:scale-[0.98] active:transition-all active:duration-100",
        // Focus ring
        "focus-visible:ring-charcoal-500",
        // Disabled state
        "disabled:text-charcoal-400 disabled:opacity-50"
      ),
    };

    // Size styles (Design System: Small 40px, Medium 48px, Large 56px)
    const sizes = {
      sm: cn(
        "h-10 min-h-[44px] px-5 text-sm", // 40px height, 14px text
        "xs:px-6" // Slightly more padding on larger mobile
      ),
      md: cn(
        "h-12 min-h-[48px] px-8 py-4 text-base", // 48px height, 16px text, 16px 32px padding
        "xs:text-base" // Consistent 16px on mobile
      ),
      lg: cn(
        "h-14 min-h-[56px] px-10 py-5 text-lg", // 56px height, 18px text, 20px 40px padding
        "xs:text-lg" // Consistent 18px on mobile
      ),
    };

    const isDisabled = disabled || loading;
    const classes = cn(baseStyles, variants[variant], sizes[size], className);

    if (asChild && React.isValidElement(children)) {
      const childProps = (children as React.ReactElement<Record<string, unknown>>).props;
      const childClassName = childProps.className as ClassValue | undefined;
      return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        className: cn(classes, childClassName),
        disabled: isDisabled,
        ...props,
      });
    }

    return (
      <button
        className={classes}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2 
            className="w-4 h-4 mr-2 animate-spin" 
            aria-hidden="true"
            aria-label="Loading"
          />
        )}
        {loading ? loadingText || children : children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
