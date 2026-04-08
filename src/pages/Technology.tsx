import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import TechFlowchart from "@/components/TechFlowchart";
// import NetworkCanvas from "@/components/NetworkCanvas";
// import StarCanvas from "@/components/StarCanvas";

export default function Technology() {
  return (
    <>
      {/* Wallpaper background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${import.meta.env.BASE_URL}wallpaper-earth.jpg')`,
          zIndex: 0,
        }}
      >
        {/* Dark overlay to keep content legible */}
        <div className="absolute inset-0" style={{ background: "rgba(8,12,28,0.72)" }} />
      </div>

      <div className="relative min-h-screen" style={{ zIndex: 1 }}>
        <Navbar />

        {/* Hero */}
        <section className="pt-32 pb-12 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="inline-block px-4 py-1.5 text-xs font-body font-medium tracking-widest uppercase text-secondary border border-secondary/20 rounded-full mb-8 bg-secondary/5">
              Platform Architecture
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="font-display font-light text-5xl md:text-6xl leading-tight mb-6 text-glow"
          >
            <span className="text-foreground">Our</span>{" "}
            <span className="text-primary">Technology</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto font-body leading-relaxed"
          >
            A fully integrated global economic intelligence stack — linking global
            trade and transport network models to national CGE and quantitative
            regional models, extrapolated using hyper-local vector embeddings — with AI at its core.
          </motion.p>
        </section>

        {/* Flowchart — no enclosing box */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9 }}
          className="px-6 pb-16 max-w-6xl mx-auto"
        >
          <TechFlowchart />
        </motion.section>

        <footer className="pb-8 text-center">
          <p className="text-[11px] text-white/40 font-body tracking-wide">
            © 2026 Advanced Economic Intelligence Labs. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
