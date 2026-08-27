import { useEffect, useRef, useState } from "react";
import { Camera, Mic, ShieldCheck, CheckCircle2, AlertTriangle, Maximize2 } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface SystemCheckModalProps {
  onStartInterview: () => void;
  onCancel: () => void;
  targetRole: string;
}

export function SystemCheckModal({ onStartInterview, onCancel, targetRole }: SystemCheckModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [cameraOk, setCameraOk] = useState(false);
  const [micOk, setMicOk] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [checking, setChecking] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let animationFrameId: number;

    async function retestDevices() {
      try {
        setErrorMsg(null);
        setChecking(true);
        let vidOk = false;
        let audOk = false;

        try {
          const vidStream = await navigator.mediaDevices.getUserMedia({ video: true });
          mediaStreamRef.current = vidStream;
          if (videoRef.current) {
            videoRef.current.srcObject = vidStream;
          }
          vidOk = true;
          setCameraOk(true);
        } catch (vErr) {
          console.warn("Video stream check:", vErr);
          setCameraOk(false);
        }

        try {
          const audStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audOk = true;
          setMicOk(true);

          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const audioCtx = new AudioCtx();
            audioContextRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(audStream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const updateVolume = () => {
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const average = sum / dataArray.length;
              setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
              animationFrameId = requestAnimationFrame(updateVolume);
            };
            updateVolume();
          }
        } catch (aErr) {
          console.warn("Audio stream check:", aErr);
          setMicOk(false);
        }

        if (vidOk && audOk) {
          setErrorMsg(null);
        } else if (!vidOk && !audOk) {
          setErrorMsg("Hardware permissions pending. Click 'Request / Re-check Permissions' below to activate.");
        } else if (!vidOk) {
          setErrorMsg("Camera is standby. Microphone is ready for Voice & Text mode.");
        } else {
          setErrorMsg("Microphone is standby. Camera is ready for Video & Text mode.");
        }
      } catch (err: any) {
        console.error("System check error:", err);
      } finally {
        setChecking(false);
      }
    }

    retestDevices();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (audioContextRef.current) audioContextRef.current.close();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  function handleConfirmStart() {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // ignore
    }
    onStartInterview();
  }

  function handleRetest() {
    // Direct user-initiated gesture to trigger permission prompt / re-check
    const SpeechCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (SpeechCtx && audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume();
    }
    setErrorMsg(null);
    setChecking(true);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        mediaStreamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraOk(true);
        setMicOk(true);
        setErrorMsg(null);
      })
      .catch((err) => {
        console.warn("User re-test combined permission notice:", err);
        // Fallback to individual checks
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(() => setMicOk(true))
          .catch(() => setMicOk(false));

        navigator.mediaDevices.getUserMedia({ video: true })
          .then((stream) => {
            if (videoRef.current) videoRef.current.srcObject = stream;
            setCameraOk(true);
          })
          .catch(() => setCameraOk(false));
      })
      .finally(() => setChecking(false));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <GlassCard className="flex w-full max-w-xl flex-col gap-6 border border-white/15 p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-primary p-2.5 text-white">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Pre-Interview System Check</h2>
            <p className="text-xs text-foreground-secondary">
              Target Role: <span className="font-semibold text-accent-cyan">{targetRole}</span>
            </p>
          </div>
        </div>

        {/* Video Preview Box */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-950 border border-white/10">
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          {!cameraOk && !checking && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-rose-400">
              <AlertTriangle size={28} />
              <p className="text-xs">{errorMsg || "Camera permissions required for live video feed"}</p>
            </div>
          )}
          {cameraOk && (
            <div className="pointer-events-none absolute top-3 left-3 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
              ● CAMERA OK
            </div>
          )}
        </div>

        {/* Status Checklist */}
        <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-foreground">
              <Camera size={16} className="text-accent-purple" /> Camera Hardware & Framing
            </span>
            {cameraOk ? (
              <Badge tone="emerald">
                <CheckCircle2 size={12} className="mr-1" /> Ready
              </Badge>
            ) : (
              <Badge tone="pink">Standby / Pending</Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-foreground">
              <Mic size={16} className="text-accent-cyan" /> Microphone Input Meter
            </span>
            {micOk ? (
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-24 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-75"
                    style={{ width: `${Math.max(10, audioLevel)}%` }}
                  />
                </div>
                <Badge tone="emerald">
                  <CheckCircle2 size={12} className="mr-1" /> Active
                </Badge>
              </div>
            ) : (
              <Badge tone="pink">Standby / Pending</Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-foreground">
              <Maximize2 size={16} className="text-accent-purple" /> Fullscreen Proctored Mode
            </span>
            <Badge tone="neutral">Auto Enable</Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <Button variant="secondary" size="sm" onClick={handleRetest} disabled={checking}>
            Request / Re-test Permissions
          </Button>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="gradient" onClick={handleConfirmStart} disabled={checking}>
              {cameraOk && micOk ? "Start Interview & Enter Fullscreen" : "Start Interview (Interactive Mode)"}
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
