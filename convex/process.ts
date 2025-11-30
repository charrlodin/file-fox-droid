"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import JSZip from "jszip";

export const buildOrganizedZip = action({
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

    if (!session.plan) {
      throw new Error("No plan found for session");
    }

    try {
      // Get the original file URL
      const fileUrl = await ctx.runQuery(api.sessions.getDownloadUrl, {
        sessionId: args.sessionId,
        type: "original",
      });

      if (!fileUrl) {
        throw new Error("Original file not found");
      }

      // Download original zip
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const originalZip = await JSZip.loadAsync(arrayBuffer);

      // Create new organized zip
      const organizedZip = new JSZip();

      // Process each item in the plan
      for (const item of session.plan.items) {
        const originalFile = originalZip.file(item.originalPath);
        if (originalFile) {
          const content = await originalFile.async("uint8array");
          organizedZip.file(item.newPath, content);
        }
      }

      // Generate the organized zip as blob
      const organizedBlob = await organizedZip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });

      // Upload to storage
      const uploadUrl = await ctx.storage.generateUploadUrl();
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "application/zip" },
        body: organizedBlob,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload organized zip");
      }

      const { storageId } = await uploadResponse.json();

      // Mark session as complete
      await ctx.runMutation(api.sessions.markComplete, {
        sessionId: args.sessionId,
        organizedFileId: storageId,
      });

      return { success: true };
    } catch (error) {
      console.error("Processing failed:", error);
      await ctx.runMutation(api.sessions.setSessionFailed, {
        sessionId: args.sessionId,
        errorMessage: error instanceof Error ? error.message : "Processing failed",
      });
      throw error;
    }
  },
});
