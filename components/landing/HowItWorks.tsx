"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Upload",
    description: "Drop a .zip of your messy folder. Downloads, Documents, anything.",
  },
  {
    number: "02",
    title: "Analyze",
    description: "AI examines names, types, and patterns. Proposes clean structure.",
  },
  {
    number: "03",
    title: "Download",
    description: "Review the plan. Get organized files as zip or apply script.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 px-6 lg:px-12 bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: "3rem" }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="h-1 bg-accent mb-6"
          />
          <h2 className="font-[var(--font-heading)] text-4xl lg:text-5xl font-extrabold tracking-tighter">
            How it works
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-border">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={`relative p-10 lg:p-12 ${index < steps.length - 1 ? 'lg:border-r border-b lg:border-b-0 border-border' : ''}`}
            >
              <div className="flex items-start justify-between mb-8">
                <span className="font-mono text-sm text-accent">
                  {step.number}
                </span>
                {index < steps.length - 1 && (
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    className="text-border-strong hidden lg:block"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                )}
              </div>
              <h3 className="font-[var(--font-heading)] text-3xl lg:text-4xl font-bold mb-4">
                {step.title}
              </h3>
              <p className="text-muted leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
