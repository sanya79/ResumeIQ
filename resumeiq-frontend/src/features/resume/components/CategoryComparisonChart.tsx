import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { AnalyticsCard } from "@/components/cards/AnalyticsCard";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import type { AtsCategoryComparison } from "@/types";

function barColor(percentage: number) {
  if (percentage >= 80) return "#10B981";
  if (percentage >= 50) return "#22D3EE";
  return "#EC4899";
}

export function CategoryComparisonChart({ data }: { data: AtsCategoryComparison[] }) {
  return (
    <AnalyticsCard title="Category Comparison" subtitle="Current score vs. maximum possible, per category">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: "#B3B3B3", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="category"
              width={140}
              tick={{ fill: "#B3B3B3", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="percentage" name="Score %" radius={[0, 6, 6, 0]} animationDuration={900}>
              {data.map((entry, i) => (
                <Cell key={i} fill={barColor(entry.percentage)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsCard>
  );
}
