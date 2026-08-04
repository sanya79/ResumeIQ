import { ShieldCheck } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { GlassCard } from "@/components/cards/GlassCard";

export function RecruiterDashboardPage() {
  return (
    <PageContainer className="py-8">
      <div className="mx-auto max-w-3xl">
        <GlassCard strong glow className="p-8">
          <div className="flex items-center gap-3 text-accent-cyan">
            <ShieldCheck size={22} />
            <span className="text-xs font-medium uppercase tracking-[0.2em]">Recruiter access</span>
          </div>

          <h1 className="mt-6 text-fluid-2xl font-bold tracking-tight">Recruiter dashboard</h1>
          <p className="mt-4 text-base text-foreground-secondary">
            Placeholder page for recruiter workflows. JD upload, candidate search/ranking, and shortlisting will be added only after explicit approval.
          </p>
        </GlassCard>
      </div>
    </PageContainer>
  );
}
