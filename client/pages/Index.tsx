import { useEffect, useRef, useState } from "react";
import { Brain, AudioLines, ShieldCheck } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { DemoResponse } from "@shared/api";
import { TwinklingStars } from "@/components/ui/twinkling-stars";
import { CursorTrail } from "@/components/ui/cursor-trail";

export default function Index() {
  const [exampleFromServer, setExampleFromServer] = useState("");
  useEffect(() => {
    fetchDemo();
  }, []);
  const fetchDemo = async () => {
    try {
      const response = await fetch("/api/demo");
      const data = (await response.json()) as DemoResponse;
      setExampleFromServer(data.message);
    } catch (error) {
      console.error("Error fetching demo:", error);
    }
  };

  return (
    <div className="relative min-h-screen">
      <TwinklingStars />
      <CursorTrail />
      <div className="content-layer">
        <HeroCanvas />
        <ProblemSolved />
        <Intelligent />
        <HowItWorks />
        <Gallery />
        <Contributors />
        <div className="sr-only">{exampleFromServer}</div>
      </div>
    </div>
  );
}

function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hudRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const CONFIG = {
      text: "ECHOSIGHT",
      fontWeight: 800,
      fontSize: 180,
      letterSpacing: 16,
      colors: { main: "#6cc7d8", o: "#e6e6e6" },
      gap: 5,
      jitter: 30,
      dotSize: [1.2, 2.2] as [number, number],
      spring: 0.12,
      friction: 0.85,
      mouse: { radius: 110, strength: 18 },
      burst: { radius: 140, strength: 28 },
      dprLimit: 2,
    } as const;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const off = document.createElement("canvas");
    const octx = off.getContext("2d")!;

    let W = 0,
      H = 0;
    const particles: any[] = [];
    const mouse = { x: -9999, y: -9999, down: false };
    const DPR = Math.min(window.devicePixelRatio || 1, CONFIG.dprLimit);

    function px(n: number) {
      return Math.round(n * DPR);
    }

    function layoutAndSample() {
      off.width = W;
      off.height = H;
      const fontPx = Math.min(CONFIG.fontSize * DPR, Math.floor(W * 0.12));
      const font = `${CONFIG.fontWeight} ${fontPx}px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`;
      octx.clearRect(0, 0, W, H);
      octx.fillStyle = "#000";
      octx.fillRect(0, 0, W, H);
      octx.font = font;
      octx.textBaseline = "middle";
      octx.textAlign = "left";

      const chars = CONFIG.text.split("");
      const widths = chars.map((ch) => octx.measureText(ch).width);
      const totalWidth =
        widths.reduce((a, b) => a + b, 0) +
        (chars.length - 1) * px(CONFIG.letterSpacing);
      const startX = Math.round((W - totalWidth) / 2);
      const midY = Math.round(H * 0.56);

      let x = startX;
      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        const isLastO = i === chars.length - 1 && ch.toUpperCase() === "O";
        octx.fillStyle = isLastO ? CONFIG.colors.o : CONFIG.colors.main;
        octx.fillText(ch, x, midY);
        x += widths[i] + px(CONFIG.letterSpacing);
      }

      const img = octx.getImageData(0, 0, W, H);
      const data = img.data;
      const gap = Math.max(1, Math.floor(px(CONFIG.gap)));

      const points: { x: number; y: number; color: string }[] = [];
      for (let y = 0; y < H; y += gap) {
        for (let x = 0; x < W; x += gap) {
          const idx = (y * W + x) * 4;
          const a = data[idx + 3];
          if (a > 128) {
            const r = data[idx],
              g = data[idx + 1],
              b = data[idx + 2];
            points.push({ x, y, color: `rgb(${r},${g},${b})` });
          }
        }
      }
      return points;
    }

    function makeParticle(pt: any) {
      const rand = (a: number, b: number) => a + Math.random() * (b - a);
      const j = px(CONFIG.jitter);
      return {
        x: pt.x + rand(-j, j),
        y: pt.y + rand(-j, j),
        vx: 0,
        vy: 0,
        tx: pt.x,
        ty: pt.y,
        size: rand(CONFIG.dotSize[0] * DPR, CONFIG.dotSize[1] * DPR),
        color: pt.color,
      };
    }

    function buildParticles() {
      const points = layoutAndSample();
      const keep = Math.min(points.length, particles.length);
      for (let i = 0; i < keep; i++) {
        const p = particles[i],
          pt = points[i];
        p.tx = pt.x;
        p.ty = pt.y;
        p.color = pt.color;
      }
      for (let i = particles.length; i < points.length; i++) {
        particles.push(makeParticle(points[i]));
      }
      particles.length = points.length;
    }

    function resize() {
      const cssW = window.innerWidth;
      const cssH = window.innerHeight * 0.9;
      W = canvas.width = Math.floor(cssW * DPR);
      H = canvas.height = Math.floor(cssH * DPR);
      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";
      buildParticles();
    }

    function burst(mx: number, my: number) {
      const rad = px(CONFIG.burst.radius),
        k = CONFIG.burst.strength;
      for (const p of particles) {
        const dx = p.x - mx,
          dy = p.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < rad * rad) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / rad) * k;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
      }
    }

    function step() {
      raf = requestAnimationFrame(step);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);

      const rad = px(CONFIG.mouse.radius),
        k = CONFIG.mouse.strength;
      for (const p of particles) {
        p.vx += (p.tx - p.x) * CONFIG.spring;
        p.vy += (p.ty - p.y) * CONFIG.spring;

        const dx = p.x - mouse.x,
          dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < rad * rad) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / rad) * k;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }

        p.vx *= CONFIG.friction;
        p.vy *= CONFIG.friction;
        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
    }

    let raf = requestAnimationFrame(step);
    resize();
    // Ensure webfont is loaded for accurate canvas text metrics
    // @ts-ignore
    if (document.fonts && (document as any).fonts.ready) {
      // @ts-ignore
      (document as any).fonts.ready.then(() => buildParticles());
    }
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) * DPR;
      mouse.y = (e.clientY - rect.top) * DPR;
    });
    canvas.addEventListener("pointerleave", () => {
      mouse.x = mouse.y = -9999;
    });
    canvas.addEventListener("pointerdown", () => {
      mouse.down = true;
      burst(mouse.x, mouse.y);
    });
    canvas.addEventListener("pointerup", () => {
      mouse.down = false;
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <section
      id="hero"
      ref={ref}
      className={`relative overflow-hidden reveal ${inView ? "inview" : ""} bg-black text-[#9adbef]`}
    >
      <canvas
        ref={canvasRef}
        className="block w-screen h-[85svh] md:h-[92svh] cursor-none"
      />
    </section>
  );
}

function ProblemSolved() {
  const { ref, inView } = useInView<HTMLDivElement>();
  
  return (
    <section
      id="problem-solved"
      ref={ref}
      className={`relative py-24 reveal ${inView ? "inview" : ""} bg-gradient-to-b from-black to-background overflow-hidden`}
    >
      <TwinklingStars />
      <div className="container mx-auto">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Problem <span className="text-primary">(Solved!)</span>
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          
          <div className="space-y-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
            <p>
              AI-powered assistive platform designed to give visually impaired individuals a richer experience of the world through sound. Using advanced computer vision and speech synthesis, it describes objects, scenes, and environments in real time, ensuring users never miss out on life's moments.
            </p>
            
            <p>
              EchoSight also helps with practical tasks like reading exam papers, recognizing text, and navigating new surroundings, making independence and inclusion more accessible than ever before.
            </p>
            
            <p className="text-2xl font-bold text-foreground">
              Let's build this together—it's not just a startup, it's a revolution in accessibility.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Intelligent() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const features = [
    {
      icon: <Brain className="size-6" aria-hidden />,
      title: "Understanding at the edge",
      desc: "On-device AI describes environments, objects, and text with real-time processing for instant feedback.",
    },
    {
      icon: <AudioLines className="size-6" aria-hidden />,
      title: "Natural audio guidance",
      desc: "Contextual voice feedback with spatial cues to help you navigate confidently.",
    },
    {
      icon: <ShieldCheck className="size-6" aria-hidden />,
      title: "Easily Accessible",
      desc: "Intuitive interface and voice commands designed for seamless navigation and interaction.",
    },
  ];

  return (
    <section
      id="intelligent"
      ref={ref}
      className={`relative py-24 reveal ${inView ? "inview" : ""}`}
    >
      <div className="container mx-auto">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Intelligent by Design
          </h2>
          <p className="mt-4 text-muted-foreground">
            AI-powered assistive platform designed to give visually impaired individuals a richer experience of the world through sound.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={i}
              className={
                "group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-transform duration-300 will-change-transform hover:-translate-y-1"
              }
            >
              <div className="inline-flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                {f.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const steps = [
    {
      title: "Capture",
      desc: "Point your camera or connect wearables. EchoSight captures your surroundings securely.",
    },
    {
      title: "Understand",
      desc: "On-device models recognize scenes, text, faces you approve, and objects in real time.",
    },
    {
      title: "Guide",
      desc: "Clear audio cues and haptics guide you—hands free, lag free.",
    },
  ];

  return (
    <section
      id="how"
      ref={ref}
      className={`relative py-24 reveal ${inView ? "inview" : ""}`}
    >
      <div className="container mx-auto grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold">How it Works</h2>
          <p className="mt-4 text-muted-foreground max-w-prose">
            Built for reliability and speed. EchoSight processes what matters
            on-device, ensuring consistent performance and instant responsiveness.
          </p>
          <ol className="mt-8 space-y-6">
            {steps.map((s, i) => (
              <li key={i} className="relative pl-10">
                <span className="absolute left-0 top-0 inline-flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold shadow">
                  {i + 1}
                </span>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl border bg-card shadow-xl">
            <div className="aspect-video w-full bg-[url('/placeholder.svg')] bg-cover bg-center" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const images = Array.from({ length: 8 }).map((_, i) => `/placeholder.svg`);
  return (
    <section
      id="gallery"
      ref={ref}
      className={`relative py-24 reveal ${inView ? "inview" : ""}`}
    >
      <div className="container mx-auto">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Screenshots</h2>
          <p className="mt-3 text-muted-foreground">
            A peek into recent prototypes and tests.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {images.map((src, i) => (
            <figure
              key={i}
              className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm"
            >
              <img
                src={src}
                alt={`EchoSight preview ${i + 1}`}
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-background/80 p-3 text-xs text-foreground/80">
                EchoSight preview {i + 1}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contributors() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const people = [
    { name: "Akshita Sharma", initials: "AS" },
    { name: "Krishna Yadav", initials: "KY" },
    { name: "Mannat Oberoi", initials: "MO" },
    { name: "Chaitanya Bisht", initials: "CB" },
  ];
  return (
    <section
      id="contributors"
      ref={ref}
      className={`relative py-24 reveal ${inView ? "inview" : ""}`}
    >
      <div className="container mx-auto">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Contributors</h2>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {people.map((p) => {
            const isAkshita = p.name === "Akshita Sharma";
            const Component = isAkshita ? "a" : "div";
            const componentProps = isAkshita 
              ? { 
                  href: "https://akshitasharma.vercel.app", 
                  target: "_blank", 
                  rel: "noopener noreferrer"
                }
              : {};
            
            return (
              <li key={p.name}>
                <Component 
                  {...componentProps}
                  className="group rounded-xl border bg-card p-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:border-primary/30 hover:-translate-y-1 block"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold transition-all duration-300 group-hover:shadow-md group-hover:shadow-primary/30 group-hover:scale-110">
                      {p.initials}
                    </div>
                    <div>
                      <p className="font-medium leading-tight">{p.name}</p>
                    </div>
                  </div>
                </Component>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
