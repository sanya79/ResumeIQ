import { MessageSquareText } from "lucide-react";
import { AnalyticsCard } from "@/components/cards/AnalyticsCard";
import { Accordion, type AccordionItemData } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import type { AnswerEvaluation } from "@/types";

function BulletList({ items, tone }: { items: string[]; tone: "emerald" | "danger" | "purple" | "cyan" }) {
  return (
    <ul className="flex flex-col gap-2 pt-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <Badge tone={tone} className="mt-0.5 shrink-0">
            {i + 1}
          </Badge>
          <span className="text-foreground-secondary">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function FeedbackPanel({ evaluation }: { evaluation: AnswerEvaluation }) {
  const items: AccordionItemData[] = [
    {
      id: "strengths",
      question: "Strengths",
      answer: <BulletList items={evaluation.strengths} tone="emerald" />,
    },
    {
      id: "weaknesses",
      question: "Weaknesses",
      answer: <BulletList items={evaluation.weaknesses} tone="danger" />,
    },
    {
      id: "suggestions",
      question: "Suggested Improvements",
      answer: <BulletList items={evaluation.suggestedImprovements} tone="purple" />,
    },
    {
      id: "alternative",
      question: "Alternative Answer",
      answer: <p className="pt-1 text-sm leading-relaxed text-foreground-secondary">{evaluation.alternativeAnswer}</p>,
    },
    {
      id: "missing",
      question: "Important Missing Points",
      answer: <BulletList items={evaluation.missingPoints} tone="cyan" />,
    },
    {
      id: "reading",
      question: "Recommended Reading",
      answer: <BulletList items={evaluation.recommendedReading} tone="purple" />,
    },
  ];

  return (
    <AnalyticsCard title="AI Feedback" actions={<MessageSquareText size={16} className="text-accent-purple" />}>
      <Accordion items={items} multiple />
    </AnalyticsCard>
  );
}
