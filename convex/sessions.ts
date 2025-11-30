import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// User limits
const LIMITS = {
  anonymous: {
    maxFiles: 50,
    maxBytes: 100 * 1024 * 1024, // 100MB
    maxSessionsPerDay: 3,
  },
  authenticated: {
    maxFiles: 200,
    maxBytes: 500 * 1024 * 1024, // 500MB
    maxSessionsPerDay: 20,
  },
};

export const getLimits = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const isAuthenticated = !!identity;
    const limits = isAuthenticated ? LIMITS.authenticated : LIMITS.anonymous;
    
    return {
      isAuthenticated,
      ...limits,
      maxFilesFormatted: limits.maxFiles.toString(),
      maxBytesFormatted: `${limits.maxBytes / (1024 * 1024)}MB`,
    };
  },
});

export const createSession = mutation({
  args: {
    fileName: v.string(),
    fileSize: v.number(),
    settings: v.optional(v.object({
      maxDepth: v.number(),
      namingStyle: v.union(
        v.literal("descriptive"),
        v.literal("timestamped"),
        v.literal("kebab-case")
      ),
      groupBy: v.array(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Authentication required. Please sign in to use FoxFile.");
    }

    const userId = identity.subject;
    const limits = LIMITS.authenticated;

    // Check file size limit
    if (args.fileSize > limits.maxBytes) {
      throw new Error(
        `File too large. Maximum size is ${limits.maxBytes / (1024 * 1024)}MB.`
      );
    }

    const now = Date.now();
    const sessionId = await ctx.db.insert("sessions", {
      userId,
      status: "pending_upload",
      originalFileName: args.fileName,
      fileCount: 0,
      totalBytes: args.fileSize,
      settings: args.settings ?? {
        maxDepth: 3,
        namingStyle: "descriptive",
        groupBy: ["type", "date"],
      },
      isPreviewOnly: false,
      createdAt: now,
      updatedAt: now,
    });

    return { sessionId };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const markSessionUploaded = mutation({
  args: {
    sessionId: v.id("sessions"),
    fileId: v.id("_storage"),
    fileCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(args.sessionId, {
      status: "uploaded",
      originalFileId: args.fileId,
      fileCount: args.fileCount ?? 0,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const startAnalysis = mutation({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(args.sessionId, {
      status: "analyzing",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const savePlan = mutation({
  args: {
    sessionId: v.id("sessions"),
    plan: v.object({
      summary: v.string(),
      rules: v.array(v.string()),
      items: v.array(v.object({
        originalPath: v.string(),
        newPath: v.string(),
      })),
      foldersBefore: v.number(),
      foldersAfter: v.number(),
      duplicatesFound: v.number(),
    }),
    fileCount: v.number(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(args.sessionId, {
      status: "proposed",
      plan: args.plan,
      fileCount: args.fileCount,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("events", {
      sessionId: args.sessionId,
      type: "plan_generated",
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const setSessionFailed = mutation({
  args: {
    sessionId: v.id("sessions"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      status: "failed",
      errorMessage: args.errorMessage,
      updatedAt: Date.now(),
    });
  },
});

export const startProcessing = mutation({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(args.sessionId, {
      status: "processing",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const markComplete = mutation({
  args: {
    sessionId: v.id("sessions"),
    organizedFileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(args.sessionId, {
      status: "complete",
      organizedFileId: args.organizedFileId,
      updatedAt: Date.now(),
    });

    // Increment user's total files processed
    if (session.userId && session.fileCount > 0) {
      const userId = session.userId;
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
        .first();

      if (user) {
        const currentTotal = user.totalFilesProcessed ?? 0;
        await ctx.db.patch(user._id, {
          totalFilesProcessed: currentTotal + session.fileCount,
        });
      }
    }

    return { success: true };
  },
});

export const getSession = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      return null;
    }

    return {
      id: session._id,
      userId: session.userId,
      status: session.status,
      originalFileName: session.originalFileName,
      fileCount: session.fileCount,
      totalBytes: session.totalBytes,
      plan: session.plan,
      settings: session.settings,
      errorMessage: session.errorMessage,
      isPreviewOnly: session.isPreviewOnly,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  },
});

export const getUserSessions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(50);

    return sessions.map((session) => ({
      id: session._id,
      status: session.status,
      originalFileName: session.originalFileName,
      fileCount: session.fileCount,
      totalBytes: session.totalBytes,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));
  },
});

export const getDownloadUrl = query({
  args: {
    sessionId: v.id("sessions"),
    type: v.union(v.literal("original"), v.literal("organized")),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      return null;
    }

    const fileId = args.type === "original" 
      ? session.originalFileId 
      : session.organizedFileId;

    if (!fileId) {
      return null;
    }

    return await ctx.storage.getUrl(fileId);
  },
});

export const logEvent = mutation({
  args: {
    sessionId: v.id("sessions"),
    type: v.union(
      v.literal("view"),
      v.literal("start"),
      v.literal("plan_generated"),
      v.literal("download")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("events", {
      sessionId: args.sessionId,
      type: args.type,
      createdAt: Date.now(),
    });
  },
});

export const deleteSession = mutation({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Delete associated storage files
    if (session.originalFileId) {
      try {
        await ctx.storage.delete(session.originalFileId);
      } catch (e) {
        console.error("Failed to delete original file:", e);
      }
    }
    if (session.organizedFileId) {
      try {
        await ctx.storage.delete(session.organizedFileId);
      } catch (e) {
        console.error("Failed to delete organized file:", e);
      }
    }

    // Delete associated events
    const events = await ctx.db
      .query("events")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    
    for (const event of events) {
      await ctx.db.delete(event._id);
    }

    // Delete the session
    await ctx.db.delete(args.sessionId);

    return { success: true };
  },
});
