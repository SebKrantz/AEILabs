import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import NetworkCanvas from "@/components/NetworkCanvas";

interface ComingSoonProps {
  title: string;
}

export default function ComingSoon({ title }: ComingSoonProps) {
  return (
    <>
      <NetworkCanvas />

      <div className="relative min-h-screen flex flex-col" style={{ zIndex: 1 }}>
        <Navbar />

        {/* Centred content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="inline-block px-4 py-1.5 text-xs font-body font-medium tracking-widest uppercase text-secondary border border-secondary/20 rounded-full mb-8 bg-secondary/5">
              {title}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="font-display font-light text-5xl md:text-6xl leading-tight mb-6 text-glow"
          >
            <span className="text-foreground">AEI</span>{" "}
            <span className="text-primary">Labs</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-muted-foreground text-lg max-w-md mx-auto font-body leading-relaxed"
          >
            This section is under construction.
          </motion.p>
        </div>

        {/* Footer */}
        <footer className="pb-8 text-center">
          <p className="text-[11px] text-white/40 font-body tracking-wide">
            © 2026 Advanced Economic Intelligence
          </p>
        </footer>
      </div>
    </>
  );
}
