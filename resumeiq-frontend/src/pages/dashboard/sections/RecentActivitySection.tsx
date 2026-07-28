import { History } from "lucide-react";
import { SlideUp } from "@/components/animations/SlideUp";
import { AnalyticsCard } from "@/components/cards/AnalyticsCard";
import { TimelineCard } from "@/components/cards/TimelineCard";
import { recentActivity } from "../data";

export function RecentActivitySection() {
  return (
    <SlideUp>
      <AnalyticsCard title="Recent Activity" subtitle="Your last few actions" actions={<History size={18} className="text-accent-cyan" />}>
        <TimelineCard steps={recentActivity} />
      </AnalyticsCard>
    </SlideUp>
  );
}
