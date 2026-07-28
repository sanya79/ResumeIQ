import { useEffect, useRef } from "react";

interface CinematicCanvasProps {
  activeScene: number; // 0, 1, 2, or 3
}

export function CinematicCanvas({ activeScene }: CinematicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 600;
    };
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left - width / 2;
      const my = e.clientY - rect.top - height / 2;
      mouseRef.current.targetX = mx * 0.35;
      mouseRef.current.targetY = my * 0.35;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Particle pool representation
    interface Particle3D {
      x: number;
      y: number;
      z: number;
      tx: number;  // Scene 0: Torus Wave (Data Analysis)
      ty: number;
      tz: number;
      p1x: number; // Scene 1: Humanoid Robot Hologram
      p1y: number;
      p1z: number;
      p2x: number; // Scene 2: Waving Terrain Grid (Pro Features)
      p2y: number;
      p2z: number;
      p3x: number; // Scene 3: Constellation Galaxy Tree (Fantasy Brand)
      p3y: number;
      p3z: number;
      color: string;
      size: number;
    }

    const particles: Particle3D[] = [];
    const particleCount = 400;

    for (let i = 0; i < particleCount; i++) {
      // Scene 0: Torus Wave (Data Analysis)
      const theta = (i / particleCount) * Math.PI * 2;
      const phi = (i % 20) * ((Math.PI * 2) / 20);
      const r = 45 + Math.sin(phi * 3) * 12;
      const R = 110;
      const tx = (R + r * Math.cos(phi)) * Math.cos(theta);
      const ty = (R + r * Math.cos(phi)) * Math.sin(theta);
      const tz = r * Math.sin(phi);

      // Scene 1: Humanoid Robot Hologram (standing figure)
      const segment = i % 9;
      let p1x = 0;
      let p1y = 0;
      let p1z = 0;
      if (segment === 0) { // Head sphere
        const ang = Math.random() * Math.PI * 2;
        const pitch = Math.acos(2 * Math.random() - 1);
        p1x = 18 * Math.sin(pitch) * Math.cos(ang);
        p1y = -75 + 18 * Math.sin(pitch) * Math.sin(ang);
        p1z = 18 * Math.cos(pitch);
      } else if (segment === 1) { // Spine
        const t = Math.random();
        p1y = -55 + t * 75;
        p1z = (Math.random() - 0.5) * 6;
      } else if (segment === 2) { // Shoulders/Chest
        const t = Math.random() * 2 - 1;
        p1x = t * 35;
        p1y = -40;
        p1z = (Math.random() - 0.5) * 8;
      } else if (segment === 3) { // Hips
        const t = Math.random() * 2 - 1;
        p1x = t * 24;
        p1y = 20;
        p1z = (Math.random() - 0.5) * 8;
      } else if (segment === 4) { // Left Arm
        const t = Math.random();
        p1x = -35 - t * 20;
        p1y = -40 + t * 50;
        p1z = -5 + Math.sin(t * Math.PI) * 12;
      } else if (segment === 5) { // Right Arm
        const t = Math.random();
        p1x = 35 + t * 20;
        p1y = -40 + t * 50;
        p1z = -5 + Math.sin(t * Math.PI) * 12;
      } else if (segment === 6) { // Left Leg
        const t = Math.random();
        p1x = -24 - t * 6;
        p1y = 20 + t * 90;
        p1z = Math.cos(t * Math.PI) * 5;
      } else if (segment === 7) { // Right Leg
        const t = Math.random();
        p1x = 24 + t * 6;
        p1y = 20 + t * 90;
        p1z = Math.cos(t * Math.PI) * 5;
      } else { // Drifting flower particles at the feet/floor
        const ang = Math.random() * Math.PI * 2;
        const rad = 70 + Math.random() * 90;
        p1x = rad * Math.cos(ang);
        p1y = 110 + (Math.random() - 0.5) * 18;
        p1z = rad * Math.sin(ang);
      }

      // Scene 2: Waving Terrain Grid (Pro Features)
      const gridSize = 20; // 20x20 grid
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      const p2x = (col - gridSize / 2) * 18;
      const p2z = (row - gridSize / 2) * 18;
      const p2y = 40 + Math.sin(row * 0.4) * Math.cos(col * 0.4) * 20;

      // Scene 3: Constellation Galaxy Tree (Fantasy Brand)
      const spiralType = i % 2 === 0 ? 0 : 1;
      const angle = (i / particleCount) * Math.PI * 12 + (spiralType * Math.PI);
      const dist = (i / particleCount) * 150 + 15;
      const p3x = dist * Math.cos(angle);
      const p3y = dist * Math.sin(angle) * 0.4 - 20;
      const p3z = (Math.random() - 0.5) * 35;

      // Cyan / Blue / Purple cinematic palette
      let color = "#2dd4bf"; // cyan
      if (i % 3 === 0) color = "#60a5fa"; // blue
      if (i % 3 === 1) color = "#c084fc"; // purple

      particles.push({
        x: (Math.random() - 0.5) * 600,
        y: (Math.random() - 0.5) * 600,
        z: (Math.random() - 0.5) * 600,
        tx,
        ty,
        tz,
        p1x,
        p1y,
        p1z,
        p2x,
        p2y,
        p2z,
        p3x,
        p3y,
        p3z,
        color,
        size: Math.random() * 1.5 + 1.2,
      });
    }

    let rotX = 0;
    let rotY = 0;
    let time = 0;

    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      time += 0.012;

      // Mouse rotation follow
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Base auto rotation + mouse movement
      if (activeScene === 2) {
        // Grid should look flat with subtle rotation tilt
        rotX = 0.8 + mouseRef.current.y * 0.003;
        rotY = time * 0.08 + mouseRef.current.x * 0.003;
      } else {
        rotX = time * 0.15 + mouseRef.current.y * 0.004;
        rotY = time * 0.22 + mouseRef.current.x * 0.004;
      }

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      // Render glowing rim light under object
      const glowGrad = ctx.createRadialGradient(
        width / 2,
        height / 2 + 10,
        0,
        width / 2,
        height / 2 + 10,
        180
      );
      glowGrad.addColorStop(0, "rgba(45, 212, 191, 0.07)");
      glowGrad.addColorStop(0.5, "rgba(192, 132, 252, 0.02)");
      glowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2 + 10, 180, 0, Math.PI * 2);
      ctx.fill();

      // Project and draw particles
      const fov = 400;
      const projected: { sx: number; sy: number; sz: number; p: Particle3D }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        let targetX = p.tx;
        let targetY = p.ty;
        let targetZ = p.tz;

        if (activeScene === 1) {
          targetX = p.p1x;
          targetY = p.p1y;
          targetZ = p.p1z;
        } else if (activeScene === 2) {
          targetX = p.p2x;
          targetY = p.p2y;
          targetZ = p.p2z;
        } else if (activeScene === 3) {
          targetX = p.p3x;
          targetY = p.p3y;
          targetZ = p.p3z;
        }

        // Apply interactive micro movements based on active scene
        if (activeScene === 0) {
          const theta = (i / particleCount) * Math.PI * 2;
          targetX += Math.cos(theta) * Math.sin(time * 2.5 + i) * 8;
          targetY += Math.sin(theta) * Math.sin(time * 2.5 + i) * 8;
        } else if (activeScene === 1) {
          // Standing robot breathing movement
          if ((i % 9) < 8) {
            targetY += Math.sin(time * 2) * 1.8;
          } else {
            // Ground flowers sway
            targetX += Math.sin(time * 1.5 + i) * 2;
          }
        } else if (activeScene === 2) {
          // Mesh ripple wave simulation
          const row = Math.floor(i / 20);
          const col = i % 20;
          targetY = 25 + Math.sin(row * 0.4 + time * 2) * Math.cos(col * 0.4 + time * 2) * 22;
        } else if (activeScene === 3) {
          // Galaxy core rotation speed boost
          targetZ += Math.cos(time * 1.5 + i) * 4;
        }

        // Morphing interpolate
        p.x += (targetX - p.x) * 0.07;
        p.y += (targetY - p.y) * 0.07;
        p.z += (targetZ - p.z) * 0.07;

        // Apply 3D rotation matrix
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.x * sinY + p.z * cosY;
        let y1 = p.y * cosX - z1 * sinX;
        let z2 = p.y * sinX + z1 * cosX;

        // Projection
        const scale = fov / (fov + z2);
        const screenX = width / 2 + x1 * scale;
        const screenY = height / 2 + y1 * scale;

        projected.push({ sx: screenX, sy: screenY, sz: z2, p });
      }

      // Depth sort
      projected.sort((a, b) => b.sz - a.sz);

      // Render wireframe mesh connections
      ctx.lineWidth = 0.55;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        if (p1.sz > 150) continue;

        let connections = 0;
        let maxConnections = 1;
        let maxDist = 20;

        if (activeScene === 1) { // Humanoid joints
          maxConnections = 2;
          maxDist = 32;
        } else if (activeScene === 2) { // Terrain grid connections
          maxConnections = 3;
          maxDist = 28;
        } else if (activeScene === 3) { // Galaxy trails
          maxConnections = 2;
          maxDist = 24;
        }

        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          if (connections >= maxConnections) break;

          const dx = p1.sx - p2.sx;
          const dy = p1.sy - p2.sy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);
            const alpha = (1.0 - dist / maxDist) * 0.16;
            ctx.strokeStyle = p1.p.color;
            ctx.globalAlpha = alpha;
            ctx.stroke();
            connections++;
          }
        }
      }

      // Render particles
      for (let i = 0; i < projected.length; i++) {
        const item = projected[i];
        const opacity = Math.max(0.12, Math.min(1.0, 1.0 - item.sz / 280));

        ctx.fillStyle = item.p.color;
        ctx.globalAlpha = opacity;

        // Standing robot glow aura
        if (activeScene === 1 && (i % 9) < 8 && i % 4 === 0) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = item.p.color;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(item.sx, item.sy, item.p.size * (fov / (fov + item.sz)), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;

      animationId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [activeScene]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 block h-full w-full pointer-events-none"
    />
  );
}
