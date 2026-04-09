import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

/* ─── Solution data ───────────────────────────────────────────── */
interface Solution {
  number: string;
  image?: string;           // single background image filename under public/
  images?: [string, string]; // [left, right] split — used instead of image
  category: string;
  title: string;
  description: string;
  bullets: string[];
}

const BASE = import.meta.env.BASE_URL;

const SOLUTIONS: Solution[] = [
  {
    number: "01",
    image: "sol-trade.jpg",
    category: "Trade & Supply Chains",
    title: "Global Trade and Supply Chain Intelligence",
    description:
      "Understand the full ripple effects of trade policy shifts — from Trump Tariffs to MERCOSUR and AfCFTA — and infrastructure disruptions such as Middle East shipping route closures. Our integrated model stack traces shocks through global production networks to their impacts on national and regional welfare, productivity, output, prices, and macroeconomic balances, giving policymakers and businesses a decisive analytical edge.",
    bullets: [
      "Simulate welfare and output impacts of bilateral or multilateral tariff changes at sectoral and national level",
      "Model infrastructure disruptions — port closures, shipping route shifts — and their cascading effects across supply chains",
      "Quantify trade diversion, price transmission, and competitiveness shifts for specific industries or countries",
      "Build strategic resilience by anticipating and stress-testing policy scenarios before they materialise",
    ],
  },
  {
    number: "02",
    image: "sol-infra.jpg",
    category: "Infrastructure",
    title: "Global Infrastructure Intelligence",
    description:
      "Evaluate the economic returns to major infrastructure investments — ports, transport corridors, energy grids, digital networks — at regional and global scales. Simulate how connectivity improvements reshape international trade flows, sectoral productivity, welfare distribution, and advanced indicators including food security and inter-regional inequality. Compare alternative project designs through rigorous counterfactual scenario analysis.",
    bullets: [
      "Quantify the trade and productivity gains from proposed infrastructure corridors and connectivity projects",
      "Compare alternative project locations and specifications through counterfactual investment simulation",
      "Assess distributional effects — who gains, who loses, and how to optimise equity-efficiency trade-offs",
      "Measure knock-on impacts on food security, commodity access, and inter-regional inequality",
    ],
  },
  {
    number: "03",
    images: ["sol-hyper-prices.jpg", "sol-hyper-welfare.jpg"],
    category: "Hyper-Local Analytics",
    title: "Hyper-Local Price Changes and Welfare Impacts",
    description:
      "Our regional models and AETHER hyper-local extrapolation layer translate global economic dynamics into granular forecasts of price changes and welfare impacts — down to sub-municipal resolution. Map market-relevant intelligence at spatial scales previously unavailable to policymakers and investors, combining global macro consistency with unprecedented local precision.",
    bullets: [
      "Translate global supply chain shocks into neighbourhood-level price and welfare impact maps",
      "Identify vulnerable communities and economic hotspots with precision spatial targeting",
      "Support targeted mitigation policy by pinpointing which localities are most exposed to external shocks",
      "Combine global macro consistency with hyper-local spatial resolution for multi-scale analytical coherence",
    ],
  },
  {
    number: "04",
    image: "sol-industry.jpg",
    category: "Industrial Policy",
    title: "Intelligence for National Industrial Policy",
    description:
      "Simulate the cascading effects of industrial policy interventions across national industries, household income groups, government fiscal balances, subnational regions, and the global economy simultaneously. This multi-scale intelligence enables comprehensive design and fine-tuning of policy packages — a strategic advantage our framework is uniquely equipped to provide.",
    bullets: [
      "Evaluate cross-sectoral spillovers and input-output linkages from subsidies, tariffs, or R&D incentives",
      "Assess distributional impacts across household income groups and subnational regions",
      "Quantify fiscal multipliers and government revenue effects of policy interventions",
      "Stress-test industrial strategy against global demand shocks, trade retaliation, and energy price scenarios",
    ],
  },
  {
    number: "05",
    image: "sol-regional.jpg",
    category: "Regional Development",
    title: "Regional Economic Intelligence",
    description:
      "Simulate how local productivity improvements, targeted infrastructure investments, or regional development policies ripple through labour markets, commodity prices, welfare, and inequality. Link subnational dynamics to national industry models in data-rich country contexts, and use AETHER hyper-local extrapolations to design and evaluate targeted interventions with spatial precision.",
    bullets: [
      "Model regional labour reallocation and migration responses to local productivity or infrastructure shocks",
      "Quantify welfare and inequality effects within and across subnational regions",
      "Link regional dynamics to national sectoral models in data-rich country contexts",
      "Use AETHER extrapolations to identify where mitigation measures are needed following regional interventions",
    ],
  },
];

/* ─── Scroll-triggered fade-up wrapper ───────────────────────── */
function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Main export ─────────────────────────────────────────────── */
export default function Solutions() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <span className="inline-block px-4 py-1.5 text-xs font-body font-medium tracking-widest uppercase text-secondary border border-secondary/20 rounded-full mb-8 bg-secondary/5">
            Platform Solutions
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-display font-light text-5xl md:text-6xl leading-tight mb-6 text-glow"
        >
          <span className="text-foreground">Our</span>{" "}
          <span className="text-primary">Solutions</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-muted-foreground text-lg max-w-2xl mx-auto font-body leading-relaxed"
        >
          Five integrated intelligence modules — each solving a distinct
          dimension of global economic analysis, all powered by the same
          unified model stack.
        </motion.p>
      </section>

      {/* ── Solution stripes ──────────────────────────────────── */}
      <div className="flex flex-col">
        {SOLUTIONS.map((sol, i) => (
          <div key={sol.number}>
            {/* Divider above (except first) */}
            {i > 0 && <div className="border-t border-white/5" />}

            {/* Image stripe */}
            <div className="relative h-[55vh] w-full overflow-hidden">
              {sol.images ? (
                /* Split image: left half + right half */
                <div className="absolute inset-0 flex">
                  <div
                    className="w-1/2 h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${BASE}${sol.images[0]}')` }}
                  />
                  <div
                    className="w-1/2 h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${BASE}${sol.images[1]}')` }}
                  />
                </div>
              ) : (
                /* Single image */
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${BASE}${sol.image}')` }}
                />
              )}
              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(8,12,28,0.30) 0%, rgba(8,12,28,0.72) 100%)",
                }}
              />

              {/* Solution number badge — top left */}
              <FadeUp delay={0.1} className="absolute top-8 left-8 md:left-12">
                <span className="inline-block px-3 py-1 text-xs font-body font-medium tracking-widest uppercase text-secondary border border-secondary/30 rounded-full bg-secondary/10">
                  {sol.number} — {sol.category}
                </span>
              </FadeUp>

              {/* Title — bottom left */}
              <FadeUp
                delay={0.2}
                className="absolute bottom-0 left-0 pb-10 pl-8 md:pl-12 pr-8 md:pr-1/2"
              >
                <h2
                  className="font-display font-light text-3xl md:text-5xl text-white leading-tight"
                  style={{ textShadow: "0 2px 16px rgba(0,0,0,0.75)" }}
                >
                  {sol.title}
                </h2>
              </FadeUp>
            </div>

            {/* Text stripe */}
            <div className="py-14 px-6 bg-background">
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                {/* Description */}
                <FadeUp delay={0.05}>
                  <p className="text-white/65 text-base font-body leading-relaxed">
                    {sol.description}
                  </p>
                </FadeUp>

                {/* Bullets */}
                <FadeUp delay={0.15}>
                  <ul className="space-y-3">
                    {sol.bullets.map((b, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-3 text-sm text-white/55 font-body leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0 mt-[6px]" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </FadeUp>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="pb-8 pt-4 text-center border-t border-white/5">
        <p className="text-[11px] text-white/40 font-body tracking-wide">
          © 2026 Advanced Economic Intelligence Labs. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
