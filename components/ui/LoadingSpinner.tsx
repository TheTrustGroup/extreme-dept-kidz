import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Optional text below spinner */
  text?: string;
}

/**
 * Professional loading spinner – CSS-only, no icon dependency.
 * Use in loading.tsx or inline loading states.
 */
export default function LoadingSpinner({
  size = "md",
  className,
  text,
}: LoadingSpinnerProps): JSX.Element {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className="flex justify-center items-center">
        <div
          className={cn(
            sizeClasses[size],
            "border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"
          )}
          aria-label="Loading"
        />
      </div>
      {text && (
        <p className="text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
}

export { LoadingSpinner };
