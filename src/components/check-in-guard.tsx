"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import { toggleAttendance } from "@/app/(app)/attendance/actions";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, CheckCircle2, Loader2, Fingerprint } from "lucide-react";

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

function setupKey(userId: string) {
  return `webauthn-ready-${window.location.hostname}-${userId}`;
}

function isDeviceSetUp(userId: string) {
  try {
    return localStorage.getItem(setupKey(userId)) === "1";
  } catch {
    return false;
  }
}

function markDeviceSetUp(userId: string) {
  try {
    localStorage.setItem(setupKey(userId), "1");
  } catch {
    /* private browsing */
  }
}

async function enrollOnThisDevice() {
  const reg = await postJSON("/api/webauthn/register/options");
  const attestation = await startRegistration({ optionsJSON: reg.options });
  const result = await postJSON("/api/webauthn/register/verify", attestation);
  if (!result.verified) throw new Error("Could not set up fingerprint/PIN.");
}

function needsEnrollmentOnThisDevice(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const name = err instanceof DOMException ? err.name : "";
  return (
    name === "NotAllowedError" ||
    /passkey|no credentials|not found|not available|unknown credential/i.test(msg)
  );
}

/** Mobile only: fingerprint or screen PIN via WebAuthn. */
async function verifyMobileIdentity(userId: string) {
  const auth = await postJSON("/api/webauthn/authenticate/options");
  const setUpHere = isDeviceSetUp(userId);

  if (!auth.hasCredentials || !setUpHere) {
    await enrollOnThisDevice();
    markDeviceSetUp(userId);
    return;
  }

  try {
    const assertion = await startAuthentication({ optionsJSON: auth.options });
    const result = await postJSON("/api/webauthn/authenticate/verify", assertion);
    if (!result.verified) throw new Error("Could not verify your identity.");
    markDeviceSetUp(userId);
  } catch (e) {
    if (needsEnrollmentOnThisDevice(e)) {
      await enrollOnThisDevice();
      markDeviceSetUp(userId);
      return;
    }
    throw e;
  }
}

function mobileErrorMessage(raw: string): string {
  if (/credential manager|NotSupported|not supported/i.test(raw)) {
    return "Could not use fingerprint/PIN. Open this site in Chrome or Safari (not an in-app browser), then try again.";
  }
  if (/NotAllowed|cancel|abort/i.test(raw)) {
    return "Verification cancelled. Use your fingerprint or screen PIN when prompted.";
  }
  if (/USB|Bluetooth|security key/i.test(raw)) {
    return "Use your phone fingerprint or screen PIN only.";
  }
  return raw;
}

/** PC: tap → confirm → check in (no fingerprint/PIN). */
function DesktopCheckIn({ state }: { state: "in" | "out" }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const isCheckIn = state === "in";
  const actionLabel = isCheckIn ? "Check In" : "Check Out";

  async function onConfirm() {
    setPending(true);
    try {
      await toggleAttendance();
      setConfirming(false);
      router.refresh();
    } finally {
      setPending(false);
    }
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
        onClick={() => setConfirming(false)}
      >
        Cancel
      </Button>
    </div>
  );
}

/** Mobile: fingerprint / screen PIN, then check in. */
function MobileCheckIn({ state, userId }: { state: "in" | "out"; userId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const isCheckIn = state === "in";

  async function handle() {
    setPending(true);
    setError("");
    try {
      await verifyMobileIdentity(userId);
      await toggleAttendance();
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(mobileErrorMessage(msg));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="lg"
        variant={isCheckIn ? "primary" : "destructive"}
        className="h-20 w-full text-xl"
        onClick={handle}
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
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Fingerprint className="h-4 w-4 shrink-0" />
        Use your fingerprint or screen PIN. This cannot be undone.
      </p>
      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function CheckInGuard({ state, userId }: { state: State; userId: string }) {
  const mobile = isMobileDevice();

  if (state === "done") {
    return (
      <Button size="lg" variant="outline" className="h-20 w-full text-lg" disabled>
        <CheckCircle2 className="h-6 w-6 text-success" /> Shift complete
      </Button>
    );
  }

  if (mobile) {
    return <MobileCheckIn state={state} userId={userId} />;
  }

  return <DesktopCheckIn state={state} />;
}
