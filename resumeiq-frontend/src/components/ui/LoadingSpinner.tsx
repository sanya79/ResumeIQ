import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

/** Standard loading indicator for async/query states across the app. */
export function LoadingSpinner({ size = 20, className, label }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center gap-2 text-muted", className)}>
      <Loader2 size={size} className="animate-spin text-accent-cyan" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
