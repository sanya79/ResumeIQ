import { Award, Clock, ExternalLink } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { HoverLift } from "@/components/animations/HoverLift";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { getDifficultyTone } from "@/pages/career/data";
import type { Certification } from "@/types";

function CertificationCard({ cert }: { cert: Certification }) {
  return (
    <HoverLift className="h-full">
      <GlassCard className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-glow">
            <Award size={18} />
          </div>
          <Badge tone={getDifficultyTone(cert.difficulty)}>{cert.difficulty}</Badge>
        </div>
        <div>
          <h4 className="text-sm font-semibold leading-snug text-foreground">{cert.title}</h4>
          <p className="mt-0.5 text-xs text-foreground-secondary">{cert.provider}</p>
        </div>
        <p className="flex-1 text-xs leading-relaxed text-foreground-secondary">{cert.description}</p>
        <div className="flex items-center justify-between border-t border-surface-border pt-3 text-xs text-foreground-secondary">
          <span className="flex items-center gap-1.5">
            <Clock size={12} /> {cert.estimatedTime}
          </span>
          {cert.url && (
            <a
              href={cert.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 font-medium text-accent-cyan hover:text-accent-cyan/80"
            >
              View <ExternalLink size={11} />
            </a>
          )}
        </div>
      </GlassCard>
    </HoverLift>
  );
}

export function CertificationsGrid({ certifications }: { certifications: Certification[] }) {
  return (
    <StaggerChildren className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {certifications.map((cert) => (
        <StaggerItem key={cert.id}>
          <CertificationCard cert={cert} />
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}
