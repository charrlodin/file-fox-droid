"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-muted mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-accent text-background font-semibold rounded-lg"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
