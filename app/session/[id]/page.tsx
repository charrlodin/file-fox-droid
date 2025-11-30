"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { SessionStatus } from "@/components/session/SessionStatus";
import { PlanView } from "@/components/session/PlanView";
import { SessionHeader } from "@/components/session/SessionHeader";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.id as Id<"sessions">;
  
  const session = useQuery(api.sessions.getSession, { sessionId });

  if (session === undefined) {
    return <SessionLoading />;
  }

  if (session === null) {
    return <SessionNotFound />;
  }

  return (
    <div className="min-h-screen bg-background noise-bg">
      <SessionHeader session={session} />
      
      <main className="max-w-6xl mx-auto px-6 lg:px-12 py-8">
        {(session.status === "pending_upload" || 
          session.status === "uploaded" || 
          session.status === "analyzing") && (
          <SessionStatus session={session} />
        )}

        {session.status === "proposed" && session.plan && (
          <PlanView session={{ ...session, plan: session.plan }} />
        )}

        {session.status === "processing" && (
          <SessionStatus session={session} />
        )}

        {session.status === "complete" && session.plan && (
          <PlanView session={{ ...session, plan: session.plan }} isComplete />
        )}

        {session.status === "failed" && (
          <SessionError session={session} />
        )}
      </main>
    </div>
  );
}

function SessionLoading() {
  return (
    <div className="min-h-screen bg-background noise-bg flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-muted">Loading session...</p>
      </motion.div>
    </div>
  );
}

function SessionNotFound() {
  return (
    <div className="min-h-screen bg-background noise-bg flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-16 h-16 border border-border flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="font-[var(--font-heading)] text-2xl font-bold mb-2">Session not found</h1>
        <p className="text-muted mb-6">This session may have expired or doesn&apos;t exist.</p>
        <Link 
          href="/"
          className="inline-flex items-center gap-2 bg-accent text-background font-semibold px-6 py-3 rounded-lg"
        >
          Back to home
        </Link>
      </motion.div>
    </div>
  );
}

function SessionError({ session }: { session: { id: Id<"sessions">; errorMessage?: string } }) {
  const [isRetrying, setIsRetrying] = useState(false);
  const startAnalysis = useMutation(api.sessions.startAnalysis);
  const analyzeAndGeneratePlan = useAction(api.analyze.analyzeAndGeneratePlan);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await startAnalysis({ sessionId: session.id });
      analyzeAndGeneratePlan({ sessionId: session.id }).catch(console.error);
    } catch (err) {
      console.error("Retry failed:", err);
      setIsRetrying(false);
    }
  };

  const isApiKeyError = session.errorMessage?.toLowerCase().includes("api key") || 
                        session.errorMessage?.toLowerCase().includes("openrouter");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto text-center py-16"
    >
      <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="font-[var(--font-heading)] text-2xl font-bold mb-2">Organization failed</h2>
      <p className="text-muted mb-6">
        {session.errorMessage || "Something went wrong while processing your files."}
      </p>
      
      {isApiKeyError && (
        <div className="bg-surface border border-border rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-muted mb-2">To fix this, add to your <code className="text-accent">.env.local</code>:</p>
          <pre className="text-xs bg-background p-2 rounded font-mono overflow-x-auto">
{`OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini`}
          </pre>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <motion.button
          whileHover={{ scale: isRetrying ? 1 : 1.02 }}
          whileTap={{ scale: isRetrying ? 1 : 0.98 }}
          onClick={handleRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-2 bg-accent text-background font-semibold px-6 py-3 rounded-lg disabled:opacity-70"
        >
          {isRetrying ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-background border-t-transparent rounded-full"
              />
              Retrying...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </>
          )}
        </motion.button>
        <Link 
          href="/"
          className="inline-flex items-center gap-2 border border-border text-foreground font-medium px-6 py-3 rounded-lg hover:bg-surface"
        >
          Start over
        </Link>
      </div>
    </motion.div>
  );
}
