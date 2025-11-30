"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import JSZip from "jszip";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface FileManifestItem {
  originalPath: string;
  fileName: string;
  extension: string;
  sizeBytes: number;
  mimeType: string;
}

interface OrganizationPlan {
  summary: string;
  rules: string[];
  items: Array<{
    originalPath: string;
    newPath: string;
  }>;
  foldersBefore: number;
  foldersAfter: number;
  duplicatesFound: number;
}

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif",
  webp: "image/webp", svg: "image/svg+xml", pdf: "application/pdf",
  doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  txt: "text/plain", csv: "text/csv", json: "application/json",
  js: "text/javascript", ts: "text/typescript", py: "text/x-python",
  mp3: "audio/mpeg", mp4: "video/mp4", zip: "application/zip",
};

function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return MIME_TYPES[ext] || "application/octet-stream";
}

function getExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() || "" : "";
}

function getFileName(path: string): string {
  return path.split("/").pop() || path;
}

function countUniqueFolders(paths: string[]): number {
  const folders = new Set<string>();
  for (const path of paths) {
    const parts = path.split("/");
    parts.pop();
    let current = "";
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      if (current) folders.add(current);
    }
  }
  return folders.size;
}

export const analyzeAndGeneratePlan = action({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(api.sessions.getSession, {
      sessionId: args.sessionId,
    });

    if (!session) {
      throw new Error("Session not found");
    }

    if (!session.userId) {
      throw new Error("User not authenticated");
    }

    // Get user's API key
    const userApiKey = await ctx.runQuery(api.users.getFullApiKey, {
      userId: session.userId,
    });

    if (!userApiKey || !userApiKey.apiKey) {
      throw new Error("No OpenRouter API key configured. Please add your API key in Settings.");
    }

    const apiKey = userApiKey.apiKey;
    const model = userApiKey.model || "openai/gpt-4o-mini";

    try {
      // Get the uploaded file URL
      const fileUrl = await ctx.runQuery(api.sessions.getDownloadUrl, {
        sessionId: args.sessionId,
        type: "original",
      });

      if (!fileUrl) {
        throw new Error("No file uploaded");
      }

      // Download and parse the zip
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      // Build manifest
      const manifest: FileManifestItem[] = [];
      for (const [path, file] of Object.entries(zip.files)) {
        if (file.dir) continue;
        if (path.startsWith("__MACOSX")) continue;
        if (path.includes(".DS_Store")) continue;

        // Get file size by reading the content
        const content = await file.async("uint8array");
        manifest.push({
          originalPath: path,
          fileName: getFileName(path),
          extension: getExtension(path),
          sizeBytes: content.length,
          mimeType: getMimeType(path),
        });
      }

      if (manifest.length === 0) {
        throw new Error("No files found in zip");
      }

      // Generate plan using OpenRouter
      const plan = await callOpenRouter(manifest, session.settings, apiKey, model);

      // Calculate folder counts
      const foldersBefore = countUniqueFolders(manifest.map(f => f.originalPath));
      const foldersAfter = countUniqueFolders(plan.items.map(f => f.newPath));

      // Save the plan
      await ctx.runMutation(api.sessions.savePlan, {
        sessionId: args.sessionId,
        plan: {
          ...plan,
          foldersBefore,
          foldersAfter,
        },
        fileCount: manifest.length,
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      await ctx.runMutation(api.sessions.setSessionFailed, {
        sessionId: args.sessionId,
        errorMessage: error instanceof Error ? error.message : "Analysis failed",
      });
    }
  },
});

async function callOpenRouter(
  manifest: FileManifestItem[],
  settings: { maxDepth: number; namingStyle: string; groupBy: string[] },
  apiKey: string,
  model: string
): Promise<OrganizationPlan> {
  const systemPrompt = `You are an expert file organization assistant. Analyze files and propose a clean folder structure.

Rules:
- Group files by ${settings.groupBy.join(", ")}
- Maximum folder depth: ${settings.maxDepth}
- Naming style: ${settings.namingStyle}
- Use human-readable folder names
- Preserve file extensions
- Avoid filename collisions
- Identify duplicates by similar names

Respond with valid JSON only.`;

  const sampleManifest = manifest.slice(0, 150);
  const userPrompt = `Organize these ${manifest.length} files:

${JSON.stringify(sampleManifest, null, 2)}
${manifest.length > 150 ? `\n... and ${manifest.length - 150} more similar files` : ""}

Respond with this JSON structure:
{
  "summary": "Brief description",
  "rules": ["Rule 1", "Rule 2"],
  "items": [{"originalPath": "path/file.ext", "newPath": "New/path/file.ext"}],
  "foldersBefore": 0,
  "foldersAfter": 0,
  "duplicatesFound": 0
}

IMPORTANT: Include ALL ${manifest.length} files in the items array with their new paths.`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://foxfile.app",
      "X-Title": "FoxFile",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No response from AI");
  }

  // Parse JSON from response (handle markdown code blocks)
  let jsonStr = content;
  if (content.includes("```json")) {
    jsonStr = content.split("```json")[1].split("```")[0];
  } else if (content.includes("```")) {
    jsonStr = content.split("```")[1].split("```")[0];
  }

  const plan = JSON.parse(jsonStr.trim()) as OrganizationPlan;

  // Ensure all files are included
  const plannedFiles = new Set(plan.items.map(i => i.originalPath));
  for (const file of manifest) {
    if (!plannedFiles.has(file.originalPath)) {
      plan.items.push({
        originalPath: file.originalPath,
        newPath: file.originalPath,
      });
    }
  }

  return plan;
}

async function generateMockPlan(
  ctx: { runMutation: (fn: any, args: any) => Promise<any> },
  sessionId: string,
  session: { settings: { maxDepth: number; namingStyle: string; groupBy: string[] } }
) {
  // Generate a demo plan for testing without API key
  const mockPlan: OrganizationPlan = {
    summary: "Demo organization plan (no API key configured). Files grouped by type.",
    rules: [
      "Grouped files by extension type",
      "Created folders for Images, Documents, Code, and Other",
      `Applied ${session.settings.namingStyle} naming convention`,
    ],
    items: [
      { originalPath: "IMG_001.jpg", newPath: "Images/Photos/IMG_001.jpg" },
      { originalPath: "document.pdf", newPath: "Documents/PDF/document.pdf" },
      { originalPath: "script.js", newPath: "Code/JavaScript/script.js" },
      { originalPath: "notes.txt", newPath: "Documents/Text/notes.txt" },
      { originalPath: "photo.png", newPath: "Images/Screenshots/photo.png" },
    ],
    foldersBefore: 1,
    foldersAfter: 6,
    duplicatesFound: 0,
  };

  await ctx.runMutation(api.sessions.savePlan, {
    sessionId: sessionId as any,
    plan: mockPlan,
    fileCount: 5,
  });
}
