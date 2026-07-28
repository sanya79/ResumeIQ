import { TrendingUp, Award, Eye, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { ProgressCircle } from "@/components/charts/ProgressCircle";
import { HoverLift } from "@/components/animations/HoverLift";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { getMatchTierColor } from "@/pages/matching/data";
import type { HiringProbability } from "@/types";

interface ProbabilityCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}

function ProbabilityCard({ label, value, icon, description }: ProbabilityCardProps) {
  return (
    <HoverLift>
      <GlassCard className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-foreground-secondary">
          <span className="text-accent-purple">{icon}</span>
          {label}
        </div>
        <ProgressCircle value={value} size={88} strokeWidth={8} color={getMatchTierColor(value)}>
          <span className="text-fluid-lg font-bold tabular-nums">{Math.round(value)}%</span>
        </ProgressCircle>
        <p className="text-xs text-foreground-secondary">{description}</p>
      </GlassCard>
    </HoverLift>
  );
}

export function HiringProbabilityPanel({ probability }: { probability: HiringProbability }) {
  const cards: ProbabilityCardProps[] = [
    {
      label: "Interview Chance",
      value: probability.interviewChance,
      icon: <TrendingUp size={14} />,
      description: "Estimated odds of an interview invite",
    },
    {
      label: "ATS Ranking",
      value: probability.atsRanking,
      icon: <Award size={14} />,
      description: "Predicted rank among applicants",
    },
    {
      label: "Recruiter Interest",
      value: probability.recruiterInterest,
      icon: <Eye size={14} />,
      description: "Likely attention from a human reviewer",
    },
    {
      label: "Application Strength",
      value: probability.applicationStrength,
      icon: <ShieldCheck size={14} />,
      description: "Overall competitiveness of this application",
    },
  ];

  return (
    <StaggerChildren className="grid grid-cols-2 gap-5 lg:grid-cols-4">
      {cards.map((card) => (
        <StaggerItem key={card.label}>
          <ProbabilityCard {...card} />
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}
