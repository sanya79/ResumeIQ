import { useState, useEffect, useRef } from "react";

const BG_IMAGE_1 =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85";
const BG_IMAGE_2 =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85";

const SPOTLIGHT_R = 280;

interface GlobalSpotlightProps {
  blurAmount?: string; // e.g. "blur-md"
  darkness?: string;   // e.g. "bg-black/70"
}

export function SpotlightBackground({ darkness = "bg-black/30", blurAmount = "backdrop-blur-[1px]" }: GlobalSpotlightProps) {
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [maskUrl, setMaskUrl] = useState<string>("");
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
          smooth.current.x += (mouse.current.x - smooth.current.x) * 0.08;
          smooth.current.y += (mouse.current.y - smooth.current.y) * 0.08;
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

    if (cursorPos.x >= 0 && cursorPos.y >= 0) {
      const grad = ctx.createRadialGradient(cursorPos.x, cursorPos.y, 0, cursorPos.x, cursorPos.y, SPOTLIGHT_R);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.4, "rgba(255,255,255,1)");
      grad.addColorStop(0.65, "rgba(255,255,255,0.7)");
      grad.addColorStop(0.85, "rgba(255,255,255,0.2)");
      grad.addColorStop(1, "rgba(255,255,255,0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cursorPos.x, cursorPos.y, SPOTLIGHT_R, 0, Math.PI * 2);
      ctx.fill();
    }

    setMaskUrl(canvas.toDataURL());
  }, [cursorPos]);

  return (
    <div className="fixed inset-0 -z-30 pointer-events-none overflow-hidden h-screen w-screen bg-black">
      {/* Base Image 1 */}
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-80 scale-105 transition-all"
        style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
      />

      {/* Reveal Layer Image 2 */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ display: "none" }} />
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-100 transition-opacity"
        style={{
          backgroundImage: `url(${BG_IMAGE_2})`,
          maskImage: maskUrl ? `url(${maskUrl})` : "none",
          WebkitMaskImage: maskUrl ? `url(${maskUrl})` : "none",
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
        }}
      />

      {/* Dark Overlay with Blur for content readability across pages */}
      <div className={`absolute inset-0 ${darkness} ${blurAmount}`} />
    </div>
  );
}

export default SpotlightBackground;
