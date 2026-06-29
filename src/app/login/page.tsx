"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { t } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      userId,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(t.invalidLogin);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <HardHat className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t.appName}</h1>
        <p className="mt-2 text-base text-muted-foreground">Sign in to continue</p>
      </div>

      <Card className="w-full max-w-md shadow-elevated">
        <CardContent className="pt-5">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="userId">{t.userId}</Label>
              <Input
                id="userId"
                autoCapitalize="none"
                autoComplete="username"
                inputMode="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. EMP1001"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">{t.password}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : t.signIn}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-8 max-w-sm text-center text-sm text-muted-foreground">
        Use the User ID and password given to you by your manager.
      </p>
    </div>
  );
}
