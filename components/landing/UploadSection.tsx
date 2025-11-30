"use client";

import { motion } from "framer-motion";
import { SignUpButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { useRouter } from "next/navigation";

export function UploadSection() {
  const router = useRouter();

  return (
    <section id="upload" className="py-32 px-6 lg:px-12 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "3rem" }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="h-1 bg-accent mb-6"
            />
            <h2 className="font-[var(--font-heading)] text-4xl lg:text-5xl font-extrabold tracking-tighter mb-6">
              Get started
            </h2>
            <p className="text-muted leading-relaxed mb-8">
              Sign up for free and bring your own OpenRouter API key to start organizing your files with AI.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-muted">
                <div className="w-5 h-5 border border-accent/50 flex items-center justify-center">
                  <div className="w-2 h-2 bg-accent" />
                </div>
                <span>BYOK - Use your own API key</span>
              </div>
              <div className="flex items-center gap-3 text-muted">
                <div className="w-5 h-5 border border-accent/50 flex items-center justify-center">
                  <div className="w-2 h-2 bg-accent" />
                </div>
                <span>Files processed transiently</span>
              </div>
              <div className="flex items-center gap-3 text-muted">
                <div className="w-5 h-5 border border-accent/50 flex items-center justify-center">
                  <div className="w-2 h-2 bg-accent" />
                </div>
                <span>Download zip or apply script</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="border border-border rounded-lg p-10 lg:p-12 bg-surface space-y-6">
              <div className="w-12 h-12 border border-accent/30 bg-accent/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-lg mb-2">
                  Ready to organize your files?
                </p>
                <p className="text-muted text-sm">
                  Create an account and add your OpenRouter API key to get started.
                </p>
              </div>

              <Unauthenticated>
                <SignUpButton mode="modal">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full inline-flex items-center justify-center gap-2 bg-accent text-background font-semibold px-6 py-4 rounded-lg glow"
                  >
                    Sign up free
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </motion.button>
                </SignUpButton>
              </Unauthenticated>

              <Authenticated>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/dashboard")}
                  className="w-full inline-flex items-center justify-center gap-2 bg-accent text-background font-semibold px-6 py-4 rounded-lg glow"
                >
                  Go to Dashboard
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </motion.button>
              </Authenticated>

              <p className="text-xs text-muted text-center pt-2">
                Requires an OpenRouter API key.{" "}
                <a 
                  href="https://openrouter.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Get one free
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
