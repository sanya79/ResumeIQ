import { type ReactNode } from "react";
import { Inbox } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

/** Placeholder for zero-data states (no resumes yet, no matches yet, etc.). */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-surface-border py-16 px-6 text-center">
      <div className="rounded-full bg-white/[0.05] p-3 text-foreground-secondary">
        {icon ?? <Inbox size={22} />}
      </div>
      <h3 className="text-fluid-base font-semibold">{title}</h3>
      {description && <p className="max-w-sm text-sm text-foreground-secondary">{description}</p>}
      {action && (
        <Button size="sm" onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  );
}
