import { internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const RETENTION_DAYS = 3;

export const cleanupOldSessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoffTime = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
    
    // Find old sessions
    const oldSessions = await ctx.db
      .query("sessions")
      .filter((q) => q.lt(q.field("createdAt"), cutoffTime))
      .collect();

    let deletedCount = 0;
    const storageIdsToDelete: string[] = [];

    for (const session of oldSessions) {
      // Collect storage IDs for deletion
      if (session.originalFileId) {
        storageIdsToDelete.push(session.originalFileId);
      }
      if (session.organizedFileId) {
        storageIdsToDelete.push(session.organizedFileId);
      }

      // Delete the session
      await ctx.db.delete(session._id);
      deletedCount++;
    }

    // Delete associated storage files
    for (const storageId of storageIdsToDelete) {
      try {
        await ctx.storage.delete(storageId as any);
      } catch (e) {
        console.error(`Failed to delete storage file ${storageId}:`, e);
      }
    }

    console.log(`Cleanup complete: deleted ${deletedCount} sessions and ${storageIdsToDelete.length} files`);
    
    return { deletedSessions: deletedCount, deletedFiles: storageIdsToDelete.length };
  },
});

export const scheduleCleanup = internalAction({
  args: {},
  handler: async (ctx) => {
    await ctx.runMutation(internal.cleanup.cleanupOldSessions);
  },
});
