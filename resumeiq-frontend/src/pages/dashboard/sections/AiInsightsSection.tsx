import { Sparkles } from "lucide-react";
import { SlideUp } from "@/components/animations/SlideUp";
import { AnalyticsCard } from "@/components/cards/AnalyticsCard";
import { Accordion, type AccordionItemData } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { insightGroups } from "../data";

const toneToBadge: Record<(typeof insightGroups)[number]["tone"], "emerald" | "danger" | "cyan" | "purple"> = {
  emerald: "emerald",
  danger: "danger",
  cyan: "cyan",
  purple: "purple",
};

/** Glass panel of expandable insight groups — strong skills, weak skills,
 * ATS issues, and resume suggestions, each collapsed by default. */
export function AiInsightsSection() {
  const items: AccordionItemData[] = insightGroups.map((group) => ({
    id: group.id,
    question: group.title,
    answer: (
      <ul className="flex flex-col gap-2 pt-1">
        {group.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <Badge tone={toneToBadge[group.tone]} className="mt-0.5 shrink-0">
              {i + 1}
            </Badge>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ),
  }));

  return (
    <SlideUp>
      <AnalyticsCard
        title="AI Insights"
        subtitle="Generated from your latest resume analysis"
        actions={<Sparkles size={18} className="text-accent-purple" />}
      >
        <Accordion items={items} multiple />
      </AnalyticsCard>
    </SlideUp>
  );
}
