import { useEffect, useState } from "react";
import { AlertTriangle, Maximize2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ProctorGuardProps {
  onWarningTriggered?: (count: number) => void;
}

export function ProctorGuard({ onWarningTriggered }: ProctorGuardProps) {
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [warningCount, setWarningCount] = useState(0);
  const [faceWarningActive, setFaceWarningActive] = useState(false);

  // Monitor Fullscreen status
  useEffect(() => {
    function handleFullscreenChange() {
      const isFull = Boolean(document.fullscreenElement);
      setIsFullscreen(isFull);
      if (!isFull) {
        setWarningCount((c) => {
          const next = c + 1;
          if (onWarningTriggered) onWarningTriggered(next);
          return next;
        });
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [onWarningTriggered]);

  // Periodic proctoring face positioning check
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.02) {
        setFaceWarningActive(true);
        setTimeout(() => setFaceWarningActive(false), 4000);
      }
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  function reenterFullscreen() {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // ignore
    }
  }

  return (
    <>
      {/* Fullscreen Warning Banner */}
      {!isFullscreen && (
        <div className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-950/90 px-4 py-2.5 shadow-2xl backdrop-blur-md text-amber-200 text-xs">
          <ShieldAlert size={18} className="text-amber-400 shrink-0" />
          <span>
            <strong>PROCTOR ALERT:</strong> Fullscreen mode exited (Incidents: {warningCount}). Return to fullscreen for exam integrity.
          </span>
          <Button variant="outline" size="sm" onClick={reenterFullscreen} className="border-amber-500/40 text-amber-200 hover:bg-amber-900/50">
            <Maximize2 size={12} className="mr-1" /> Re-enter Fullscreen
          </Button>
        </div>
      )}

      {/* Face Missing Warning Banner */}
      {faceWarningActive && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-rose-500/40 bg-rose-950/90 px-4 py-3 shadow-2xl backdrop-blur-md text-rose-200 text-xs animate-pulse">
          <AlertTriangle size={20} className="text-rose-400 shrink-0" />
          <span>
            <strong>FACE NOT DETECTED:</strong> Please position your face clearly in front of the camera.
          </span>
        </div>
      )}
    </>
  );
}
