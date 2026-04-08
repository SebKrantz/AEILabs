import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS: { label: string; path: string }[] = [
  { label: "Solutions", path: "/solutions" },
  { label: "Technology", path: "/technology" },
  { label: "Company", path: "/company" },
];

export default function Navbar() {
  const location = useLocation();

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
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="text-primary font-display font-bold text-2xl">Æ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="leading-tight">
              <div className="text-[10px] font-display font-semibold text-foreground">Advanced</div>
              <div className="text-[10px] font-display font-semibold text-foreground">Economic</div>
              <div className="text-[10px] font-display font-semibold text-foreground">Intelligence</div>
            </div>
            <span className="text-3xl font-display font-light text-foreground">Labs</span>
          </div>
        </Link>

        {/* Centered tabs */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`relative px-5 py-2 text-sm font-body transition-colors duration-200 rounded-md ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-px bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <button className="px-4 py-2 text-sm font-body font-medium rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors duration-200">
          Request Demo
        </button>
      </div>
    </motion.nav>
  );
}
