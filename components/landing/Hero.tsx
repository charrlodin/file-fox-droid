"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-end pb-12 lg:pb-24 px-6 lg:px-12 pt-32 overflow-hidden">
      {/* Abstract geometric visual - top right */}
      <div className="absolute top-24 right-0 w-1/2 h-[60vh] pointer-events-none hidden lg:block">
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative w-full h-full"
        >
          {/* Chaotic files - left stack */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] left-[5%] space-y-2"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ rotate: (i - 2) * 8, x: (i - 2) * 4 }}
                className="w-32 h-8 bg-surface-2 border border-border rounded"
              />
            ))}
          </motion.div>

          {/* Arrow indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute top-[35%] left-[25%]"
          >
            <motion.div
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-16 h-16 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center"
            >
              <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.div>
          </motion.div>

          {/* Organized folders - right stack */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-[5%] right-[10%] space-y-3"
          >
            <motion.div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-accent rounded-sm" />
              <div className="w-40 h-10 bg-surface border border-accent/30 rounded-lg" />
            </motion.div>
            <motion.div className="flex items-center gap-3 ml-4">
              <div className="w-3 h-3 bg-accent/60 rounded-sm" />
              <div className="w-36 h-10 bg-surface border border-border rounded-lg" />
            </motion.div>
            <motion.div className="flex items-center gap-3 ml-4">
              <div className="w-3 h-3 bg-accent/60 rounded-sm" />
              <div className="w-32 h-10 bg-surface border border-border rounded-lg" />
            </motion.div>
            <motion.div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-accent rounded-sm" />
              <div className="w-40 h-10 bg-surface border border-accent/30 rounded-lg" />
            </motion.div>
            <motion.div className="flex items-center gap-3 ml-4">
              <div className="w-3 h-3 bg-accent/60 rounded-sm" />
              <div className="w-28 h-10 bg-surface border border-border rounded-lg" />
            </motion.div>
          </motion.div>

          {/* Floating accent squares */}
          <motion.div
            animate={{ rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[20%] right-[30%] w-24 h-24 border-2 border-accent/20"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute bottom-[30%] left-[15%] w-4 h-4 bg-accent"
          />
        </motion.div>
      </div>

      {/* Main content - bottom heavy typography */}
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "3rem" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="h-1 bg-accent mb-6"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-muted font-medium tracking-wide uppercase text-sm"
          >
            AI-Powered Organization
          </motion.p>
        </motion.div>

        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            transition={{ type: "spring" as const, stiffness: 50, damping: 20, delay: 0.2 }}
            className="font-[var(--font-heading)] text-[clamp(3rem,12vw,10rem)] font-extrabold leading-[0.9] tracking-tighter"
          >
            <span className="block">Organize</span>
            <span className="block text-muted">messy files</span>
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 lg:mt-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8"
        >
          <p className="text-muted text-lg lg:text-xl max-w-md leading-relaxed font-light">
            Upload a zip. AI analyzes and restructures. 
            Download clean, organized folders.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <motion.a
              href="#upload"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex items-center justify-center gap-3 bg-accent text-background font-semibold px-8 py-4 rounded-lg text-lg glow"
            >
              Start organizing
              <motion.span
                className="inline-block"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.span>
            </motion.a>
            <motion.a
              href="#how-it-works"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 border border-border-strong text-foreground font-medium px-8 py-4 rounded-lg text-lg hover:bg-surface transition-colors"
            >
              How it works
            </motion.a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-12 flex items-center gap-8 text-sm text-muted"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-accent rounded-full" />
            <span>BYOK - Bring your own key</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-accent rounded-full" />
            <span>Privacy-first</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-accent rounded-full" />
            <span>Open source</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
