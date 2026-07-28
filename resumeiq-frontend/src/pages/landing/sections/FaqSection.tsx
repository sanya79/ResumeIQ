import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { GlassCard } from "@/components/cards/GlassCard";
import { Accordion } from "@/components/ui/Accordion";
import { FadeIn } from "@/components/animations/FadeIn";
import { Badge } from "@/components/ui/Badge";
import { faqs } from "../data";

export function FaqSection() {
  return (
    <Section id="faq">
      <Container className="max-w-3xl">
        <FadeIn className="mb-10 text-center">
          <Badge tone="cyan" className="mb-4">
            FAQ
          </Badge>
          <h2 className="text-fluid-3xl font-extrabold tracking-tight">
            Questions, <span className="text-gradient">answered</span>
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <GlassCard className="px-6">
            <Accordion items={faqs} />
          </GlassCard>
        </FadeIn>
      </Container>
    </Section>
  );
}
