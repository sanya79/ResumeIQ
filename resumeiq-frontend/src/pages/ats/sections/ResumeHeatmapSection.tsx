import { AnalyticsCard } from "@/components/cards/AnalyticsCard";
import { Tooltip } from "@/components/ui/Tooltip";
import { Flame } from "lucide-react";
import { getBreakdownPercentage, getHeatLevel, type HeatLevel } from "../data";
import type { AtsBreakdownItem } from "@/types";

const heatStyles: Record<HeatLevel, string> = {
  strong: "bg-accent-emerald/70 hover:bg-accent-emerald",
  average: "bg-accent-cyan/60 hover:bg-accent-cyan/90",
  weak: "bg-danger/60 hover:bg-danger/90",
};

interface ResumeHeatmapSectionProps {
  breakdown: AtsBreakdownItem[];
  heatmap?: Array<{ section: string; score: number; confidence: number }>;
}

export function ResumeHeatmapSection({ breakdown, heatmap }: ResumeHeatmapSectionProps) {
  return (
    <AnalyticsCard
      title="Resume Heatmap"
      subtitle="Every scoring category, at a glance — hover a block for details"
      actions={<Flame size={16} className="text-accent-pink" />}
    >
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
        {(heatmap && heatmap.length > 0 ? heatmap : breakdown.map((item) => ({ section: item.name, score: getBreakdownPercentage(item), confidence: 1 }))).map((item) => {
          const percentage = typeof item.score === "number" ? Math.round(item.score) : 0;
          const level = getHeatLevel(percentage);
          return (
            <Tooltip key={item.section} content={`${item.section}: ${percentage}%${item.confidence ? ` — confidence ${Math.round(item.confidence * 100)}%` : ""}`}>
              <div
                className={`flex aspect-square w-full flex-col items-center justify-center rounded-xl text-center transition-colors cursor-default ${heatStyles[level]}`}
              >
                <span className="text-xs font-bold text-white">{percentage}%</span>
              </div>
            </Tooltip>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-foreground-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-accent-emerald/70" /> Strong
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-accent-cyan/60" /> Average
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/60" /> Weak
        </span>
      </div>
    </AnalyticsCard>
  );
}
