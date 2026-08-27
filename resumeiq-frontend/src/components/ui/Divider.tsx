import { cn } from "@/utils/cn";

interface DividerProps {
  orientation?: "horizontal" | "vertical";
  label?: string;
  className?: string;
}

/** Hairline separator, with an optional centered label ("or continue with"). */
export function Divider({ orientation = "horizontal", label, className }: DividerProps) {
  if (orientation === "vertical") {
    return <div role="separator" aria-orientation="vertical" className={cn("w-px self-stretch bg-surface-border", className)} />;
  }

  if (label) {
    return (
      <div className={cn("flex items-center gap-3 text-xs text-foreground-secondary", className)}>
        <span className="h-px flex-1 bg-surface-border" />
        {label}
        <span className="h-px flex-1 bg-surface-border" />
      </div>
    );
  }

  return <hr className={cn("border-t border-surface-border", className)} />;
}
