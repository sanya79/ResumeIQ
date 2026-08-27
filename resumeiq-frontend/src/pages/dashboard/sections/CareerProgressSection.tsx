import { Rocket } from "lucide-react";
import { SlideUp } from "@/components/animations/SlideUp";
import { AnalyticsCard } from "@/components/cards/AnalyticsCard";
import { MetricCard } from "@/components/cards/MetricCard";
import type { CareerProgressDatum } from "../data";

/** "Career roadmap" — reuses MetricCard (label + progress bar +
 * description) for each completion item rather than a bespoke component. */
export function CareerProgressSection({ data = [], isLoading }: { data?: CareerProgressDatum[]; isLoading?: boolean }) {
  if (isLoading && data.length === 0) return null;

  return (
    <SlideUp>
      <AnalyticsCard
        title="Career Progress"
        subtitle="Fill these out to boost your visibility to recruiters"
        actions={<Rocket size={18} className="text-accent-pink" />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {data.map((item) => (
            <MetricCard key={item.label} label={item.label} value={item.value} description={item.description} />
          ))}
        </div>
      </AnalyticsCard>
    </SlideUp>
  );
}
