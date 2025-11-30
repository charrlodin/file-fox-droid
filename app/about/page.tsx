"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background noise-bg">
      <header className="border-b border-border bg-surface/50">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <Image src="/logo.png" alt="FoxFile" width={28} height={28} className="rounded" />
            <span className="font-[var(--font-heading)] text-xl font-extrabold tracking-tighter">
              fox<span className="text-accent">file</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Back to app
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div>
            <h1 className="font-[var(--font-heading)] text-4xl font-bold mb-4">
              About FoxFile
            </h1>
            <p className="text-lg text-muted">
              AI-powered file organization that actually works.
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="font-[var(--font-heading)] text-2xl font-bold">
              What is FoxFile?
            </h2>
            <p className="text-muted leading-relaxed">
              FoxFile is an open-source tool that uses AI to organize your messy folders. 
              Upload a zip of your Downloads, Documents, or any chaotic folder, and get back 
              a clean, logically organized structure. No more hunting through hundreds of 
              randomly named files.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-[var(--font-heading)] text-2xl font-bold">
              How it works
            </h2>
            <ol className="space-y-3 text-muted">
              <li className="flex gap-3">
                <span className="font-mono text-accent">01</span>
                <span>Upload a .zip file of your messy folder</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-accent">02</span>
                <span>AI analyzes file names, types, and patterns</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-accent">03</span>
                <span>Review the proposed organization plan</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-accent">04</span>
                <span>Download organized files or a shell script to apply locally</span>
              </li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="font-[var(--font-heading)] text-2xl font-bold">
              Privacy
            </h2>
            <div className="bg-surface border border-border rounded-lg p-6 space-y-3">
              <p className="text-muted leading-relaxed">
                Your privacy matters. Here&apos;s how we handle your data:
              </p>
              <ul className="space-y-2 text-muted text-sm">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Files are processed transiently and deleted within 3 days</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>File contents are never logged or stored permanently</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Only file names/paths are sent to AI for organization</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Download the shell script option to organize files locally without uploading</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-[var(--font-heading)] text-2xl font-bold">
              Open Source
            </h2>
            <p className="text-muted leading-relaxed">
              FoxFile is open source under the MIT license. You can self-host it with your 
              own OpenRouter API key for complete control over your data.
            </p>
            <a
              href="https://github.com/charrlodin/file-fox-droid"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-accent hover:underline"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
              </svg>
              View on GitHub
            </a>
          </section>

          <section className="space-y-4">
            <h2 className="font-[var(--font-heading)] text-2xl font-bold">
              Limits
            </h2>
            <div className="bg-surface border border-accent/30 rounded-lg p-6">
              <h3 className="font-semibold mb-2 text-accent">BYOK Plan</h3>
              <ul className="text-sm text-muted space-y-1">
                <li>50 total files (tracked across all sessions)</li>
                <li>200 files per upload</li>
                <li>500MB max file size</li>
                <li>Files auto-deleted after 3 days</li>
              </ul>
              <p className="text-xs text-muted mt-4">
                Bring your own OpenRouter API key. Usage is tracked cumulatively - 
                deleting sessions does not restore your file quota.
              </p>
            </div>
          </section>

          <section className="border-t border-border pt-8">
            <p className="text-sm text-muted">
              Built with Next.js, Convex, and OpenRouter. Styled with Tailwind CSS.
            </p>
          </section>
        </motion.div>
      </main>
    </div>
  );
}
