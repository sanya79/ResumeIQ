import { Container } from "@/components/layout/Container";
import { FadeIn } from "@/components/animations/FadeIn";
import { Marquee } from "../components/Marquee";
import { trustedCompanies } from "../data";

export function TrustedBySection() {
  return (
    <section className="py-14">
      <Container>
        <FadeIn className="mb-8 text-center text-xs font-medium uppercase tracking-[0.2em] text-foreground-secondary">
          Trusted by teams hiring from
        </FadeIn>
      </Container>
      <Marquee duration={26}>
        {trustedCompanies.map((name) => (
          <span
            key={name}
            className="shrink-0 select-none text-xl font-semibold tracking-tight text-foreground-secondary/50 transition-colors hover:text-foreground-secondary sm:text-2xl"
          >
            {name}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
