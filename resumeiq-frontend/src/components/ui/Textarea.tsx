import { forwardRef, type TextareaHTMLAttributes, useId } from "react";
import { cn } from "@/utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, id, className, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const areaId = id ?? generatedId;
    const describedBy = error ? `${areaId}-error` : hint ? `${areaId}-hint` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={areaId} className="mb-1.5 block text-sm font-medium text-foreground-secondary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            "w-full rounded-xl bg-white/[0.04] border border-surface-border px-4 py-3 text-sm text-foreground placeholder:text-foreground-secondary/60 resize-y",
            "transition-colors focus:border-accent-purple/60 focus:bg-white/[0.06]",
            error && "border-danger/60",
            className
          )}
          {...props}
        />
        {error && (
          <p id={`${areaId}-error`} className="mt-1.5 text-xs text-danger">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${areaId}-hint`} className="mt-1.5 text-xs text-foreground-secondary">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
