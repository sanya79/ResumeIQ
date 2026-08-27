import type { TooltipProps } from "recharts";

/** Recharts custom tooltip — swaps the library's default white box for the
 * app's glass-strong surface so charts don't break the dark theme. */
export function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs shadow-card">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((entry) => (
        <p key={entry.dataKey as string} className="flex items-center gap-1.5 text-foreground-secondary">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}: <span className="font-medium text-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}
