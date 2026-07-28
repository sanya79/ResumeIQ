import { UploadCloud, ScanSearch, Sparkles, Target, MessagesSquare } from "lucide-react";
import { SlideUp } from "@/components/animations/SlideUp";
import { QuickActionCard } from "../components/QuickActionCard";
import { quickActions } from "../data";

const iconMap: Record<string, JSX.Element> = {
  upload: <UploadCloud size={20} />,
  analyze: <ScanSearch size={20} />,
  suggestions: <Sparkles size={20} />,
  match: <Target size={20} />,
  interview: <MessagesSquare size={20} />,
};

export function QuickActionsSection() {
  return (
    <SlideUp>
      <h2 className="mb-4 text-fluid-lg font-semibold">Quick actions</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {quickActions.map((datum) => (
          <QuickActionCard key={datum.id} datum={datum} icon={iconMap[datum.id]} />
        ))}
      </div>
    </SlideUp>
  );
}
