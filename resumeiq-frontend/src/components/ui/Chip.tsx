import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  selected?: boolean;
  onRemove?: () => void;
}

/** Interactive/removable tag — for skill filters, selected filters, etc.
 * Differs from Badge (static label) by being clickable/dismissible. */
export function Chip({ children, selected = false, onRemove, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
        selected
          ? "bg-accent-purple/15 border-accent-purple/40 text-foreground"
          : "bg-white/[0.04] border-surface-border text-foreground-secondary hover:text-foreground hover:bg-white/[0.07]",
        className
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <X
          size={13}
          className="opacity-60 hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        />
      )}
    </button>
  );
}
