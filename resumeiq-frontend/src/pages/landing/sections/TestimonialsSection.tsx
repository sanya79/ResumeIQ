import { Quote } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { GlassCard } from "@/components/cards/GlassCard";
import { Avatar } from "@/components/ui/Avatar";
import { FadeIn } from "@/components/animations/FadeIn";
import { Badge } from "@/components/ui/Badge";
import { Marquee } from "../components/Marquee";
import { testimonials } from "../data";

export function TestimonialsSection() {
  return (
    <Section id="testimonials">
      <Container>
        <FadeIn className="mx-auto mb-14 max-w-2xl text-center">
          <Badge tone="purple" className="mb-4">
            Testimonials
          </Badge>
          <h2 className="text-fluid-3xl font-extrabold tracking-tight">
            Loved by <span className="text-gradient">job seekers</span> who got results
          </h2>
        </FadeIn>
      </Container>

      <Marquee duration={45}>
        {testimonials.map((t) => (
          <GlassCard key={t.name} className="w-80 shrink-0">
            <Quote size={20} className="mb-3 text-accent-purple/60" />
            <p className="text-sm leading-relaxed text-foreground">{t.quote}</p>
            <div className="mt-5 flex items-center gap-3">
              <Avatar name={t.name} size="sm" />
              <div>
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-foreground-secondary">{t.role}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </Marquee>
    </Section>
  );
}
