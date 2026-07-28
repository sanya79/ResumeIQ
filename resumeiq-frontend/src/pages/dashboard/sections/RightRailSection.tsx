import { Lightbulb, Quote, Bell, CalendarClock } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { WidgetTile } from "../components/WidgetTile";
import { aiTip, careerQuote, upcomingInterview } from "../data";

/** Small "weather-widget" style rail — ambient, low-emphasis context that
 * sits alongside the main dashboard column. */
export function RightRailSection() {
  return (
    <FadeIn className="flex flex-col gap-4">
      <WidgetTile icon={<Lightbulb size={14} />} label="Today's AI tip" accent="purple">
        {aiTip}
      </WidgetTile>

      <WidgetTile icon={<Quote size={14} />} label="Career quote" accent="cyan">
        <p className="italic text-foreground">&ldquo;{careerQuote.quote}&rdquo;</p>
        <p className="mt-1 text-xs text-foreground-secondary">— {careerQuote.author}</p>
      </WidgetTile>

      <WidgetTile icon={<Bell size={14} />} label="Recent notification" accent="pink">
        Your resume scored <span className="font-semibold text-foreground">87/100</span> on its latest ATS pass —
        up 8% from last time.
      </WidgetTile>

      <WidgetTile icon={<CalendarClock size={14} />} label="Upcoming interview" accent="emerald">
        <p className="font-medium text-foreground">{upcomingInterview.role}</p>
        <p className="text-xs text-foreground-secondary">
          {upcomingInterview.company} · {upcomingInterview.date}
        </p>
      </WidgetTile>
    </FadeIn>
  );
}
