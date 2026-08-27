import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Grid } from "@/components/layout/Grid";
import { FeatureCard } from "@/components/cards/FeatureCard";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { Badge } from "@/components/ui/Badge";
import { features } from "../data";

export function FeaturesSection() {
  return (
    <Section id="features">
      <Container>
        <FadeIn className="mx-auto mb-14 max-w-2xl text-center">
          <Badge tone="cyan" className="mb-4">
            Capabilities
          </Badge>
          <h2 className="text-fluid-3xl font-extrabold tracking-tight">
            Everything your resume needs to <span className="text-gradient">get noticed</span>
          </h2>
          <p className="mt-4 text-fluid-base text-foreground-secondary">
            Six AI-driven tools that turn a static resume into a data-backed job search asset.
          </p>
        </FadeIn>

        <StaggerChildren>
          <Grid cols={3} gap="lg">
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <FeatureCard icon={<feature.icon size={20} />} title={feature.title} description={feature.description} />
              </StaggerItem>
            ))}
          </Grid>
        </StaggerChildren>
      </Container>
    </Section>
  );
}
