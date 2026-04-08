import { useEffect, useRef } from "react";

/**
 * Procedural network background — visually matches the globe's maritime routes.
 * Corner zones use a tighter Poisson min-distance for higher density.
 * Centre-fade mask uses an elliptical (scaled) radial gradient so the clear
 * zone around the flowchart is oval rather than circular.
 */
export default function NetworkCanvas() {
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

    // ── 1. Poisson-disk node generation (corner-aware) ───────────────────────
    const CORNER_ZONE  = 240;  // px radius around each corner — dense zone
    const CORNER_MIN   = 38;   // min node separation inside corner zones
    const MAIN_MIN     = 78;   // min node separation elsewhere
    const MAX_NODES    = 300;
    const MAX_ATTEMPTS = MAX_NODES * 35;

    const cornerPts: [number, number][] = [[0, 0], [w, 0], [0, h], [w, h]];

    function nearestCornerDist(x: number, y: number): number {
      let min = Infinity;
      for (const [cx, cy] of cornerPts) {
        const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (d < min) min = d;
      }
      return min;
    }

    const nodes: [number, number][] = [];

    function tooClose(x: number, y: number): boolean {
      // Use the tighter threshold if the candidate is in a corner zone
      const minD = nearestCornerDist(x, y) < CORNER_ZONE ? CORNER_MIN : MAIN_MIN;
      const minD2 = minD * minD;
      for (const [nx, ny] of nodes) {
        if ((nx - x) ** 2 + (ny - y) ** 2 < minD2) return true;
      }
      return false;
    }

    // Seed guaranteed nodes tight into each corner
    const seedOff = CORNER_MIN * 0.7;
    for (const [cx, cy] of cornerPts) {
      const sx = cx === 0 ? seedOff : w - seedOff;
      const sy = cy === 0 ? seedOff : h - seedOff;
      nodes.push([sx, sy]);
      // Extra dense seeds in a small fan from each corner
      for (let k = 0; k < 5; k++) {
        const angle = Math.random() * Math.PI * 0.5 + (cx === 0 ? (cy === 0 ? 0 : Math.PI * 1.5) : (cy === 0 ? Math.PI * 0.5 : Math.PI));
        const r = CORNER_MIN * (0.9 + Math.random() * 1.2);
        const fx = sx + Math.cos(angle) * r;
        const fy = sy + Math.sin(angle) * r;
        if (fx >= 0 && fx <= w && fy >= 0 && fy <= h && !tooClose(fx, fy)) {
          nodes.push([fx, fy]);
        }
      }
    }

    // Fill the rest of the canvas
    let attempts = 0;
    while (nodes.length < MAX_NODES && attempts < MAX_ATTEMPTS) {
      attempts++;
      const x = Math.random() * w;
      const y = Math.random() * h;
      if (!tooClose(x, y)) nodes.push([x, y]);
    }

    // ── 2. Build k-NN edges ───────────────────────────────────────────────────
    const K = 3;
    const edgeSet = new Set<string>();
    const edges: [number, number][] = [];

    function addEdge(i: number, j: number) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!edgeSet.has(key)) { edgeSet.add(key); edges.push([i, j]); }
    }

    for (let i = 0; i < nodes.length; i++) {
      const [x, y] = nodes[i];
      const ranked = nodes
        .map(([nx, ny], j) => ({ j, d: (nx - x) ** 2 + (ny - y) ** 2 }))
        .filter(r => r.j !== i)
        .sort((a, b) => a.d - b.d);

      for (let k = 0; k < Math.min(K, ranked.length); k++) addEdge(i, ranked[k].j);

      // Long-range corridor edge (~18% of nodes)
      if (Math.random() < 0.18 && ranked.length > 7) {
        addEdge(i, ranked[4 + Math.floor(Math.random() * 4)].j);
      }
    }

    // ── 3. Draw nodes ────────────────────────────────────────────────────────
    ctx.fillStyle = "rgba(42,106,191,0.55)";
    for (const [x, y] of nodes) {
      ctx.beginPath();
      ctx.arc(x, y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── 4. Draw edges ─────────────────────────────────────────────────────────
    ctx.strokeStyle = "rgba(42,106,191,0.40)";
    ctx.lineWidth = 0.7;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    for (const [i, j] of edges) {
      const [x1, y1] = nodes[i];
      const [x2, y2] = nodes[j];
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // ── 5. Elliptical centre-fade mask ────────────────────────────────────────
    // Scale the canvas before creating the gradient so the erasing zone is
    // oval rather than circular — wider than tall, hugging the flowchart shape.
    const mcx = w / 2, mcy = h / 2;
    const cornerDist = Math.sqrt(mcx * mcx + mcy * mcy);

    // Ellipse radii for the mask: rx controls horizontal extent, ry vertical.
    // rx > ry → the clear zone is wider than tall (landscape oval).
    const rx = cornerDist * 0.95;
    const ry = cornerDist * 0.72; // closer to rx → less oval, more circular

    ctx.globalCompositeOperation = "destination-out";
    ctx.save();
    ctx.translate(mcx, mcy);
    ctx.scale(rx, ry);

    // Steeper gradient: network stays fully erased until close to the ellipse
    // boundary, then disappears quickly in a narrow band
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    grad.addColorStop(0,    "rgba(0,0,0,1)");    // centre: fully erased
    grad.addColorStop(0.65, "rgba(0,0,0,0.95)"); // still almost fully erased
    grad.addColorStop(0.68, "rgba(0,0,0,0.50)"); // rapid transition begins
    grad.addColorStop(1,    "rgba(0,0,0,0)");    // ellipse edge: fully visible

    ctx.fillStyle = grad;
    // fillRect must cover the whole canvas in the scaled coordinate system
    ctx.fillRect(-mcx / rx, -mcy / ry, w / rx, h / ry);
    ctx.restore();
    ctx.globalCompositeOperation = "source-over";
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
