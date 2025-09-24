import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  moveSpeed: number;
  direction: number;
}

export function TwinklingStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createStars = () => {
      const stars: Star[] = [];
      const numStars = 150;

      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          moveSpeed: Math.random() * 0.5 + 0.1,
          direction: Math.random() * Math.PI * 2,
        });
      }

      starsRef.current = stars;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach((star) => {
        // Update star properties
        star.opacity += Math.sin(Date.now() * star.twinkleSpeed) * 0.01;
        star.opacity = Math.max(0.1, Math.min(1, star.opacity));

        // Move star slightly
        star.x += Math.cos(star.direction) * star.moveSpeed;
        star.y += Math.sin(star.direction) * star.moveSpeed;

        // Wrap around screen
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        // Draw star
        ctx.save();
        ctx.globalAlpha = star.opacity;
        ctx.fillStyle = "#60a5fa"; // Blue color
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Add a subtle glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#60a5fa";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createStars();
    animate();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "transparent" }}
    />
  );
}
