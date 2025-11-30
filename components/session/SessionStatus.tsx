"use client";

import { motion } from "framer-motion";

interface SessionStatusProps {
  session: {
    status: string;
    fileCount: number;
    originalFileName: string;
  };
}

export function SessionStatus({ session }: SessionStatusProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto py-24 text-center"
    >
      <div className="mb-8">
        {session.status === "analyzing" ? (
          <AnalyzingAnimation />
        ) : session.status === "processing" ? (
          <ProcessingAnimation />
        ) : (
          <WaitingAnimation />
        )}
      </div>

      <h2 className="font-[var(--font-heading)] text-3xl font-bold mb-4">
        {session.status === "analyzing" && "Analyzing your files"}
        {session.status === "processing" && "Building your organized folder"}
        {session.status === "pending_upload" && "Waiting for upload"}
        {session.status === "uploaded" && "Upload complete"}
      </h2>

      <p className="text-muted mb-8">
        {session.status === "analyzing" && (
          <>AI is examining file names, types, and patterns to create the optimal structure.</>
        )}
        {session.status === "processing" && (
          <>Reorganizing files according to the approved plan. This may take a moment.</>
        )}
        {session.status === "pending_upload" && (
          <>Please upload your zip file to begin.</>
        )}
        {session.status === "uploaded" && (
          <>Your file has been uploaded. Analysis will begin shortly.</>
        )}
      </p>

      {session.fileCount > 0 && (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg">
          <span className="font-mono text-sm text-muted">
            {session.fileCount} files
          </span>
        </div>
      )}
    </motion.div>
  );
}

function AnalyzingAnimation() {
  return (
    <div className="relative w-24 h-24 mx-auto">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-2 border-accent/30 rounded-lg"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute inset-2 border-2 border-accent/50 rounded-lg"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute inset-4 bg-accent/20 rounded-lg flex items-center justify-center"
      >
        <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </motion.div>
    </div>
  );
}

function ProcessingAnimation() {
  return (
    <div className="relative w-24 h-24 mx-auto">
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-0 left-0 h-full bg-accent/20 rounded-lg"
      />
      <div className="absolute inset-0 border border-border rounded-lg flex items-center justify-center">
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

function WaitingAnimation() {
  return (
    <div className="relative w-24 h-24 mx-auto">
      <div className="absolute inset-0 border border-border rounded-lg flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg className="w-10 h-10 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
