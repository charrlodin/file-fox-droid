"use client";

import { motion } from "framer-motion";

const features = [
  {
    number: "01",
    title: "Smart Categorization",
    description: "AI analyzes file names, types, and metadata to create logical folder structures.",
  },
  {
    number: "02",
    title: "Intelligent Renaming",
    description: "Get human-readable file names that actually make sense. No more IMG_2847.jpg.",
  },
  {
    number: "03",
    title: "Duplicate Detection",
    description: "Find and remove duplicate files automatically. Free up space instantly.",
  },
  {
    number: "04",
    title: "Privacy First",
    description: "Files are processed transiently. Nothing is stored. Your data stays yours.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-32 px-6 lg:px-12 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-4"
          >
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "3rem" }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="h-1 bg-accent mb-6"
            />
            <h2 className="font-[var(--font-heading)] text-4xl lg:text-5xl font-extrabold tracking-tighter leading-[1.1]">
              One job
              <br />
              <span className="text-muted">done well</span>
            </h2>
            <p className="mt-6 text-muted leading-relaxed max-w-sm">
              No bloat. No feature creep. Just intelligent file organization that works.
            </p>
          </motion.div>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-background p-8 lg:p-10 hover:bg-surface transition-colors"
                >
                  <span className="font-mono text-xs text-accent mb-4 block">
                    {feature.number}
                  </span>
                  <h3 className="font-[var(--font-heading)] text-xl font-semibold mb-3 group-hover:text-accent transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
