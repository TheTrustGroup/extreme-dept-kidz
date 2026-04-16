import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  density?: "default" | "compact";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, density = "default", type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "w-full border transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
          density === "compact"
            ? [
                "h-control-compact rounded-compact px-compact-4",
                "bg-compact-bg-surface text-compact-text-primary border-compact-border",
                "placeholder:text-compact-text-muted",
                "text-compact-md leading-compact-normal",
                "focus-visible:ring-compact-focus-ring/20 focus-visible:border-compact-focus-ring",
              ]
            : [
                "h-11 rounded-input px-4",
                "bg-white text-charcoal-900 border-charcoal-200",
                "placeholder:text-charcoal-400",
                "text-sm leading-6",
                "focus-visible:ring-navy-500/20 focus-visible:border-navy-500",
              ],
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
