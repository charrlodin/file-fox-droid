"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SessionHeaderProps {
  session: {
    id: Id<"sessions">;
    originalFileName: string;
    status: string;
  };
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending_upload: { label: "Waiting for upload", color: "text-muted" },
  uploaded: { label: "Uploaded", color: "text-muted" },
  analyzing: { label: "Analyzing", color: "text-accent" },
  proposed: { label: "Plan ready", color: "text-accent" },
  processing: { label: "Processing", color: "text-accent" },
  complete: { label: "Complete", color: "text-green-500" },
  failed: { label: "Failed", color: "text-red-500" },
};

export function SessionHeader({ session }: SessionHeaderProps) {
  const statusInfo = statusLabels[session.status] || { label: session.status, color: "text-muted" };
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const deleteSession = useMutation(api.sessions.deleteSession);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteSession({ sessionId: session.id });
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to delete session:", error);
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-border bg-surface/50 backdrop-blur-sm"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="group flex items-center gap-2">
              <Image src="/logo.png" alt="FoxFile" width={28} height={28} className="rounded" />
              <span className="font-[var(--font-heading)] text-xl font-extrabold tracking-tighter">
                fox<span className="text-accent">file</span>
              </span>
            </Link>
            
            <div className="hidden sm:block h-6 w-px bg-border" />

            <Link 
              href="/dashboard" 
              className="hidden sm:flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </Link>
            
            <div className="hidden sm:block h-6 w-px bg-border" />
            
            <div className="hidden sm:block">
              <p className="font-mono text-sm truncate max-w-[200px] lg:max-w-[300px]">
                {session.originalFileName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {session.status === "analyzing" || session.status === "processing" ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-3 h-3 border border-accent border-t-transparent rounded-full"
                />
              ) : (
                <div className={`w-2 h-2 rounded-full ${
                  session.status === "complete" ? "bg-green-500" :
                  session.status === "failed" ? "bg-red-500" :
                  session.status === "proposed" ? "bg-accent" :
                  "bg-muted"
                }`} />
              )}
              <span className={`text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>

            {showConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Delete files?</span>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  {isDeleting ? "..." : "Yes"}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="text-xs px-2 py-1 border border-border rounded hover:bg-surface"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                className="text-xs text-muted hover:text-red-500 transition-colors"
                title="Delete session and files"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
