import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    openRouterApiKey: v.optional(v.string()),
    openRouterModel: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  sessions: defineTable({
    userId: v.optional(v.string()),
    status: v.union(
      v.literal("pending_upload"),
      v.literal("uploaded"),
      v.literal("analyzing"),
      v.literal("proposed"),
      v.literal("processing"),
      v.literal("complete"),
      v.literal("failed")
    ),
    originalFileName: v.string(),
    originalFileId: v.optional(v.id("_storage")),
    organizedFileId: v.optional(v.id("_storage")),
    fileCount: v.number(),
    totalBytes: v.number(),
    plan: v.optional(v.object({
      summary: v.string(),
      rules: v.array(v.string()),
      items: v.array(v.object({
        originalPath: v.string(),
        newPath: v.string(),
      })),
      foldersBefore: v.number(),
      foldersAfter: v.number(),
      duplicatesFound: v.number(),
    })),
    settings: v.object({
      maxDepth: v.number(),
      namingStyle: v.union(
        v.literal("descriptive"),
        v.literal("timestamped"),
        v.literal("kebab-case")
      ),
      groupBy: v.array(v.string()),
    }),
    errorMessage: v.optional(v.string()),
    isPreviewOnly: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  events: defineTable({
    sessionId: v.id("sessions"),
    type: v.union(
      v.literal("view"),
      v.literal("start"),
      v.literal("plan_generated"),
      v.literal("download")
    ),
    createdAt: v.number(),
  }).index("by_session", ["sessionId"]),
});
