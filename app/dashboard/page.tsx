"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ApiKeyModal } from "@/components/ApiKeyModal";

function DashboardUpload({ onNeedsApiKey }: { onNeedsApiKey: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const createSession = useMutation(api.sessions.createSession);
  const generateUploadUrl = useMutation(api.sessions.generateUploadUrl);
  const markSessionUploaded = useMutation(api.sessions.markSessionUploaded);
  const startAnalysis = useMutation(api.sessions.startAnalysis);
  const analyzeAndGeneratePlan = useAction(api.analyze.analyzeAndGeneratePlan);
  const limits = useQuery(api.sessions.getLimits);
  const apiKeyInfo = useQuery(api.users.getApiKey);

  const maxBytes = limits?.maxBytes ?? 500 * 1024 * 1024;
  const maxBytesFormatted = limits?.maxBytesFormatted ?? "500MB";
  const maxFilesFormatted = limits?.maxFilesFormatted ?? "200";

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!apiKeyInfo?.hasKey) {
      onNeedsApiKey();
      return;
    }

    setError(null);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/zip" || droppedFile?.name.endsWith(".zip")) {
      if (droppedFile.size > maxBytes) {
        setError(`File too large. Maximum size is ${maxBytesFormatted}.`);
        return;
      }
      setFile(droppedFile);
    } else {
      setError("Please upload a .zip file.");
    }
  }, [maxBytes, maxBytesFormatted, apiKeyInfo, onNeedsApiKey]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!apiKeyInfo?.hasKey) {
      onNeedsApiKey();
      e.target.value = "";
      return;
    }

    setError(null);
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > maxBytes) {
        setError(`File too large. Maximum size is ${maxBytesFormatted}.`);
        return;
      }
      setFile(selectedFile);
    }
  }, [maxBytes, maxBytesFormatted, apiKeyInfo, onNeedsApiKey]);

  const handleUpload = async () => {
    if (!file) return;
    
    if (!apiKeyInfo?.hasKey) {
      onNeedsApiKey();
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const { sessionId } = await createSession({
        fileName: file.name,
        fileSize: file.size,
      });

      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) throw new Error("Upload failed");
      const { storageId } = await response.json();

      await markSessionUploaded({ sessionId, fileId: storageId });
      await startAnalysis({ sessionId });

      router.push(`/session/${sessionId}`);
      analyzeAndGeneratePlan({ sessionId }).catch(console.error);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Upload failed. Please try again.");
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (file) {
    return (
      <div className="border border-accent/30 rounded-lg p-6 bg-surface">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-accent/10 border border-accent/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-sm truncate">{file.name}</p>
            <p className="text-muted text-xs">{formatFileSize(file.size)}</p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: isUploading ? 1 : 1.02 }}
              whileTap={{ scale: isUploading ? 1 : 0.98 }}
              onClick={handleUpload}
              disabled={isUploading}
              className="inline-flex items-center gap-2 bg-accent text-background font-semibold px-4 py-2 rounded-lg disabled:opacity-70"
            >
              {isUploading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-background border-t-transparent rounded-full"
                  />
                  Uploading...
                </>
              ) : (
                "Organize"
              )}
            </motion.button>
            <button
              onClick={() => setFile(null)}
              className="px-3 py-2 border border-border rounded-lg text-muted hover:text-foreground"
            >
              Clear
            </button>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </div>
    );
  }

  return (
    <motion.div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      animate={{ scale: isDragging ? 1.01 : 1 }}
      className={`relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer ${
        isDragging ? "border-accent bg-accent/5" : "border-border hover:border-border-strong"
      }`}
    >
      <input
        type="file"
        accept=".zip,application/zip"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 border border-border flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <div>
          <p className="font-medium">Drop .zip here or click to browse</p>
          <p className="text-muted text-sm">Max {maxBytesFormatted} / {maxFilesFormatted} files</p>
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
    </motion.div>
  );
}

function SettingsTab() {
  const apiKeyInfo = useQuery(api.users.getApiKey);
  const removeApiKey = useMutation(api.users.removeApiKey);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeApiKey();
      setShowConfirm(false);
    } finally {
      setIsRemoving(false);
    }
  };

  if (!apiKeyInfo?.hasKey) {
    return (
      <div className="text-center py-8 text-muted">
        No API key configured.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border border-border rounded-lg bg-surface">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">OpenRouter API Key</p>
            <p className="text-xs text-muted font-mono mt-1">{apiKeyInfo.maskedKey}</p>
          </div>
          {showConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Remove key?</span>
              <button
                onClick={handleRemove}
                disabled={isRemoving}
                className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {isRemoving ? "..." : "Yes"}
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
              className="text-xs text-red-500 hover:underline"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <div className="p-4 border border-border rounded-lg bg-surface">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Model</p>
            <p className="text-xs text-muted mt-1">{apiKeyInfo.model}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"uploads" | "settings">("uploads");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  
  const sessions = useQuery(api.sessions.getUserSessions);
  const limits = useQuery(api.sessions.getLimits);
  const apiKeyInfo = useQuery(api.users.getApiKey);

  // Show modal automatically if no API key
  const needsApiKey = apiKeyInfo !== undefined && !apiKeyInfo?.hasKey;

  // Calculate stats from sessions
  const stats = sessions ? {
    totalSessions: sessions.length,
    completedSessions: sessions.filter(s => s.status === "complete").length,
    totalFilesOrganized: sessions.filter(s => s.status === "complete").reduce((acc, s) => acc + s.fileCount, 0),
    totalBytesProcessed: sessions.filter(s => s.status === "complete").reduce((acc, s) => acc + s.totalBytes, 0),
  } : null;

  return (
    <div className="min-h-screen bg-background noise-bg">
      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={needsApiKey || showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSuccess={() => setShowApiKeyModal(false)}
        canClose={!needsApiKey}
      />

      <header className="border-b border-border bg-surface/50">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <Image src="/logo.png" alt="FoxFile" width={28} height={28} className="rounded" />
            <span className="font-[var(--font-heading)] text-xl font-extrabold tracking-tighter">
              fox<span className="text-accent">file</span>
            </span>
          </Link>
          <UserButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-[var(--font-heading)] text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted">Manage your file organization sessions</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 border border-border rounded-lg bg-surface">
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Sessions</p>
            <p className="font-[var(--font-heading)] text-2xl font-bold">
              {stats?.totalSessions ?? "-"}
            </p>
          </div>
          <div className="p-4 border border-border rounded-lg bg-surface">
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Completed</p>
            <p className="font-[var(--font-heading)] text-2xl font-bold text-green-500">
              {stats?.completedSessions ?? "-"}
            </p>
          </div>
          <div className="p-4 border border-border rounded-lg bg-surface">
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Files Organized</p>
            <p className="font-[var(--font-heading)] text-2xl font-bold text-accent">
              {stats?.totalFilesOrganized ?? "-"}
            </p>
          </div>
          <div className="p-4 border border-border rounded-lg bg-surface">
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Data Processed</p>
            <p className="font-[var(--font-heading)] text-2xl font-bold">
              {stats ? formatBytes(stats.totalBytesProcessed) : "-"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("uploads")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "uploads"
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            Uploads
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "settings"
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            Settings
          </button>
        </div>

        {activeTab === "uploads" ? (
          <>
            {/* API Key Warning */}
            {needsApiKey && (
              <div className="mb-6 p-4 border border-yellow-500/30 rounded-lg bg-yellow-500/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-500">API Key Required</p>
                    <p className="text-xs text-muted mt-1">
                      Add your OpenRouter API key to start organizing files.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowApiKeyModal(true)}
                    className="px-4 py-2 text-sm font-medium bg-yellow-500 text-background rounded-lg"
                  >
                    Add Key
                  </button>
                </div>
              </div>
            )}

            {/* Limits Info */}
            {limits && apiKeyInfo?.hasKey && (
              <div className="mb-6 p-4 border border-accent/30 rounded-lg bg-accent/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Your Plan Limits</p>
                    <p className="text-xs text-muted mt-1">
                      Up to {limits.maxFilesFormatted} files per upload · Max {limits.maxBytesFormatted} per file
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-accent/20 text-accent rounded">
                    BYOK
                  </span>
                </div>
              </div>
            )}

            {/* Upload Section */}
            <div className="mb-8">
              <h2 className="text-sm font-medium text-muted uppercase tracking-wider mb-4">New Upload</h2>
              <DashboardUpload onNeedsApiKey={() => setShowApiKeyModal(true)} />
            </div>

            {/* Sessions List */}
            <div>
              <h2 className="text-sm font-medium text-muted uppercase tracking-wider mb-4">Recent Sessions</h2>
              {sessions === undefined ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full"
                  />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                  <p className="text-muted">No sessions yet. Upload a folder above to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <Link
                      key={session.id}
                      href={`/session/${session.id}`}
                      className="block p-4 border border-border rounded-lg bg-surface hover:border-accent/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 border border-border rounded flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-mono text-sm truncate max-w-md">
                              {session.originalFileName}
                            </p>
                            <p className="text-xs text-muted mt-0.5">
                              {session.fileCount} files · {formatBytes(session.totalBytes)} · {formatDate(session.createdAt)}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={session.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <SettingsTab />
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    complete: "bg-green-500/10 text-green-500 border-green-500/30",
    failed: "bg-red-500/10 text-red-500 border-red-500/30",
    proposed: "bg-accent/10 text-accent border-accent/30",
    analyzing: "bg-accent/10 text-accent border-accent/30",
    processing: "bg-accent/10 text-accent border-accent/30",
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium border rounded ${styles[status] || "bg-surface text-muted border-border"}`}>
      {status}
    </span>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
