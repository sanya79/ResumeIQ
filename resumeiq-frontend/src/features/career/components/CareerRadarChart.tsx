import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { AnalyticsCard } from "@/components/cards/AnalyticsCard";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import type { CareerRadarPoint } from "@/types";

/** Two-series radar — Current Skills vs Required Skills for the target
 * role. Same shell/tooltip primitives as `RadarScoreChart`/`MatchRadarChart`,
 * with a second `<Radar>` series since this comparison needs both current
 * and required on one chart rather than a single score. */
export function CareerRadarChart({ data }: { data: CareerRadarPoint[] }) {
  return (
    <AnalyticsCard title="Skill Radar" subtitle="Current skills vs. what the target role requires">
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#B3B3B3", fontSize: 10 }} />
            <PolarRadiusAxis tick={{ fill: "#B3B3B3", fontSize: 9 }} axisLine={false} domain={[0, 100]} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#B3B3B3" }} />
            <Radar
              name="Current Skills"
              dataKey="current"
              stroke="#22D3EE"
              fill="#22D3EE"
              fillOpacity={0.3}
              animationDuration={900}
            />
            <Radar
              name="Required Skills"
              dataKey="required"
              stroke="#8B5CF6"
              fill="#8B5CF6"
              fillOpacity={0.18}
              animationDuration={900}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsCard>
  );
}
