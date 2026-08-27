import { History } from "lucide-react";
import { SlideUp } from "@/components/animations/SlideUp";
import { AnalyticsCard } from "@/components/cards/AnalyticsCard";
import { TimelineCard } from "@/components/cards/TimelineCard";
import type { TimelineStep } from "@/components/cards/TimelineCard";

export function RecentActivitySection({ data = [], isLoading }: { data?: TimelineStep[]; isLoading?: boolean }) {
  if (isLoading && data.length === 0) return null;

  return (
    <SlideUp>
      <AnalyticsCard title="Recent Activity" subtitle="Your last few actions" actions={<History size={18} className="text-accent-cyan" />}>
        <TimelineCard steps={data} />
      </AnalyticsCard>
    </SlideUp>
  );
}
