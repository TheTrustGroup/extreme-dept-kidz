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
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      primary:
        "bg-navy-900 text-cream-50 hover:bg-navy-800 hover:shadow-md active:bg-navy-950 focus-visible:ring-navy-500",
      secondary:
        "bg-forest-600 text-cream-50 hover:bg-forest-700 hover:shadow-md active:bg-forest-800 focus-visible:ring-forest-500",
      ghost:
        "bg-transparent text-charcoal-900 hover:bg-charcoal-100 hover:text-charcoal-950 active:bg-charcoal-200 focus-visible:ring-charcoal-500",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-10 xs:h-11 px-5 xs:px-6 text-sm xs:text-base",
      lg: "h-12 xs:h-14 px-7 xs:px-8 text-base xs:text-lg",
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
          <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
        )}
        {loading ? loadingText || children : children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
