"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";

interface PlanItem {
  originalPath: string;
  newPath: string;
}

interface Plan {
  summary: string;
  rules: string[];
  items: PlanItem[];
  foldersBefore: number;
  foldersAfter: number;
  duplicatesFound: number;
}

interface SessionData {
  id: Id<"sessions">;
  status: string;
  originalFileName: string;
  fileCount: number;
  totalBytes: number;
  plan: Plan;
  isPreviewOnly: boolean;
}

interface PlanViewProps {
  session: SessionData;
  isComplete?: boolean;
}

type ViewMode = "tree" | "list";

export function PlanView({ session, isComplete = false }: PlanViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [activeTab, setActiveTab] = useState<"before" | "after">("after");
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  
  const downloadUrl = useQuery(
    api.sessions.getDownloadUrl,
    isComplete ? { sessionId: session.id, type: "organized" } : "skip"
  );

  const startProcessing = useMutation(api.sessions.startProcessing);
  const buildOrganizedZip = useAction(api.process.buildOrganizedZip);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await startProcessing({ sessionId: session.id });
      await buildOrganizedZip({ sessionId: session.id });
    } catch (error) {
      console.error("Processing failed:", error);
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (downloadUrl) {
      // Create filename: originalname-fox.zip
      const originalName = session.originalFileName.replace(/\.zip$/i, "");
      const newFileName = `${originalName}-fox.zip`;
      
      // Fetch and download with proper filename
      try {
        const response = await fetch(downloadUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = newFileName;
        a.click();
        URL.revokeObjectURL(url);
        
        // Redirect to dashboard after download
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      } catch (error) {
        console.error("Download failed:", error);
        window.open(downloadUrl, "_blank");
      }
    }
  };

  const generateScript = () => {
    const lines = session.plan.items.map(item => 
      `mv "${item.originalPath}" "${item.newPath}"`
    );
    const script = `#!/bin/bash\n# FoxFile Organization Script\n# Generated for: ${session.originalFileName}\n\n${lines.join("\n")}`;
    
    const blob = new Blob([script], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "organize.sh";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Files" value={session.fileCount} />
        <StatCard label="Folders before" value={session.plan.foldersBefore} />
        <StatCard label="Folders after" value={session.plan.foldersAfter} accent />
        <StatCard label="Duplicates" value={session.plan.duplicatesFound} />
      </div>

      {/* Summary */}
      <div className="p-6 bg-surface border border-border rounded-lg">
        <h3 className="font-[var(--font-heading)] text-lg font-semibold mb-2">Summary</h3>
        <p className="text-muted">{session.plan.summary}</p>
        
        {session.plan.rules.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted mb-2">Organization rules applied:</p>
            <ul className="space-y-1">
              {session.plan.rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-accent mt-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-foreground">{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("before")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "before" 
                ? "bg-surface text-foreground" 
                : "text-muted hover:text-foreground"
            }`}
          >
            Original
          </button>
          <button
            onClick={() => setActiveTab("after")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "after" 
                ? "bg-accent text-background" 
                : "text-muted hover:text-foreground"
            }`}
          >
            Organized
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("tree")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "tree" ? "bg-surface text-foreground" : "text-muted"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list" ? "bg-surface text-foreground" : "text-muted"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>
        </div>
      </div>

      {/* File Tree / List */}
      <div className="border border-border rounded-lg overflow-hidden">
        {viewMode === "tree" ? (
          <TreeView 
            items={session.plan.items} 
            showNew={activeTab === "after"} 
          />
        ) : (
          <ListView 
            items={session.plan.items} 
            showNew={activeTab === "after"} 
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        {isComplete ? (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              disabled={!downloadUrl}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-accent text-background font-semibold px-6 py-4 rounded-lg glow disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download organized zip
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateScript}
              className="flex-1 inline-flex items-center justify-center gap-2 border border-border text-foreground font-medium px-6 py-4 rounded-lg hover:bg-surface transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Download script
            </motion.button>
          </>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: isProcessing ? 1 : 1.02 }}
              whileTap={{ scale: isProcessing ? 1 : 0.98 }}
              onClick={handleConfirm}
              disabled={session.isPreviewOnly || isProcessing}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-accent text-background font-semibold px-6 py-4 rounded-lg glow disabled:opacity-50"
            >
              {session.isPreviewOnly ? (
                "Sign up to download"
              ) : isProcessing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-background border-t-transparent rounded-full"
                  />
                  Building...
                </>
              ) : (
                <>
                  Confirm & build
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateScript}
              className="flex-1 inline-flex items-center justify-center gap-2 border border-border text-foreground font-medium px-6 py-4 rounded-lg hover:bg-surface transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Download script only
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`p-4 rounded-lg border ${accent ? "border-accent/30 bg-accent/5" : "border-border bg-surface"}`}>
      <p className="text-sm text-muted mb-1">{label}</p>
      <p className={`font-[var(--font-heading)] text-2xl font-bold ${accent ? "text-accent" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function TreeView({ items, showNew }: { items: PlanItem[]; showNew: boolean }) {
  const tree = useMemo(() => {
    const root: Record<string, unknown> = {};
    
    items.forEach(item => {
      const path = showNew ? item.newPath : item.originalPath;
      const parts = path.split("/").filter(Boolean);
      let current = root;
      
      parts.forEach((part, i) => {
        if (i === parts.length - 1) {
          current[part] = { __file: true, item };
        } else {
          if (!current[part]) {
            current[part] = {};
          }
          current[part] = current[part] as Record<string, unknown>;
          current = current[part] as Record<string, unknown>;
        }
      });
    });
    
    return root;
  }, [items, showNew]);

  return (
    <div className="p-4 max-h-96 overflow-auto font-mono text-sm">
      <TreeNode node={tree} name="" level={0} />
    </div>
  );
}

function TreeNode({ node, name, level }: { node: Record<string, unknown>; name: string; level: number }) {
  const entries = Object.entries(node);
  const isFile = "__file" in node;

  if (isFile) {
    return (
      <div className="flex items-center gap-2 py-0.5 text-muted" style={{ paddingLeft: `${level * 16}px` }}>
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span className="truncate">{name}</span>
      </div>
    );
  }

  return (
    <>
      {name && (
        <div className="flex items-center gap-2 py-0.5 text-foreground font-medium" style={{ paddingLeft: `${level * 16}px` }}>
          <svg className="w-4 h-4 flex-shrink-0 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span>{name}/</span>
        </div>
      )}
      {entries
        .filter(([key]) => key !== "__file" && key !== "item")
        .map(([key, value]) => (
          <TreeNode 
            key={key} 
            node={value as Record<string, unknown>} 
            name={key} 
            level={name ? level + 1 : level} 
          />
        ))}
    </>
  );
}

function ListView({ items, showNew }: { items: PlanItem[]; showNew: boolean }) {
  return (
    <div className="max-h-96 overflow-auto">
      <table className="w-full text-sm">
        <thead className="bg-surface sticky top-0">
          <tr>
            <th className="text-left p-3 font-medium text-muted">
              {showNew ? "New path" : "Original path"}
            </th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {items.map((item, i) => (
            <tr key={i} className="border-t border-border">
              <td className="p-3 text-muted truncate">
                {showNew ? item.newPath : item.originalPath}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
