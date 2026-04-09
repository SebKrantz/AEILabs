import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS: { label: string; path: string }[] = [
  { label: "Solutions", path: "/solutions" },
  { label: "Technology", path: "/technology" },
  { label: "Company", path: "/company" },
];

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md"
        style={{ backgroundColor: "hsl(228 50% 6% / 0.7)" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0" onClick={() => setOpen(false)}>
            <span className="font-display font-bold leading-none" style={{ fontSize: "2.8rem", color: "hsl(220 65% 46%)" }}>Æ</span>
            <div className="flex items-center gap-2">
              <div className="leading-tight">
                <div className="text-[10px] font-display font-semibold text-foreground">Advanced</div>
                <div className="text-[10px] font-display font-semibold text-foreground">Economic</div>
                <div className="text-[10px] font-display font-semibold text-foreground">Intelligence</div>
              </div>
              {/* <span className="text-3xl font-display font-light text-foreground">Labs</span> */}
            </div>
          </Link>

          {/* Desktop: centered tabs */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
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

          {/* Desktop: CTA */}
          <button className="hidden md:block px-4 py-2 text-sm font-body font-medium rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors duration-200">
            Request Demo
          </button>

          {/* Mobile: hamburger button */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-md hover:bg-white/5 transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <motion.span
              animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              className="block w-5 h-px bg-foreground/80 origin-center"
            />
            <motion.span
              animate={open ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="block w-5 h-px bg-foreground/80"
            />
            <motion.span
              animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              className="block w-5 h-px bg-foreground/80 origin-center"
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden border-b border-border/50 backdrop-blur-md"
            style={{ backgroundColor: "hsl(228 50% 6% / 0.95)" }}
          >
            <div className="flex flex-col px-6 py-4 gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={`px-3 py-3 text-sm font-body rounded-md transition-colors duration-200 ${
                      isActive
                        ? "text-primary bg-primary/8"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="mt-2 pt-3 border-t border-border/40">
                <button className="w-full px-4 py-2.5 text-sm font-body font-medium rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors duration-200">
                  Request Demo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
