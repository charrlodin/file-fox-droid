"use client";

import { motion } from "framer-motion";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import Link from "next/link";
import Image from "next/image";

export function Navigation() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring" as const, stiffness: 200, damping: 30, delay: 0.1 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 py-4 bg-background border-b border-border"
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-2">
          <Image src="/logo.png" alt="FoxFile" width={32} height={32} className="rounded" />
          <motion.span 
            className="font-[var(--font-heading)] text-xl font-extrabold tracking-tighter"
            whileHover={{ x: 2 }}
          >
            fox
            <span className="text-accent">file</span>
          </motion.span>
        </Link>

        <div className="flex items-center gap-2">
          <Unauthenticated>
            <SignInButton mode="modal">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 text-sm font-medium text-muted hover:text-foreground transition-colors"
              >
                Log in
              </motion.button>
            </SignInButton>
            <SignUpButton mode="modal">
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 text-sm font-semibold bg-accent text-background rounded-lg hover:bg-accent-hover transition-colors"
              >
                Start free
              </motion.button>
            </SignUpButton>
          </Unauthenticated>
          <Authenticated>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 text-sm font-semibold bg-accent text-background rounded-lg hover:bg-accent-hover transition-colors"
              >
                Dashboard
              </motion.button>
            </Link>
            <UserButton />
          </Authenticated>
        </div>
      </nav>
    </motion.header>
  );
}
