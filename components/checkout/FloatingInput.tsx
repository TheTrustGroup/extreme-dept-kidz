"use client";

import { useState, useId } from "react";

interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export default function FloatingInput({
  label,
  error,
  hint,
  className = "",
  ...props
}: FloatingInputProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const hasValue = Boolean(props.value || props.defaultValue);
  const floated = focused || hasValue;

  return (
    <div className={["floating-field", className].join(" ")}>
      <div
        className={[
          "floating-field__wrap",
          error ? "floating-field__wrap--error" : "",
          focused ? "floating-field__wrap--focused" : "",
        ].join(" ")}
      >
        <input
          id={id}
          className="floating-field__input"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          aria-invalid={!!error}
          {...props}
        />
        <label
          htmlFor={id}
          className={[
            "floating-field__label",
            floated ? "floating-field__label--floated" : "",
          ].join(" ")}
        >
          {label}
          {props.required && (
            <span className="floating-field__required" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} className="floating-field__error" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="floating-field__hint">
          {hint}
        </p>
      )}
    </div>
  );
}
