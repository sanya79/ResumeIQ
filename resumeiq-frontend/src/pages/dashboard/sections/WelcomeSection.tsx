import { FadeIn } from "@/components/animations/FadeIn";
import { useAuth } from "@/hooks/useAuth";
import { useLatestResume } from "@/features/resume/hooks";
import { getUserFirstName } from "@/utils/userUtils";

/** Page-load greeting — first thing rendered in the dashboard's scroll area. */
export function WelcomeSection() {
  const { user } = useAuth();
  const { data: resume } = useLatestResume();
  const resumeName = (resume?.parsedProfile as { fullName?: string } | undefined)?.fullName;
  const firstName = getUserFirstName(user, resumeName);

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
