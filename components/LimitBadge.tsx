"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export function LimitBadge() {
  const limits = useQuery(api.sessions.getLimits);

  if (!limits) return null;

  return (
    <div className="inline-flex items-center gap-2 text-xs text-muted">
      <span className="font-mono">
        {limits.maxFilesFormatted} files / {limits.maxBytesFormatted}
      </span>
      {!limits.isAuthenticated && (
        <Link
          href="/sign-in"
          className="text-accent hover:underline"
        >
          Sign in for more
        </Link>
      )}
    </div>
  );
}
