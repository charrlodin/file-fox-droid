"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="py-20 px-6 lg:px-12 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-6">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Image src="/logo.png" alt="FoxFile" width={28} height={28} className="rounded" />
              <span className="font-[var(--font-heading)] text-xl font-extrabold tracking-tighter">
                fox<span className="text-accent">file</span>
              </span>
            </Link>
            <p className="text-muted max-w-md leading-relaxed text-sm">
              AI-powered file organization that respects your privacy.
              Open source under MIT License.
            </p>
          </div>

          <div className="col-span-6 lg:col-span-3">
            <h4 className="font-mono text-xs text-muted uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#features" className="text-muted hover:text-accent transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-muted hover:text-accent transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="#upload" className="text-muted hover:text-accent transition-colors">
                  Try it
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-6 lg:col-span-3">
            <h4 className="font-mono text-xs text-muted uppercase tracking-wider mb-4">Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-muted hover:text-accent transition-colors">
                  About
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/foxfile/foxfile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <Link href="/about#privacy" className="text-muted hover:text-accent transition-colors">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <p className="text-xs text-muted font-mono">
            {new Date().getFullYear()} foxfile. open source.
          </p>
          <motion.a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-muted hover:text-accent transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
            </svg>
          </motion.a>
        </motion.div>
      </div>
    </footer>
  );
}
