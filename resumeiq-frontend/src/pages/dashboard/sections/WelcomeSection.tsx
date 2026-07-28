import { FadeIn } from "@/components/animations/FadeIn";
import { useAuth } from "@/hooks/useAuth";

/** Page-load greeting — first thing rendered in the dashboard's scroll area. */
export function WelcomeSection() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <FadeIn>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-fluid-3xl font-[800] tracking-tight">
          Welcome back,{" "}
          <span className="text-gradient bg-gradient-lg animate-gradient-move">{firstName}</span>
        </h1>
        <p className="text-fluid-base text-foreground-secondary">
          Continue improving your career with AI.
        </p>
      </div>
    </FadeIn>
  );
}
