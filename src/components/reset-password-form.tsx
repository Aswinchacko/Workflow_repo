"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { t } from "@/lib/i18n";

export function ResetPasswordForm() {
  const router = useRouter();
  const { update } = useSession();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (pw.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (pw !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: pw }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }
    await update({ mustResetPassword: false });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <ShieldCheck className="h-9 w-9" />
        </div>
        <h1 className="text-2xl font-extrabold">{t.resetTitle}</h1>
        <p className="mt-1 max-w-xs text-muted-foreground">{t.resetSubtitle}</p>
      </div>

      <Card className="w-full max-w-sm">
        <CardContent className="pt-5">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="pw">{t.newPassword}</Label>
              <Input
                id="pw"
                type="password"
                autoComplete="new-password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirm">{t.confirmPassword}</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Saving..." : t.setPassword}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
