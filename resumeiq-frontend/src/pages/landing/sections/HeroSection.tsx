import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Database, Shield, Zap, RefreshCw, BarChart2, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { CinematicCanvas } from "@/components/animations/CinematicCanvas";
import { GlassCard } from "@/components/cards/GlassCard";

// Small background canvas inside Scene 2's Left Card representing waving fluid/waves
function WavingFluidCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.015;

      ctx.lineWidth = 1.8;
      ctx.strokeStyle = "rgba(96, 165, 250, 0.4)"; // Soft blue

      // Draw 4 overlapping sine waves for volumetric look
      for (let w = 0; w < 4; w++) {
        ctx.beginPath();
        const offset = w * 1.5;
        const amp = 15 - w * 2;
        ctx.strokeStyle = `rgba(96, 165, 250, ${0.4 - w * 0.08})`;

        for (let x = 0; x < canvas.width; x++) {
          const y = canvas.height / 2 + Math.sin(x * 0.018 + time + offset) * amp * Math.cos(x * 0.005 + time * 0.3);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={140}
      className="absolute bottom-0 left-0 w-full h-[120px] pointer-events-none opacity-80"
    />
  );
}

// Visual bars animation for Scene 2's Right Card (vertical blue pulsing ribs)
function VerticalRibs() {
  return (
    <div className="absolute bottom-0 left-0 w-full h-[100px] flex items-end justify-between px-6 pb-2 pointer-events-none opacity-80">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            height: [15, 60 + Math.sin(i * 0.5) * 20, 15],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: 1.8 + Math.sin(i) * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.08
          }}
          className="w-[6px] rounded-t-[2px] bg-gradient-to-t from-blue-600 to-teal-400"
        />
      ))}
    </div>
  );
}

export function HeroSection() {
  const [activeScene, setActiveScene] = useState(0);

  useEffect(() => {
    // Transition scenes every 8 seconds for a relaxed viewing experience
    const timer = setInterval(() => {
      setActiveScene((prev) => (prev + 1) % 4);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-28 pb-16">
      {/* 3D Volumetric Morphing Canvas (Full Site Scope) */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center -z-10 pointer-events-none">
        <CinematicCanvas activeScene={activeScene} />
      </div>

      <Container className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          {activeScene === 0 && (
            /* ---- SCENE 0: PROCESS / DATA ANALYSIS (Frame 1) ---- */
            <motion.div
              key="scene-0"
              initial={{ opacity: 0, filter: "blur(12px)", y: 20 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: "blur(10px)", y: -20 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-20"
            >
              <div className="flex flex-col gap-6 items-start">
                <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-primary/80">
                  THE PROCESS // SCENE 01
                </span>
                <h1 className="text-fluid-4xl md:text-5xl font-serif italic text-white leading-[1.1] tracking-tight">
                  Our AI simplifies data analysis, eliminates decision bottlenecks, and seamlessly integrates.
                </h1>
                <p className="text-sm md:text-base text-white/50 leading-relaxed max-w-xl">
                  Our AI algorithms strategically address industry challenges, enhancing efficiency and facilitating optimal decision-making, providing a definitive solution for businesses in the AI era.
                </p>
                <div className="pt-2">
                  <Button variant="gradient" size="md" className="font-mono uppercase tracking-[0.1em] text-xs">
                    Get Started <ChevronRight size={14} className="ml-1" />
                  </Button>
                </div>
              </div>

              {/* Stacked Vertical Process Cards (Right side) */}
              <div className="flex flex-col gap-5">
                <GlassCard className="rounded-2xl border border-white/5 bg-[#030309]/50 backdrop-blur-xl p-6 flex gap-4 items-start transition-all hover:border-primary/20">
                  <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl">
                    <BarChart2 className="text-teal-400" size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">Streamlined Analytics</h3>
                    <p className="text-xs text-white/40 leading-relaxed mt-1">Our AI simplifies intricate data analysis, providing businesses with quick and accurate insights.</p>
                  </div>
                </GlassCard>

                <GlassCard className="rounded-2xl border border-white/5 bg-[#030309]/50 backdrop-blur-xl p-6 flex gap-4 items-start transition-all hover:border-primary/20">
                  <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl">
                    <CheckCircle2 className="text-blue-400" size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">Decision Optimization</h3>
                    <p className="text-xs text-white/40 leading-relaxed mt-1">Eliminate decision-making bottlenecks for timely and informed choices, empowering overall operational efficiency.</p>
                  </div>
                </GlassCard>

                <GlassCard className="rounded-2xl border border-white/5 bg-[#030309]/50 backdrop-blur-xl p-6 flex gap-4 items-start transition-all hover:border-primary/20">
                  <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl">
                    <RefreshCw className="text-purple-400" size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">Effortless Integration</h3>
                    <p className="text-xs text-white/40 leading-relaxed mt-1">Our algorithms seamlessly integrate AI with plug-and-play ease, empowering businesses without disruption.</p>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {activeScene === 1 && (
            /* ---- SCENE 1: ROBOT / WHY US (Frame 2) ---- */
            <motion.div
              key="scene-1"
              initial={{ opacity: 0, filter: "blur(12px)", y: 20 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: "blur(10px)", y: -20 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col min-h-[75vh] justify-between gap-12"
            >
              {/* Top half: Heading & Description */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="flex flex-col gap-4">
                  <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-primary/80">
                    WHY US // SCENE 02
                  </span>
                  <h1 className="text-fluid-4xl md:text-5xl font-serif italic text-white leading-[1.1] tracking-tight">
                    The difference is everything.
                  </h1>
                </div>
                <p className="text-xs md:text-sm text-white/40 leading-relaxed max-w-md lg:ml-auto lg:text-right pt-6">
                  We do not just build websites. We engineer competitive advantages that accelerate operations.
                </p>
              </div>

              {/* Center Space is occupied by the 3D standing Humanoid wireframe in CinematicCanvas */}
              <div className="h-[220px]" />

              {/* Bottom 4 Horizontal Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <GlassCard className="rounded-[20px] border border-white/5 bg-[#030309]/50 backdrop-blur-xl p-6 hover:-translate-y-1.5 transition-transform hover:border-primary/20 flex flex-col justify-between min-h-[160px]">
                  <div>
                    <Zap className="text-teal-400 mb-4" size={20} />
                    <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Days, Not Months</h3>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed mt-2">Get your site live in days, not months. Our AI accelerates processes without compromising.</p>
                </GlassCard>

                <GlassCard className="rounded-[20px] border border-white/5 bg-[#030309]/50 backdrop-blur-xl p-6 hover:-translate-y-1.5 transition-transform hover:border-primary/20 flex flex-col justify-between min-h-[160px]">
                  <div>
                    <Sparkles className="text-blue-400 mb-4" size={20} />
                    <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Obsessively Crafted</h3>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed mt-2">Every pixel considered. Refined animations. Custom UI design configured for Awwwards standards.</p>
                </GlassCard>

                <GlassCard className="rounded-[20px] border border-white/5 bg-[#030309]/50 backdrop-blur-xl p-6 hover:-translate-y-1.5 transition-transform hover:border-primary/20 flex flex-col justify-between min-h-[160px]">
                  <div>
                    <Database className="text-purple-400 mb-4" size={20} />
                    <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Built to Convert</h3>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed mt-2">Convert visitors into conversions. Highly optimized layout funnels built for business performance.</p>
                </GlassCard>

                <GlassCard className="rounded-[20px] border border-white/5 bg-[#030309]/50 backdrop-blur-xl p-6 hover:-translate-y-1.5 transition-transform hover:border-primary/20 flex flex-col justify-between min-h-[160px]">
                  <div>
                    <Shield className="text-pink-400 mb-4" size={20} />
                    <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Secure by Default</h3>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed mt-2">Enterprise-grade security structure. Dynamic data encryption and absolute compliance built-in.</p>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {activeScene === 2 && (
            /* ---- SCENE 2: PRO FEATURES / CAPABILITIES (Frame 3) ---- */
            <motion.div
              key="scene-2"
              initial={{ opacity: 0, filter: "blur(12px)", y: 20 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: "blur(10px)", y: -20 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-8 w-full"
            >
              <div className="flex flex-col gap-3">
                <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-primary/80">
                  CAPABILITIES // SCENE 03
                </span>
                <h1 className="text-fluid-5xl md:text-6xl font-serif italic text-white leading-[1.05] tracking-tight">
                  Pro features.<br />Zero complexity.
                </h1>
              </div>

              {/* Two side-by-side widescreen feature cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                {/* Waving fluid simulation card */}
                <GlassCard className="rounded-3xl border border-white/5 bg-[#030309]/60 backdrop-blur-xl p-8 flex flex-col justify-between h-[300px] relative overflow-hidden group hover:border-primary/20 transition-all">
                  <div className="relative z-10 flex flex-col gap-3 max-w-sm">
                    <h3 className="text-base font-bold text-white tracking-wide font-sans">Designed to convert. Built to perform.</h3>
                    <p className="text-xs leading-relaxed text-white/50">
                      Every pixel is intentional. Our AI studies what works across thousands of top sites — then builds yours to outperform them all.
                    </p>
                  </div>
                  <WavingFluidCanvas />
                </GlassCard>

                {/* Vertical pulsing ribs card */}
                <GlassCard className="rounded-3xl border border-white/5 bg-[#030309]/60 backdrop-blur-xl p-8 flex flex-col justify-between h-[300px] relative overflow-hidden group hover:border-primary/20 transition-all">
                  <div className="relative z-10 flex flex-col gap-3 max-w-sm">
                    <h3 className="text-base font-bold text-white tracking-wide font-sans">It gets smarter. Automatically.</h3>
                    <p className="text-xs leading-relaxed text-white/50">
                      Your site evolves on its own. AI monitors every click, scroll, and conversion — then optimizes in real time.
                    </p>
                  </div>
                  <VerticalRibs />
                </GlassCard>
              </div>
            </motion.div>
          )}

          {activeScene === 3 && (
            /* ---- SCENE 3: STUDIO / FANTASY CONSTELLATION (Frame 4) ---- */
            <motion.div
              key="scene-3"
              initial={{ opacity: 0, filter: "blur(12px)", y: 20 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: "blur(10px)", y: -20 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12"
            >
              <div className="flex flex-col gap-6 items-start">
                <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-primary/80">
                  STUDIO // SCENE 04
                </span>
                <h1 className="text-fluid-5xl md:text-6xl font-serif italic text-white leading-[1.05] tracking-tight">
                  The Website Your Brand Deserves.
                </h1>
                <p className="text-sm md:text-base text-white/50 leading-relaxed max-w-md">
                  Stunning design. Blazing performance. Built by AI, refined by experts. Ensure absolute product market dominance.
                </p>
                <div className="pt-4 flex items-center gap-4">
                  <Button variant="gradient" size="lg" className="group font-mono uppercase tracking-[0.1em] text-xs">
                    Get Started
                    <ArrowRight size={14} className="ml-1 transition-transform group-hover:translate-x-0.5 text-primary-foreground" />
                  </Button>
                </div>
              </div>

              {/* Right column: space reserved to show the rotating Constellation Galaxy Tree */}
              <div className="h-[300px] lg:h-[400px] pointer-events-none" />
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </section>
  );
}
