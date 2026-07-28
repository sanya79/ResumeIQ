import { Gauge, ShieldCheck, Brain, MessageCircle, Timer, Target } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { StatCard } from "@/components/cards/StatCard";
import { ScoreRing } from "@/components/charts/ScoreRing";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import type { PerformanceReport } from "@/types";

export function PerformanceReportHero({ report }: { report: PerformanceReport }) {
  return (
    <div className="flex flex-col gap-6">
      <GlassCard glow className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <ScoreRing score={Math.round(report.overallScore)} size={120} />
        <div>
          <p className="text-sm text-foreground-secondary">Overall Interview Score</p>
          <p className="text-fluid-3xl font-bold">{Math.round(report.overallScore)}/100</p>
          <p className="mt-1 text-sm text-foreground-secondary">
            {report.overallScore >= 80
              ? "Strong performance — you're close to interview-ready."
              : report.overallScore >= 60
                ? "Solid foundation with clear room to sharpen."
                : "Keep practicing — focus on the weak areas below."}
          </p>
        </div>
      </GlassCard>

      <StaggerChildren className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StaggerItem>
          <StatCard label="Interview Readiness" value={`${Math.round(report.interviewReadiness)}%`} icon={<ShieldCheck size={16} />} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="Confidence Level" value={`${Math.round(report.confidenceLevel)}%`} icon={<Gauge size={16} />} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="Technical Score" value={`${Math.round(report.technicalScore)}%`} icon={<Brain size={16} />} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="Communication" value={`${Math.round(report.communicationScore)}%`} icon={<MessageCircle size={16} />} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="Avg. Response Time" value={`${report.averageResponseTimeSeconds}s`} icon={<Timer size={16} />} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="Question Accuracy" value={`${Math.round(report.questionAccuracy)}%`} icon={<Target size={16} />} />
        </StaggerItem>
      </StaggerChildren>
    </div>
  );
}
