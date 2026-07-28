import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

/** Recoverable error placeholder — for failed queries/mutations. */
export function ErrorState({
  title = "Something went wrong",
  description = "That request didn't go through. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-danger/20 bg-danger/[0.04] py-16 px-6 text-center">
      <div className="rounded-full bg-danger/10 p-3 text-danger">
        <AlertTriangle size={22} />
      </div>
      <h3 className="text-fluid-base font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-foreground-secondary">{description}</p>
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  );
}
