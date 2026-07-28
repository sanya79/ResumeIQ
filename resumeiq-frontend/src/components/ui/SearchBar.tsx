import { type InputHTMLAttributes, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/utils/cn";

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange?: (value: string) => void;
  onClear?: () => void;
}

/** Search input with a leading icon and a clear button that appears once
 * there's a value — used for resume/candidate/job search across the app. */
export function SearchBar({ onChange, onClear, className, placeholder = "Search...", ...props }: SearchBarProps) {
  const [value, setValue] = useState((props.defaultValue as string) ?? "");

  return (
    <div className={cn("relative", className)}>
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-secondary" />
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange?.(e.target.value);
        }}
        className="h-11 w-full rounded-xl bg-white/[0.04] border border-surface-border pl-10 pr-9 text-sm text-foreground placeholder:text-foreground-secondary/60 transition-colors focus:border-accent-purple/60 focus:bg-white/[0.06]"
        {...props}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setValue("");
            onChange?.("");
            onClear?.();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
