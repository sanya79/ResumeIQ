import { useEffect, useRef } from "react";

export function VolumetricCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic resize handler
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Track mouse coordinates
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Particle representation
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
      pulseSpeed: number;
      pulsePhase: number;
    }

    const particles: Particle[] = [];
    const particleCount = 120;
    const colors = ["#2dd4bf", "#a855f7", "#3b82f6", "#ec4899"];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Static nebula orbs for the volumetric 3D look
    const nebulae = [
      { x: width * 0.25, y: height * 0.35, vx: 0.02, vy: -0.015, radius: 250, color: "rgba(45, 212, 191, 0.08)" },
      { x: width * 0.75, y: height * 0.65, vx: -0.015, vy: 0.02, radius: 300, color: "rgba(168, 85, 247, 0.08)" },
      { x: width * 0.5, y: height * 0.5, vx: 0.01, vy: 0.01, radius: 280, color: "rgba(59, 130, 246, 0.06)" },
    ];

    // Loop logic
    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw volumetric nebulae (soft blur blobs)
      for (const neb of nebulae) {
        // Move slowly
        neb.x += neb.vx;
        neb.y += neb.vy;

        // Wrap around boundaries
        if (neb.x < -neb.radius) neb.x = width + neb.radius;
        if (neb.x > width + neb.radius) neb.x = -neb.radius;
        if (neb.y < -neb.radius) neb.y = height + neb.radius;
        if (neb.y > height + neb.radius) neb.y = -neb.radius;

        const grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius);
        grad.addColorStop(0, neb.color);
        grad.addColorStop(1, "rgba(2, 2, 6, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(neb.x, neb.y, neb.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw volumetric lighting glow under the mouse cursor
      if (mouseRef.current.active) {
        const mouseGrad = ctx.createRadialGradient(
          mouseRef.current.x,
          mouseRef.current.y,
          0,
          mouseRef.current.x,
          mouseRef.current.y,
          180
        );
        mouseGrad.addColorStop(0, "rgba(45, 212, 191, 0.06)");
        mouseGrad.addColorStop(0.5, "rgba(168, 85, 247, 0.03)");
        mouseGrad.addColorStop(1, "rgba(2, 2, 6, 0)");

        ctx.fillStyle = mouseGrad;
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 180, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Update & render particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Slowly advance phase for opacity pulsing
        p.pulsePhase += p.pulseSpeed;
        const currentAlpha = p.alpha + Math.sin(p.pulsePhase) * 0.15;

        // Apply mouse physics (swirling / attraction)
        if (mouseRef.current.active) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 220) {
            const force = (220 - dist) / 220;
            const angle = Math.atan2(dy, dx);
            // Attract slightly
            p.vx -= Math.cos(angle) * force * 0.15;
            p.vy -= Math.sin(angle) * force * 0.15;
            // Swirl slightly (tangential velocity)
            p.vx += Math.sin(angle) * force * 0.25;
            p.vy -= Math.cos(angle) * force * 0.25;
          }
        }

        // Apply friction
        p.vx *= 0.96;
        p.vy *= 0.96;

        // Drift base velocity
        p.x += p.vx + (i % 2 === 0 ? 0.1 : -0.1);
        p.y += p.vy + (i % 3 === 0 ? 0.08 : -0.08);

        // Screen boundary wraps
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw particle
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.05, Math.min(1, currentAlpha));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect lines to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            const lineAlpha = (100 - dist) / 100 * 0.08;
            ctx.strokeStyle = p.color; // Use parent color
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1.0; // Reset alpha
      animationId = requestAnimationFrame(tick);
    };

    tick();

    // Clean up
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-20 block h-screen w-screen pointer-events-none"
    />
  );
}
