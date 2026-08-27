import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const BG_IMAGE_1 =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85";
const BG_IMAGE_2 =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85";

const SPOTLIGHT_R = 260;

interface RevealLayerProps {
  image: string;
  cursorX: number;
  cursorY: number;
}

function RevealLayer({ image, cursorX, cursorY }: RevealLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [maskUrl, setMaskUrl] = useState<string>("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (cursorX >= 0 && cursorY >= 0) {
      const grad = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, SPOTLIGHT_R);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.4, "rgba(255,255,255,1)");
      grad.addColorStop(0.6, "rgba(255,255,255,0.75)");
      grad.addColorStop(0.75, "rgba(255,255,255,0.4)");
      grad.addColorStop(0.88, "rgba(255,255,255,0.12)");
      grad.addColorStop(1, "rgba(255,255,255,0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2);
      ctx.fill();
    }

    setMaskUrl(canvas.toDataURL());
  }, [cursorX, cursorY]);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ display: "none" }} />
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
        style={{
          backgroundImage: `url(${image})`,
          maskImage: maskUrl ? `url(${maskUrl})` : "none",
          WebkitMaskImage: maskUrl ? `url(${maskUrl})` : "none",
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
        }}
      />
    </>
  );
}

export function HeroSection() {
  const navigate = useNavigate();
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });

  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);

    const loop = () => {
      if (mouse.current.x >= 0 && mouse.current.y >= 0) {
        if (smooth.current.x < 0) {
          smooth.current = { ...mouse.current };
        } else {
          smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1;
          smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1;
        }
        setCursorPos({ x: smooth.current.x, y: smooth.current.y });
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black tracking-[-0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden h-screen bg-black" style={{ height: "100dvh" }}>
        {/* 1. Base image (z-10) */}
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat hero-zoom z-10"
          style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
        />

        {/* 2. Reveal layer (z-30) */}
        <RevealLayer image={BG_IMAGE_2} cursorX={cursorPos.x} cursorY={cursorPos.y} />

        {/* 3. Heading (z-50) */}
        <div className="absolute top-[14%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-50">
          <h1 className="text-white leading-[0.95]">
            <span
              className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
              style={{ letterSpacing: "-0.05em", animationDelay: "0.25s" }}
            >
              Resumes hold
            </span>
            <span
              className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
              style={{ letterSpacing: "-0.08em", animationDelay: "0.42s" }}
            >
              tales of success
            </span>
          </h1>
        </div>

        {/* 4. Bottom-left paragraph (z-50) */}
        <div
          className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[280px] z-50 hero-anim hero-fade"
          style={{ animationDelay: "0.7s" }}
        >
          <p className="text-sm text-white/80 leading-relaxed">
            Every layer of your resume records a chapter of your career, from foundational skills to major milestones, crafted for AI precision.
          </p>
        </div>

        {/* 5. Bottom-right block (z-50) */}
        <div
          className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[280px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade"
          style={{ animationDelay: "0.85s" }}
        >
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Our AI resume intelligence lets you analyze ATS compatibility, match top job profiles, and optimize your career trajectory in real-time.
          </p>
          <button
            onClick={() => navigate("/resumes")}
            className="bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-semibold px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30"
          >
            Analyze Resume
          </button>
        </div>
      </section>
    </div>
  );
}

export default HeroSection;
