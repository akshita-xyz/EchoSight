import { useEffect, useRef } from "react";

interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
  size: number;
  life: number;
}

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const trailRef = useRef<TrailPoint[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const addTrailPoint = (x: number, y: number) => {
      trailRef.current.push({
        x,
        y,
        opacity: 1,
        size: Math.random() * 1.5 + 0.8,
        life: 1,
      });

      // Limit trail length
      if (trailRef.current.length > 12) {
        trailRef.current.shift();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw trail points
      trailRef.current = trailRef.current.filter((point) => {
        point.life -= 0.02;
        point.opacity = point.life;
        point.size *= 0.98;

        if (point.life <= 0) return false;

        // Draw trail point
        ctx.save();
        ctx.globalAlpha = point.opacity;
        ctx.fillStyle = "#60a5fa"; // Blue color
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#60a5fa";
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return true;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      addTrailPoint(e.clientX, e.clientY);
    };

    resizeCanvas();
    animate();

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ background: "transparent" }}
    />
  );
}
