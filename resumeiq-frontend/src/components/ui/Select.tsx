import { forwardRef, type SelectHTMLAttributes, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

/** Native <select> styled to match the design system — chosen over a custom
 * listbox for full keyboard/screen-reader support without extra deps. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, id, className, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-foreground-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            defaultValue={props.defaultValue ?? ""}
            className={cn(
              "h-11 w-full appearance-none rounded-xl bg-white/[0.04] border border-surface-border pl-4 pr-10 text-sm text-foreground",
              "transition-colors focus:border-accent-purple/60 focus:bg-white/[0.06]",
              error && "border-danger/60",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-background-secondary">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground-secondary" />
        </div>
        {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
