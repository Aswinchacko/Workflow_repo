"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md space-y-4 py-12 text-center">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        This is often a stale session after the database was reset, or a temporary
        connection issue. Sign out, sign in again, and retry.
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-muted-foreground">Ref: {error.digest}</p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
        <Button type="button" variant="outline" onClick={() => (window.location.href = "/login")}>
          Sign in again
        </Button>
      </div>
    </div>
  );
}
