import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";

const DEFAULT_FILE_LIMIT = 50;

export const getApiKey = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return null;
    }

    const fileLimit = user.fileLimit ?? DEFAULT_FILE_LIMIT;
    const filesUsed = user.totalFilesProcessed ?? 0;
    const filesRemaining = Math.max(0, fileLimit - filesUsed);

    return {
      hasKey: !!user.openRouterApiKey,
      model: user.openRouterModel || "openai/gpt-4o-mini",
      maskedKey: user.openRouterApiKey 
        ? `${user.openRouterApiKey.slice(0, 10)}...${user.openRouterApiKey.slice(-4)}`
        : null,
      filesUsed,
      fileLimit,
      filesRemaining,
      canUpload: filesRemaining > 0,
    };
  },
});

export const saveApiKey = mutation({
  args: {
    apiKey: v.string(),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Validate API key format
    if (!args.apiKey.startsWith("sk-or-")) {
      throw new Error("Invalid OpenRouter API key format");
    }

    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        openRouterApiKey: args.apiKey,
        openRouterModel: args.model,
      });
    } else {
      await ctx.db.insert("users", {
        clerkId: identity.subject,
        email: identity.email,
        openRouterApiKey: args.apiKey,
        openRouterModel: args.model,
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const removeApiKey = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        openRouterApiKey: undefined,
        openRouterModel: undefined,
      });
    }

    return { success: true };
  },
});

export const incrementFilesProcessed = mutation({
  args: {
    fileCount: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const currentTotal = user.totalFilesProcessed ?? 0;
    await ctx.db.patch(user._id, {
      totalFilesProcessed: currentTotal + args.fileCount,
    });

    return { success: true };
  },
});

export const checkCanUpload = query({
  args: {
    fileCount: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { canUpload: false, reason: "Not authenticated" };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return { canUpload: true, filesRemaining: DEFAULT_FILE_LIMIT };
    }

    const fileLimit = user.fileLimit ?? DEFAULT_FILE_LIMIT;
    const filesUsed = user.totalFilesProcessed ?? 0;
    const filesRemaining = Math.max(0, fileLimit - filesUsed);

    if (args.fileCount > filesRemaining) {
      return {
        canUpload: false,
        reason: `You have ${filesRemaining} files remaining in your plan. This upload contains ${args.fileCount} files.`,
        filesRemaining,
      };
    }

    return { canUpload: true, filesRemaining };
  },
});

// Internal function to get full API key for server-side use only
export const getFullApiKey = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!user || !user.openRouterApiKey) {
      return null;
    }

    return {
      apiKey: user.openRouterApiKey,
      model: user.openRouterModel || "openai/gpt-4o-mini",
    };
  },
});
