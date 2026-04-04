import { useState } from "react";
import { motion } from "framer-motion";

const NAV_ITEMS = ["Solutions", "Technology", "Company"];

export default function Navbar() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md"
      style={{ backgroundColor: "hsl(228 50% 6% / 0.7)" }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="text-primary font-display font-bold text-sm">Æ</span>
          </div>
          <span className="font-display font-semibold text-foreground text-sm tracking-wide">
            Advanced Economic Intelligence
          </span>
        </div>

        {/* Centered tabs */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              onClick={() => setActive(item)}
              className={`relative px-5 py-2 text-sm font-body transition-colors duration-200 rounded-md ${
                active === item
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item}
              {active === item && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-2 right-2 h-px bg-primary"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* CTA */}
        <button className="px-4 py-2 text-sm font-body font-medium rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors duration-200">
          Request Access
        </button>
      </div>
    </motion.nav>
  );
}
