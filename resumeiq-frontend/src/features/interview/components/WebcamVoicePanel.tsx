import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Mic, MicOff, Volume2, Video, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface WebcamVoicePanelProps {
  onTranscriptUpdate: (text: string) => void;
  currentTranscript: string;
}

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export function WebcamVoicePanel({ onTranscriptUpdate, currentTranscript }: WebcamVoicePanelProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart + " ";
        }
      }
      if (finalTranscript.trim()) {
        onTranscriptUpdate(currentTranscript ? `${currentTranscript.trim()} ${finalTranscript.trim()}` : finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [currentTranscript, onTranscriptUpdate]);

  // Turn Camera On/Off
  async function toggleCamera() {
    setCameraError(null);
    if (cameraActive) {
      // Turn Off Camera
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    } else {
      // Turn On Camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } catch (err: any) {
        console.error("Camera access error:", err);
        setCameraError("Camera access denied or unavailable. You can still practice using voice/text.");
      }
    }
  }

  // Toggle Voice Speech-to-Text Recording
  function toggleSpeechRecording() {
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Speech start error:", err);
      }
    }
  }

  // Auto-start camera on mount and explicitly stop all camera & mic hardware tracks on unmount/finish
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    async function initCameraStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        activeStream = stream;
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } catch (err) {
        console.warn("Camera auto-init error:", err);
      }
    }

    initCameraStream();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    };
  }, []);

  return (
    <GlassCard className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video size={16} className="text-accent-cyan" />
          <h3 className="text-sm font-semibold text-foreground">AI Mock Interview Camera & Voice</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={cameraActive ? "emerald" : "neutral"}>
            {cameraActive ? "Cam Active" : "Cam Off"}
          </Badge>
          {isListening && (
            <Badge tone="purple" className="animate-pulse">
              <Volume2 size={12} className="mr-1" /> Recording Voice...
            </Badge>
          )}
        </div>
      </div>

      {/* Video Feed Box */}
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-slate-950/80 border border-white/10">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full object-cover ${cameraActive ? "block" : "hidden"}`}
        />

        {!cameraActive && (
          <div className="flex flex-col items-center justify-center gap-3 text-center p-6 text-foreground-secondary">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-accent-cyan">
              <Camera size={32} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground">Webcam Preview Standby</p>
              <p className="text-xs text-foreground-secondary max-w-xs">
                Turn on your camera for a real AI mock interview experience with facial framing.
              </p>
            </div>
          </div>
        )}

        {cameraActive && (
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-mono tracking-wider text-white backdrop-blur">
                LIVE REC • AI PROCTOR
              </span>
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div className="mx-auto rounded-full border border-dashed border-cyan-400/40 p-12 opacity-30" />
          </div>
        )}
      </div>

      {cameraError && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 text-xs text-rose-300">
          <AlertCircle size={14} className="shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
        <Button
          variant={cameraActive ? "secondary" : "outline"}
          size="sm"
          onClick={toggleCamera}
        >
          {cameraActive ? <CameraOff size={14} /> : <Camera size={14} />}
          {cameraActive ? "Turn Off Camera" : "Open Camera"}
        </Button>

        {speechSupported && (
          <Button
            variant={isListening ? "gradient" : "secondary"}
            size="sm"
            onClick={toggleSpeechRecording}
            className={isListening ? "animate-pulse" : ""}
          >
            {isListening ? <MicOff size={14} /> : <Mic size={14} />}
            {isListening ? "Stop Voice Recording" : "Start Voice Input (Mic)"}
          </Button>
        )}
      </div>
    </GlassCard>
  );
}
