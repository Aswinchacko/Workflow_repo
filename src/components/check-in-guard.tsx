"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import { toggleAttendance } from "@/app/(app)/attendance/actions";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, CheckCircle2, Loader2, Fingerprint, Monitor } from "lucide-react";

type State = "in" | "out" | "done";

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

async function postJSON(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

async function verifyIdentity() {
  const auth = await postJSON("/api/webauthn/authenticate/options");
  if (auth.hasCredentials) {
    const assertion = await startAuthentication({ optionsJSON: auth.options });
    const result = await postJSON("/api/webauthn/authenticate/verify", assertion);
    if (!result.verified) throw new Error("Could not verify your identity.");
  } else {
    const reg = await postJSON("/api/webauthn/register/options");
    const attestation = await startRegistration({ optionsJSON: reg.options });
    const result = await postJSON("/api/webauthn/register/verify", attestation);
    if (!result.verified) throw new Error("Could not set up device verification.");
  }
}

function friendlyError(raw: string, mobile: boolean): string {
  if (/USB|Bluetooth|security key/i.test(raw)) {
    return mobile
      ? "Use your phone fingerprint or screen PIN only — not a security key."
      : "Use your Windows PIN or password only — do not choose a USB or Bluetooth key.";
  }
  if (/NotAllowed|timed out|cancel|abort/i.test(raw)) {
    return mobile
      ? "Verification cancelled. When the prompt appears, use your phone fingerprint or screen PIN."
      : "Verification cancelled. When Windows Hello appears, enter your PC PIN or password. Do not pick a USB key.";
  }
  if (/NotSupported|not supported|secure context/i.test(raw)) {
    return mobile
      ? "Your phone browser does not support fingerprint/PIN verification here."
      : "Set up Windows Hello (PIN) in PC Settings, then try again.";
  }
  return raw;
}

export function CheckInGuard({ state }: { state: State }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const mobile = isMobileDevice();

  if (state === "done") {
    return (
      <Button size="lg" variant="outline" className="h-20 w-full text-lg" disabled>
        <CheckCircle2 className="h-6 w-6 text-emerald-600" /> Shift complete
      </Button>
    );
  }

  const isCheckIn = state === "in";

  async function handle() {
    setBusy(true);
    setError("");
    try {
      await verifyIdentity();
      await toggleAttendance();
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(friendlyError(msg, mobile));
    } finally {
      setBusy(false);
    }
  }

  const HintIcon = mobile ? Fingerprint : Monitor;
  const hint = mobile
    ? "Use your phone fingerprint or screen PIN. This cannot be undone."
    : "Use your Windows PIN or password when prompted. No USB key. This cannot be undone.";

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="lg"
        variant={isCheckIn ? "primary" : "destructive"}
        className="h-20 w-full text-xl"
        onClick={handle}
        disabled={busy}
      >
        {busy ? (
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

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <HintIcon className="h-4 w-4 shrink-0" />
        {hint}
      </p>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
