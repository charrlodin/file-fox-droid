import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run cleanup daily at 3 AM UTC
crons.daily(
  "cleanup old sessions",
  { hourUTC: 3, minuteUTC: 0 },
  internal.cleanup.scheduleCleanup
);

export default crons;
