"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleAttendance } from "@/app/(app)/attendance/actions";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, CheckCircle2, Loader2 } from "lucide-react";

type State = "in" | "out" | "done";

export function CheckInGuard({ state }: { state: State }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const isCheckIn = state === "in";
  const actionLabel = isCheckIn ? "Check In" : "Check Out";

  async function onConfirm() {
    setPending(true);
    setError("");
    try {
      await toggleAttendance();
      setConfirming(false);
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not record attendance. Try again.";
      setError(msg);
    } finally {
      setPending(false);
    }
  }

  if (state === "done") {
    return (
      <Button size="lg" variant="outline" className="h-20 w-full text-lg" disabled>
        <CheckCircle2 className="h-6 w-6 text-success" /> Shift complete
      </Button>
    );
  }

  if (!confirming) {
    return (
      <div className="space-y-2">
        <Button
          type="button"
          size="lg"
          variant={isCheckIn ? "primary" : "destructive"}
          className="h-20 w-full text-xl"
          onClick={() => setConfirming(true)}
        >
          {isCheckIn ? (
            <>
              <LogIn className="h-7 w-7" /> Check In
            </>
          ) : (
            <>
              <LogOut className="h-7 w-7" /> Check Out
            </>
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Tap to {actionLabel.toLowerCase()}. You will be asked to confirm — this cannot be undone.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border-2 border-border bg-secondary/60 p-4">
      <p className="text-center text-base font-bold">Confirm {actionLabel}?</p>
      <p className="text-center text-sm text-muted-foreground">
        This records your time now and cannot be changed.
      </p>
      <Button
        type="button"
        size="lg"
        variant={isCheckIn ? "primary" : "destructive"}
        className="h-20 w-full text-xl"
        onClick={onConfirm}
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="h-7 w-7 animate-spin" />
        ) : isCheckIn ? (
          <>
            <LogIn className="h-7 w-7" /> Yes, Check In
          </>
        ) : (
          <>
            <LogOut className="h-7 w-7" /> Yes, Check Out
          </>
        )}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        disabled={pending}
        onClick={() => {
          setConfirming(false);
          setError("");
        }}
      >
        Cancel
      </Button>
      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
