import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

/** Base text input. Handles its own label/error/hint wiring via aria-*
 * attributes so every consumer gets accessible markup for free. */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, id, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-foreground-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-secondary">{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={cn(
              "h-11 w-full rounded-xl bg-white/[0.04] border border-surface-border px-4 text-sm text-foreground placeholder:text-foreground-secondary/60",
              "transition-colors focus:border-accent-purple/60 focus:bg-white/[0.06]",
              icon && "pl-10",
              error && "border-danger/60",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-danger">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-foreground-secondary">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
