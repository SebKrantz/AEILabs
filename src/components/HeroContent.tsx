import { motion } from "framer-motion";

export default function HeroContent() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
      <div className="max-w-4xl mx-auto text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 text-xs font-body font-medium tracking-widest uppercase text-secondary border border-secondary/20 rounded-full mb-8 bg-secondary/5">
            Global Spatial Economic Intelligence
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="font-display font-light text-5xl md:text-7xl leading-tight mb-6 text-glow"
        >
          <span className="text-foreground">Reenvisioning the</span>
          <br />
          <span className="text-primary">Global Economy</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 font-body leading-relaxed"
        >
          Economic Intelligence linking global trade and transport network models to national CGE and quantitative regional models, extended by local population embeddings
           — trace shocks from global to local, plan infrastructure at any scale, simulate the impact of economic policies, and reenvision the World — using simple chat or expert interfaces.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="flex items-center justify-center gap-4 pointer-events-auto"
        >
          <button className="px-8 py-3 font-display font-medium text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 shadow-lg shadow-primary/20">
            Explore Platform
          </button>
          <button className="px-8 py-3 font-display font-medium text-sm rounded-lg border border-border text-foreground hover:border-primary/40 hover:text-primary transition-colors duration-200">
            Learn More
          </button>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
