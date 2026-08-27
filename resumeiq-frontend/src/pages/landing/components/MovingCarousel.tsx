import { Sparkles, Layers, Activity, Eye } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";

interface CardData {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  metric: string;
  tone: "cyan" | "blue" | "purple" | "pink";
}

const CARDS_LIST: CardData[] = [
  {
    id: "1",
    icon: <Sparkles className="text-teal-400" size={24} />,
    title: "Particle Continuum",
    desc: "A live flow-field of 220 emissive bodies reacting to cursor gravity, rendered with additive light accumulation.",
    metric: "220 pts",
    tone: "cyan",
  },
  {
    id: "2",
    icon: <Layers className="text-blue-400" size={24} />,
    title: "Holographic Layering",
    desc: "Refractive glass planes stacked in parallax depth, each catching a different slice of the ambient neon spectrum.",
    metric: "6 planes",
    tone: "blue",
  },
  {
    id: "3",
    icon: <Activity className="text-purple-400" size={24} />,
    title: "Fluid Motion Core",
    desc: "Curl-noise velocity solving keeps every trajectory organic — no loop ever resolves the same way twice.",
    metric: "60 fps",
    tone: "purple",
  },
  {
    id: "4",
    icon: <Eye className="text-pink-400" size={24} />,
    title: "Camera Dissolve",
    desc: "Scroll-locked depth transitions translate the viewport like a cinema dolly through abstract space.",
    metric: "∞ depth",
    tone: "pink",
  },
];

export function MovingCarousel() {
  // Duplicate list to achieve a seamless loop in the marquee
  const items = [...CARDS_LIST, ...CARDS_LIST];

  return (
    <div className="relative w-full overflow-hidden py-10 select-none">
      {/* Soft gradient masks on left and right edges for cinematic fade-off */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[#020206] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-[#020206] to-transparent" />

      <div className="animate-marquee gap-8 px-4">
        {items.map((card, idx) => {
          return (
            <div
              key={`${card.id}-${idx}`}
              className="w-80 sm:w-96 flex-shrink-0 group transition-all duration-300 hover:-translate-y-2.5"
            >
              <GlassCard
                className="shine-sweep rounded-[24px] border border-white/5 bg-[#030309]/80 backdrop-blur-xl p-8 flex flex-col justify-between h-[250px] relative overflow-hidden transition-all duration-300 hover:border-primary/30"
              >
                {/* Visual indicator / dynamic metric bar */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:border-primary/20 transition-all duration-300">
                      {card.icon}
                    </div>
                    <span className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">
                      {`0${(idx % 4) + 1} / 04`}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-base font-bold text-white tracking-wide font-sans group-hover:text-primary transition-colors duration-300">
                      {card.title}
                    </h3>
                    <p className="text-xs text-white/50 leading-relaxed font-sans font-light">
                      {card.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <span className="text-lg font-bold text-white tracking-tight font-mono">
                    {card.metric}
                  </span>
                  
                  {/* Decorative tiny audio-like bars matching screenshot */}
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-[1.5px] bg-primary animate-pulse h-2" style={{ animationDelay: '0.1s' }} />
                    <span className="w-[1.5px] bg-primary animate-pulse h-3" style={{ animationDelay: '0.3s' }} />
                    <span className="w-[1.5px] bg-primary animate-pulse h-1.5" style={{ animationDelay: '0.5s' }} />
                    <span className="w-[1.5px] bg-primary animate-pulse h-2.5" style={{ animationDelay: '0.2s' }} />
                    <span className="w-[1.5px] bg-primary animate-pulse h-2" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </GlassCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}
