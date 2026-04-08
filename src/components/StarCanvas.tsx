import { useEffect, useRef } from "react";

/** Canvas-based starfield with per-star twinkle animation.
 *  Each star oscillates between a dim and a bright opacity value
 *  at its own speed, matching the Drei <Stars fade /> feel. */
export default function StarCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const COUNT = 1200;
    const stars = Array.from({ length: COUNT }, () => {
      const blue = Math.floor(Math.random() * 40);
      // Bright peak: 0.7 – 1.0; dim trough: near-zero
      const opacityMax = Math.random() * 0.3 + 0.7;
      const opacityMin = Math.random() * 0.04;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        // Smaller: mostly sub-pixel, a few up to 0.55 px
        r: Math.pow(Math.random(), 3) * 0.55 + 0.08,
        opacityMin,
        opacityMax,
        // Slower: full cycle every 4 – 20 s (0.08 – 0.4 rad/s × 2π ≈ 3 – 15 s period)
        speed: Math.random() * 0.32 + 0.08,
        phase: Math.random() * Math.PI * 2,
        r_ch: 225 - blue,
        g_ch: 225 - blue,
      };
    });

    let animId: number;
    const t0 = performance.now();

    function draw() {
      const t = (performance.now() - t0) / 1000;
      ctx!.clearRect(0, 0, w, h);

      for (const s of stars) {
        // Map sine (-1..1) → (opacityMin..opacityMax)
        const sine = (Math.sin(t * s.speed + s.phase) + 1) / 2; // 0..1
        const opacity = s.opacityMin + sine * (s.opacityMax - s.opacityMin);
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${s.r_ch},${s.g_ch},255,${opacity})`;
        ctx!.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
