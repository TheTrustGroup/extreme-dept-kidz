"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
  helperText?: string;
}

export function FloatingInput({
  label,
  error,
  success,
  helperText,
  className,
  ...props
}: FloatingInputProps): JSX.Element {
  const [focused, setFocused] = React.useState(false);
  const hasValue = Boolean(props.value || props.defaultValue);

  return (
    <div className="relative">
      <div className="relative">
        <input
          {...props}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          className={cn(
            "peer w-full px-4 pt-6 pb-2 text-sm bg-white border rounded-lg",
            "focus:outline-none focus:ring-2 transition-all duration-200",
            "placeholder-transparent",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : success
              ? "border-green-300 focus:border-green-500 focus:ring-green-500"
              : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500",
            className
          )}
          placeholder={label}
        />
        <label
          className={cn(
            "absolute left-4 transition-all duration-200 pointer-events-none",
            focused || hasValue
              ? "top-2 text-xs font-medium"
              : "top-4 text-sm text-gray-500",
            error
              ? "text-red-600"
              : success
              ? "text-green-600"
              : focused
              ? "text-indigo-600"
              : "text-gray-500"
          )}
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {success && !error && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
        )}
        {error && (
          <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
        )}
      </div>
      {(error || helperText) && (
        <p
          className={cn(
            "mt-1.5 text-xs",
            error ? "text-red-600" : "text-gray-500"
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}

interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  success?: boolean;
  helperText?: string;
}

export function FloatingTextarea({
  label,
  error,
  success,
  helperText,
  className,
  ...props
}: FloatingTextareaProps): JSX.Element {
  const [focused, setFocused] = React.useState(false);
  const hasValue = Boolean(props.value || props.defaultValue);

  return (
    <div className="relative">
      <div className="relative">
        <textarea
          {...props}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          className={cn(
            "peer w-full px-4 pt-6 pb-2 text-sm bg-white border rounded-lg resize-none",
            "focus:outline-none focus:ring-2 transition-all duration-200",
            "placeholder-transparent",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : success
              ? "border-green-300 focus:border-green-500 focus:ring-green-500"
              : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500",
            className
          )}
          placeholder={label}
        />
        <label
          className={cn(
            "absolute left-4 transition-all duration-200 pointer-events-none",
            focused || hasValue
              ? "top-2 text-xs font-medium"
              : "top-4 text-sm text-gray-500",
            error
              ? "text-red-600"
              : success
              ? "text-green-600"
              : focused
              ? "text-indigo-600"
              : "text-gray-500"
          )}
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {success && !error && (
          <CheckCircle2 className="absolute right-3 top-4 w-5 h-5 text-green-500" />
        )}
        {error && (
          <XCircle className="absolute right-3 top-4 w-5 h-5 text-red-500" />
        )}
      </div>
      {(error || helperText) && (
        <p
          className={cn(
            "mt-1.5 text-xs",
            error ? "text-red-600" : "text-gray-500"
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}
