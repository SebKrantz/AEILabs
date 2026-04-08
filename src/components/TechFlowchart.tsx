import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

/* ─── constants ───────────────────────────────────────────────── */
const VBW = 1000;
const VBH = 790;
const HW = 108;         // box half-width in SVG units
const HH = 45;          // box half-height
const ARROW_GAP = 7;    // perpendicular separation between parallel arrows
const LABEL_GAP = 35;   // perpendicular offset of labels from the connection centre-line
const EDGE_BUFFER = 16; // extra clearance so offset arrowheads don't enter boxes

// Approximate centre of the diamond (used to determine "outward" direction)
const DIAMOND_CX = 500;
const DIAMOND_CY = 340;

/* ─── helpers ─────────────────────────────────────────────────── */
/** Intersection of the ray from (cx,cy) toward (tx,ty) with the box boundary,
 *  expanded by EDGE_BUFFER to keep offset arrowheads clear of box edges. */
function edgePt(cx: number, cy: number, tx: number, ty: number): [number, number] {
  const dx = tx - cx, dy = ty - cy;
  const sx = Math.abs(dx) > 0.01 ? (HW + EDGE_BUFFER) / Math.abs(dx) : 1e9;
  const sy = Math.abs(dy) > 0.01 ? (HH + EDGE_BUFFER) / Math.abs(dy) : 1e9;
  const t = Math.min(sx, sy);
  return [cx + dx * t, cy + dy * t];
}

/** Intersection of a ray from (cx,cy) toward (tx,ty) with an ellipse of
 *  radii (HW+EDGE_BUFFER, HH+EDGE_BUFFER) — used for the AI oval node. */
function edgePtEllipse(cx: number, cy: number, tx: number, ty: number): [number, number] {
  const dx = tx - cx, dy = ty - cy;
  const rx = HW + EDGE_BUFFER, ry = HH + EDGE_BUFFER;
  // Parametric: t such that (dx·t/rx)²+(dy·t/ry)²=1
  const t = 1 / Math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2);
  return [cx + dx * t, cy + dy * t];
}

/** CCW perpendicular unit vector of a line segment. */
function perpCCW(x1: number, y1: number, x2: number, y2: number): [number, number] {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return [-dy / len, dx / len];
}

/** Perpendicular unit vector that always points AWAY from the diamond centre.
 *  Guarantees the forward (from→to) arrow sits on the outer edge of each diagonal,
 *  and the back (to→from) arrow sits on the inner edge — making the diamond symmetric. */
function outwardPerp(x1: number, y1: number, x2: number, y2: number): [number, number] {
  const [px, py] = perpCCW(x1, y1, x2, y2);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  // dot > 0 → perpCCW points toward the diamond centre → flip it
  return (px * (DIAMOND_CX - mx) + py * (DIAMOND_CY - my) > 0) ? [-px, -py] : [px, py];
}

/* ─── data ────────────────────────────────────────────────────── */
interface NodeDef {
  id: string;
  svgX: number; svgY: number;
  category: string;
  line1: string; line2?: string;
  detail: string;
  bullets: string[];
  note: string; // additional technical context shown below bullets
}

const NODES: NodeDef[] = [
  {
    id: "qtm", svgX: 500, svgY: 80,
    category: "Global Trade",
    line1: "New Quantitative Trade Model",
    line2: "(I-O Linkages, ~60 Sectors)",
    detail: "A new-generation Quantitative Trade Model with multi-sector input-output linkages covering the full global economy. Calibrated to GTAP/WIOD data, it resolves bilateral trade flows at the sector level and propagates policy shocks through international supply chains.",
    bullets: ["Gravity-based bilateral trade flows", "Multi-sector input-output linkages", "Policy shock simulation (tariffs, NTBs)", "Feeds national CGE via trade policy signals"],
    note: "QTMs follow the structural gravity tradition of Eaton & Kortum (2002) and Caliendo & Parro (2015), combining CES preferences, iceberg trade costs, and Ricardian comparative advantage. The input-output extension allows tariff shocks to propagate upstream and downstream across sectors, capturing global value chain effects that single-sector models miss.",
  },
  {
    id: "cge", svgX: 175, svgY: 340,
    category: "National Models",
    line1: "National CGE Models",
    line2: "(SAM-based, Multi-Sector)",
    detail: "Country-level Computable General Equilibrium models built on Social Accounting Matrices. Simultaneously clears goods, factor, and institutional accounts — capturing domestic production, household income, government flows, and the external balance.",
    bullets: ["SAM-based: activities, commodities, factors, institutions", "Fixed exchange rate closure", "Links to trade model via export/import shocks", "Calibrated for 50+ countries"],
    note: "The Social Accounting Matrix provides the circular-flow accounting structure linking firms, households, government, and the rest of the world. A fixed exchange rate closure is standard for pegged-currency economies, with foreign savings adjusting to clear the external account. Factor market closures determine whether capital and labor are mobile across sectors between periods.",
  },
  {
    id: "transport", svgX: 825, svgY: 340,
    category: "Global Transport",
    line1: "Global Multimodal Transport",
    line2: "(5 Modes, ~4,000 Centroids)",
    detail: "A global multimodal transport model covering five modes: road, rail, inland waterway, maritime, and air. Resolves trade flows onto ~4,000 spatial centroids worldwide, mapping observed and counterfactual freight flows along the physical network.",
    bullets: ["5 modes: road, rail, IWT, shipping, air", "~4,000 global OD centroids", "Assigns trade flows to least-cost network paths", "Passes connectivity changes to the regional model"],
    note: "Trade flows are assigned to the network using generalised transport costs — combining distance, travel time, and mode-specific tariffs — via least-cost path algorithms. New infrastructure enters as reductions in link costs or capacity expansions, shifting flows and lowering trade costs between connected regions. These connectivity changes are then passed to the regional model as changes in market access.",
  },
  {
    id: "regional", svgX: 500, svgY: 560,
    category: "Regional Models",
    line1: "Quantitative Regional Models",
    line2: "(Mobile Labor, ADM1/2 Regions)",
    detail: "Quantitative spatial equilibrium models with mobile labor at ADM1/ADM2 resolution. Endogenous population sorting driven by wages, amenities, and connectivity — linking national macro shocks to sub-national distributional outcomes.",
    bullets: ["Mobile labor across regions", "Wage and amenity-driven population sorting", "Receives productivity & connectivity shocks", "Exports local welfare to AETHER layer"],
    note: "These models follow the quantitative spatial economics tradition of Redding & Rossi-Hansberg (2017). Workers sort across regions trading off wages against local amenities and commuting costs, while firms locate where productivity and market access are highest. The model produces sub-national distributions of wages, population density, land rents, and welfare — the key layer for assessing distributional impacts of macro-level shocks.",
  },
  {
    id: "ai", svgX: 500, svgY: 340,
    category: "Agentic AI",
    line1: "Planning, Parameterization,",
    line2: "Simulation, and Reporting",
    detail: "Four types of specialized agents orchestrate the complete model stack — from a natural language request to a final compiled report.",
    bullets: [
      "<b>Planning Agent</b>: reads the user request, maps it to relevant models and their linkages, asks clarifying follow-up questions, then outputs a structured execution plan and calls the parameterization agents",
      "<b>Parameterization Agents</b>: model-specific agents with deep knowledge of each model's capabilities and parameters; translate the applicable portion of the plan into concrete model configurations",
      "<b>Simulation Agents</b>: take the model-specific plan from the relevant parameterization agent, execute the simulation, collect results to temporary files, and autonomously debug or adjust parameters if something goes wrong",
      "<b>Reporting Agents (two-layer)</b>: first layer collects and validates simulation outputs, parsing results into a tidy form; second layer synthesizes a final report, delegating to sub-agents for data analysis and plotting, then calls Word or LaTeX compilers",
    ],
    note: "By default the system runs in fully-agentic mode — the planning agent decides which models are needed and the remaining agents execute end-to-end without user intervention. An expert mode is also available, allowing advanced users to inspect and adjust key model parameters and internal agent prompts before triggering a simulation.",
  },
  {
    id: "aether", svgX: 500, svgY: 720,
    category: "Super-Resolution",
    line1: "AETHER Vector Embeddings",
    line2: "(10m Resolution, POI-Enriched)",
    detail: "AETHER (AlphaEarth-POI Enriched Representation Learning for Human-Centered Urban Analysis): 10m-resolution vector embeddings encoding the built environment, demographics, and economic activity for hyper-local welfare extrapolation.",
    bullets: ["10m spatial resolution", "Encodes POIs, built form & socio-demographics", "Hyper-local welfare & price extrapolation", "Can localize sectoral production for CGE/QRM linkages"],
    note: "Embeddings are trained via contrastive representation learning on multi-source geospatial data: satellite imagery, points of interest, road networks, and census indicators. The resulting feature vectors capture fine-grained variation in the built environment that top-down models cannot resolve. Beyond welfare extrapolation, they can localize sectoral production estimates from the CGE and regional layers, enabling deeper integration across the full model stack.",
  },
];

interface EdgeDef {
  id: string; from: string; to: string;
  labelFwd: string[];
  labelBck: string[]; // empty → one-way arrow
  labelGap?: number;  // per-edge override for label distance
  aiArrow?: boolean;  // AI-control edge: dashed blue, no label
}

const EDGES: EdgeDef[] = [
  // AI control arrows — rendered first (behind model edges and nodes)
  { id: "ai-qtm",       from: "ai", to: "qtm",       labelFwd: [], labelBck: [], aiArrow: true },
  { id: "ai-cge",       from: "ai", to: "cge",       labelFwd: [], labelBck: [], aiArrow: true },
  { id: "ai-transport", from: "ai", to: "transport", labelFwd: [], labelBck: [], aiArrow: true },
  { id: "ai-regional",  from: "ai", to: "regional",  labelFwd: [], labelBck: [], aiArrow: true },
  // Model-to-model bidirectional edges
  { id: "qtm-cge",            from: "qtm",      to: "cge",
    labelFwd: ["Trade Flows /", "Policy Changes"],
    labelBck: ["Sectoral Shocks /", "National Policies"] },
  { id: "qtm-transport",      from: "qtm",      to: "transport",
    labelFwd: ["Trade Flows /", "Policy Changes"],
    labelBck: ["New Infrastructure /", "Disruptions"] },
  { id: "cge-regional",       from: "cge",      to: "regional",
    // CGE→Regional: national shocks propagate to regions
    labelFwd: ["Shocks to Regional", "Productivity / Amenity"],
    // Regional→CGE: regional disparities feed back to national model
    labelBck: ["Inter-Regional Inequality", "& Connectivity"] },
  { id: "transport-regional", from: "transport", to: "regional",
    // Transport→Regional: infrastructure / connectivity changes
    labelFwd: ["Infrastructure &", "Connectivity Changes"],
    // Regional→Transport: welfare / population changes affect trade demand
    labelBck: ["Welfare / Population /", "Demand Shifts"] },
  { id: "regional-aether",    from: "regional", to: "aether",
    labelFwd: ["Local Welfare &", "Prices Extrapolation"],
    labelBck: [], labelGap: 50 },
];

/* ─── SVG sub-components ──────────────────────────────────────── */
const MAGENTA = "220, 50, 138";                         // vivid magenta – AI elements only
const ARROW_STROKE = "rgba(255,255,255,0.30)";        // regular arrows: white (unchanged)
const AI_ARROW_STROKE = `rgba(${MAGENTA},0.65)`;
const FF = "Inter, system-ui, sans-serif";

const LBL_LINE_H = 13; // line height between tspan lines

/** Arrow label — plain text beside the arrow line. */
function ArrowLabel({ x, y, lines }: { x: number; y: number; lines: string[] }) {
  if (!lines.length) return null;
  const isSingle = lines.length === 1;
  return (
    <text textAnchor="middle" fontSize={8.5} fontFamily={FF}
          fill="rgba(148,163,184,0.9)" filter="url(#lbl-shadow)">
      {isSingle
        ? <tspan dominantBaseline="middle" x={x} y={y}>{lines[0]}</tspan>
        : <>
            <tspan x={x} y={y - 6}>{lines[0]}</tspan>
            <tspan x={x} dy={LBL_LINE_H}>{lines[1]}</tspan>
          </>
      }
    </text>
  );
}

function EdgeLine({ edge, nodeMap }: { edge: EdgeDef; nodeMap: Map<string, NodeDef> }) {
  const fn = nodeMap.get(edge.from)!;
  const tn = nodeMap.get(edge.to)!;
  const [ex1, ey1] = edgePt(fn.svgX, fn.svgY, tn.svgX, tn.svgY);
  const [ex2, ey2] = edgePt(tn.svgX, tn.svgY, fn.svgX, fn.svgY);

  // AI control arrows: start from ellipse boundary, end at model box boundary
  if (edge.aiArrow) {
    const [ax1, ay1] = edgePtEllipse(fn.svgX, fn.svgY, tn.svgX, tn.svgY);
    return (
      <line x1={ax1} y1={ay1} x2={ex2} y2={ey2}
            stroke={AI_ARROW_STROKE} strokeWidth={1}
            strokeDasharray="5,4" markerEnd="url(#ah-ai)" />
    );
  }
  // outwardPerp ensures the forward (from→to) arrow is always on the outer
  // side of the diamond and the back arrow on the inner side — symmetric layout.
  const [px, py] = outwardPerp(ex1, ey1, ex2, ey2);
  const isBidir = edge.labelBck.length > 0;

  if (!isBidir) {
    const mx = (ex1 + ex2) / 2, my = (ey1 + ey2) / 2;
    const gap = edge.labelGap ?? LABEL_GAP;
    return (
      <g>
        <line x1={ex1} y1={ey1} x2={ex2} y2={ey2}
              stroke={ARROW_STROKE} strokeWidth={1} markerEnd="url(#ah)" />
        <ArrowLabel x={mx - px * gap} y={my - py * gap} lines={edge.labelFwd} />
      </g>
    );
  }

  // Forward arrow: offset +ARROW_GAP in perp direction (from→to)
  const fwd = {
    x1: ex1 + px * ARROW_GAP, y1: ey1 + py * ARROW_GAP,
    x2: ex2 + px * ARROW_GAP, y2: ey2 + py * ARROW_GAP,
  };
  // Back arrow: offset -ARROW_GAP in perp direction (to→from)
  const bck = {
    x1: ex2 - px * ARROW_GAP, y1: ey2 - py * ARROW_GAP,
    x2: ex1 - px * ARROW_GAP, y2: ey1 - py * ARROW_GAP,
  };
  const fmx = (fwd.x1 + fwd.x2) / 2, fmy = (fwd.y1 + fwd.y2) / 2;
  const bmx = (bck.x1 + bck.x2) / 2, bmy = (bck.y1 + bck.y2) / 2;

  return (
    <g>
      <line x1={fwd.x1} y1={fwd.y1} x2={fwd.x2} y2={fwd.y2}
            stroke={ARROW_STROKE} strokeWidth={1} markerEnd="url(#ah)" />
      {/* Label on the outside of the forward arrow */}
      <ArrowLabel x={fmx + px * LABEL_GAP} y={fmy + py * LABEL_GAP} lines={edge.labelFwd} />

      <line x1={bck.x1} y1={bck.y1} x2={bck.x2} y2={bck.y2}
            stroke={ARROW_STROKE} strokeWidth={1} markerEnd="url(#ah)" />
      {/* Label on the outside of the back arrow */}
      <ArrowLabel x={bmx - px * LABEL_GAP} y={bmy - py * LABEL_GAP} lines={edge.labelBck} />
    </g>
  );
}

function AINodeBox({ node, isActive, onClick }: { node: NodeDef; isActive: boolean; onClick: () => void }) {
  const { svgX: cx, svgY: cy } = node;
  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      {/* Invisible oval hit area */}
      <ellipse cx={cx} cy={cy} rx={HW} ry={HH} fill="transparent" />
      {/* Symmetric glow — same geometry as crisp outline; blur spreads equally inside and out */}
      <ellipse cx={cx} cy={cy} rx={HW} ry={HH}
               fill="none"
               stroke={isActive ? `rgba(${MAGENTA},0.9)` : `rgba(${MAGENTA},0.50)`}
               strokeWidth={2}
               filter="url(#oval-glow)" />
      {/* Crisp oval outline on top */}
      <ellipse cx={cx} cy={cy} rx={HW} ry={HH}
               fill={isActive ? `rgba(${MAGENTA},0.10)` : "rgba(3,8,20,0.96)"}
               stroke={isActive ? `rgba(${MAGENTA},1)` : `rgba(${MAGENTA},0.85)`}
               strokeWidth={isActive ? 2 : 1.5} />
      <text x={cx} y={cy - 21} textAnchor="middle" dominantBaseline="middle"
            fontSize={9} fill={`rgba(${MAGENTA},0.85)`} fontFamily={FF} fontWeight="600" letterSpacing="1.5">
        {node.category.toUpperCase()}
      </text>
      <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="middle"
            fontSize={12} fill="rgba(228,233,245,0.95)" fontFamily={FF} fontWeight="500">
        {node.line1}
      </text>
      {node.line2 && (
        <text x={cx} y={cy + 13} textAnchor="middle" dominantBaseline="middle"
              fontSize={12} fill="rgba(228,233,245,0.95)" fontFamily={FF} fontWeight="500">
          {node.line2}
        </text>
      )}
    </g>
  );
}

function NodeBox({ node, isActive, onClick }: { node: NodeDef; isActive: boolean; onClick: () => void }) {
  if (node.id === "ai") return <AINodeBox node={node} isActive={isActive} onClick={onClick} />;
  const { svgX: cx, svgY: cy } = node;
  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      {/* invisible hit area */}
      <rect x={cx - HW} y={cy - HH} width={HW * 2} height={HH * 2} fill="transparent" />
      {/* box — rx=0 → sharp corners */}
      <rect
        x={cx - HW} y={cy - HH} width={HW * 2} height={HH * 2} rx={0}
        fill={isActive ? "rgba(74,127,212,0.10)" : "rgba(3,8,20,0.7)"}
        stroke={isActive ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.65)"}
        strokeWidth={isActive ? 1.5 : 1}
      />
      <text x={cx} y={cy - 16} textAnchor="middle" dominantBaseline="middle"
            fontSize={9} fill="rgba(74,127,212,0.9)" fontFamily={FF} fontWeight="600" letterSpacing="1.5">
        {node.category.toUpperCase()}
      </text>
      <text x={cx} y={cy + 2} textAnchor="middle" dominantBaseline="middle"
            fontSize={12} fill="rgba(228,233,245,0.95)" fontFamily={FF} fontWeight="500">
        {node.line1}
      </text>
      {node.line2 && (
        <text x={cx} y={cy + 19} textAnchor="middle" dominantBaseline="middle"
              fontSize={12} fill="rgba(228,233,245,0.95)" fontFamily={FF} fontWeight="500">
          {node.line2}
        </text>
      )}
    </g>
  );
}

/** Renders a bullet string, turning <b>text</b> segments into primary-coloured bold spans. */
function renderBullet(text: string): React.ReactNode {
  const parts = text.split(/(<b>.*?<\/b>)/g);
  return parts.map((part, i) => {
    const m = part.match(/^<b>(.*?)<\/b>$/);
    return m
      ? <span key={i} className="text-white/80 font-semibold">{m[1]}</span>
      : <span key={i}>{part}</span>;
  });
}

function DetailPanel({ node, onClose }: { node: NodeDef; onClose: () => void }) {
  const isAI = node.id === "ai";
  const magentaAccent = `rgba(${MAGENTA}, 0.85)`;
  const magentaDot    = `rgba(${MAGENTA}, 0.70)`;
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.22 }}
      /* Fixed to viewport, below navbar (top-16 = 64px), sharp corners.
         Matches active node: same primary-blue fill at 10% opacity + blur. */
      className="fixed right-0 top-16 bottom-0 w-80 p-6 z-40 overflow-y-auto flex flex-col backdrop-blur-md"
      style={{ background: "rgba(74,127,212,0.10)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <span
          className="text-[10px] font-body font-semibold tracking-widest uppercase text-primary"
          style={isAI ? { color: magentaAccent } : {}}
        >
          {node.category}
        </span>
        <button
          onClick={onClose}
          className="text-white/30 hover:text-white/80 transition-colors text-xl leading-none"
        >×</button>
      </div>

      <h3
        className="font-display text-sm font-semibold text-white leading-snug mb-4"
      >
        {node.line1}{node.line2 ? ` ${node.line2}` : ""}
      </h3>

      <p className="text-xs text-white/55 leading-relaxed">{node.detail}</p>

      {/* Spacer between description and bullets */}
      <div className="h-px bg-white/8 my-3" />

      <ul className="space-y-3">
        {node.bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-3 text-xs text-white/50">
            <span
              className="w-1.5 h-1.5 rounded-full bg-primary/70 flex-shrink-0 mt-1"
              style={isAI ? { backgroundColor: magentaDot } : {}}
            />
            <span>{renderBullet(b)}</span>
          </li>
        ))}
      </ul>

      <div className="h-px bg-white/8 my-3" />

      <p className="text-xs text-white/35 leading-relaxed italic">{node.note}</p>
    </motion.div>
  );
}

/* ─── Main export ─────────────────────────────────────────────── */
export default function TechFlowchart() {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedNode = NODES.find(n => n.id === selected) ?? null;
  const nodeMap = new Map(NODES.map(n => [n.id, n]));

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: `${VBW} / ${VBH}` }}
    >
      <svg
        className="absolute inset-0 w-full h-full select-none"
        viewBox={`0 0 ${VBW} ${VBH}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Subtle dark drop-shadow for arrow labels — improves legibility over imagery */}
          <filter id="lbl-shadow" x="-20%" y="-40%" width="140%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.2" floodColor="rgba(0,0,0,0.90)" />
          </filter>
          {/* Standard white arrowhead */}
          <marker id="ah" markerUnits="userSpaceOnUse"
                  markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
            <path d="M0,0 L10,4 L0,8 z" fill="white" />
          </marker>
          {/* Magenta arrowhead for AI control edges */}
          <marker id="ah-ai" markerUnits="userSpaceOnUse"
                  markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
            <path d="M0,0 L10,4 L0,8 z" fill={`rgba(${MAGENTA},0.9)`} />
          </marker>
          {/* Oval border glow — blurs the stroke into a soft blue halo */}
          <filter id="oval-glow" x="-25%" y="-60%" width="150%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* AI control edges first — sit behind model edges and nodes */}
        {EDGES.filter(e => e.aiArrow).map(e => <EdgeLine key={e.id} edge={e} nodeMap={nodeMap} />)}
        {/* Model-to-model edges */}
        {EDGES.filter(e => !e.aiArrow).map(e => <EdgeLine key={e.id} edge={e} nodeMap={nodeMap} />)}
        {/* Non-AI nodes */}
        {NODES.filter(n => n.id !== "ai").map(n => (
          <NodeBox key={n.id} node={n} isActive={selected === n.id}
                   onClick={() => setSelected(p => p === n.id ? null : n.id)} />
        ))}
        {/* AI node rendered last — sits on top of arrows */}
        {NODES.filter(n => n.id === "ai").map(n => (
          <NodeBox key={n.id} node={n} isActive={selected === n.id}
                   onClick={() => setSelected(p => p === n.id ? null : n.id)} />
        ))}
      </svg>

      {createPortal(
        <AnimatePresence>
          {selectedNode && <DetailPanel node={selectedNode} onClose={() => setSelected(null)} />}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
