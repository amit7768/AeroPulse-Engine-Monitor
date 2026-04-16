"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  BarChart3,
  Bot,
  ChevronRight,
  Database,
  Gauge,
  Home,
  Info,
  Menu,
  X,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/about", label: "About", icon: Info },
  { href: "/dataset", label: "Dataset", icon: Database },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/result", label: "Results", icon: Gauge },
  { href: "/chat", label: "AI Assistant", icon: Bot },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[rgba(2,8,18,0.95)] backdrop-blur-xl border-b border-[rgba(0,229,255,0.15)] shadow-[0_4px_30px_rgba(0,229,255,0.08)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-full border-2 border-[var(--cyan-glow)] glow-cyan-sm flex items-center justify-center">
                <Activity className="w-4 h-4 text-[var(--cyan-glow)]" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-[var(--cyan-glow)] opacity-40 scale-125 animate-ping" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-widest text-white font-mono-aerospace">
                AERO
              </span>
              <span className="text-lg font-bold tracking-widest gradient-text-cyan font-mono-aerospace">
                PULSE
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-4 py-2 flex items-center gap-2 text-sm font-medium transition-all duration-200 rounded group ${
                    active
                      ? "text-[var(--cyan-glow)]"
                      : "text-[var(--text-muted)] hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="tracking-wide">{label}</span>
                  {active && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 rounded bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.2)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Status badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(0,255,136,0.2)] bg-[rgba(0,255,136,0.05)]">
            <span className="w-1.5 h-1.5 rounded-full status-ok" />
            <span className="text-xs font-mono-aerospace text-[var(--success)] tracking-widest">
              SYSTEMS NOMINAL
            </span>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-[var(--text-muted)] hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setMobileOpen(false)}
            />
            <nav className="absolute right-0 top-0 bottom-0 w-72 bg-[var(--bg-panel)] border-l border-[rgba(0,229,255,0.2)] p-6 flex flex-col gap-2 pt-20">
              <div className="mb-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-[rgba(0,255,136,0.2)] bg-[rgba(0,255,136,0.05)] w-fit">
                  <span className="w-1.5 h-1.5 rounded-full status-ok" />
                  <span className="text-xs font-mono-aerospace text-[var(--success)] tracking-widest">
                    SYSTEMS NOMINAL
                  </span>
                </div>
              </div>
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      active
                        ? "bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.25)] text-[var(--cyan-glow)]"
                        : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1 font-medium tracking-wide">{label}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
