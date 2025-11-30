import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";

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

    return {
      hasKey: !!user.openRouterApiKey,
      model: user.openRouterModel || "openai/gpt-4o-mini",
      // Don't return the actual key, just masked version
      maskedKey: user.openRouterApiKey 
        ? `${user.openRouterApiKey.slice(0, 10)}...${user.openRouterApiKey.slice(-4)}`
        : null,
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
