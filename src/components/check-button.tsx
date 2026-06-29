"use client";

import { useFormStatus } from "react-dom";
import { toggleAttendance } from "@/app/(app)/attendance/actions";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, CheckCircle2, Loader2 } from "lucide-react";

type State = "in" | "out" | "done";

function Inner({ state }: { state: State }) {
  const { pending } = useFormStatus();

  if (state === "done") {
    return (
      <Button
        type="button"
        size="lg"
        variant="outline"
        className="h-20 w-full text-lg"
        disabled
      >
        <CheckCircle2 className="h-6 w-6 text-emerald-600" /> Shift complete
      </Button>
    );
  }

  const isCheckIn = state === "in";
  return (
    <Button
      type="submit"
      size="lg"
      variant={isCheckIn ? "primary" : "destructive"}
      className="h-20 w-full text-xl"
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="h-7 w-7 animate-spin" />
      ) : isCheckIn ? (
        <>
          <LogIn className="h-7 w-7" /> Check In
        </>
      ) : (
        <>
          <LogOut className="h-7 w-7" /> Check Out
        </>
      )}
    </Button>
  );
}

export function CheckButton({ state }: { state: State }) {
  return (
    <form action={toggleAttendance}>
      <Inner state={state} />
    </form>
  );
}
