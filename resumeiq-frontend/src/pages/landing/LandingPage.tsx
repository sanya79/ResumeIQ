import { lazy, Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { HeroSection } from "./sections/HeroSection";
import { navLinks } from "./data";
import { MovingCarousel } from "./components/MovingCarousel";

// Below-the-fold sections are code-split so the hero (LCP content) ships in
// the smallest possible initial bundle. Each chunk loads as it scrolls near
// the viewport, courtesy of Suspense + the browser's own idle scheduling.
const TrustedBySection = lazy(() => import("./sections/TrustedBySection").then((m) => ({ default: m.TrustedBySection })));
const FeaturesSection = lazy(() => import("./sections/FeaturesSection").then((m) => ({ default: m.FeaturesSection })));
const HowItWorksSection = lazy(() => import("./sections/HowItWorksSection").then((m) => ({ default: m.HowItWorksSection })));
const AtsPreviewSection = lazy(() => import("./sections/AtsPreviewSection").then((m) => ({ default: m.AtsPreviewSection })));
const AiAnalysisSection = lazy(() => import("./sections/AiAnalysisSection").then((m) => ({ default: m.AiAnalysisSection })));
const TestimonialsSection = lazy(() => import("./sections/TestimonialsSection").then((m) => ({ default: m.TestimonialsSection })));
const FaqSection = lazy(() => import("./sections/FaqSection").then((m) => ({ default: m.FaqSection })));
const CtaSection = lazy(() => import("./sections/CtaSection").then((m) => ({ default: m.CtaSection })));
const FooterSection = lazy(() => import("./sections/FooterSection").then((m) => ({ default: m.FooterSection })));

/** Lightweight, section-shaped placeholder so lazy chunks don't cause
 * layout jump while they load in. */
function SectionFallback({ height = 400 }: { height?: number }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 md:px-10" style={{ height }}>
      <Skeleton className="h-full w-full rounded-3xl" />
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="relative">
      <Navbar
        links={navLinks}
        actions={
          <>
            <Button variant="ghost" size="sm" to="/login">
              Log in
            </Button>
            <Button variant="gradient" size="sm" to="/register">
              Get Started
            </Button>
          </>
        }
      />

      <HeroSection />

      <MovingCarousel />

      <Suspense fallback={<SectionFallback height={140} />}>
        <TrustedBySection />
      </Suspense>
      <Suspense fallback={<SectionFallback height={640} />}>
        <FeaturesSection />
      </Suspense>
      <Suspense fallback={<SectionFallback height={520} />}>
        <HowItWorksSection />
      </Suspense>
      <Suspense fallback={<SectionFallback height={520} />}>
        <AtsPreviewSection />
      </Suspense>
      <Suspense fallback={<SectionFallback height={520} />}>
        <AiAnalysisSection />
      </Suspense>
      <Suspense fallback={<SectionFallback height={420} />}>
        <TestimonialsSection />
      </Suspense>
      <Suspense fallback={<SectionFallback height={480} />}>
        <FaqSection />
      </Suspense>
      <Suspense fallback={<SectionFallback height={360} />}>
        <CtaSection />
      </Suspense>
      <Suspense fallback={<SectionFallback height={280} />}>
        <FooterSection />
      </Suspense>
    </div>
  );
}
