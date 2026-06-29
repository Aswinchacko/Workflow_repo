"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

export function AppHeader({
  name,
  photoUrl,
  roleLabel,
}: {
  name: string;
  photoUrl?: string | null;
  roleLabel: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card shadow-sm lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={name} src={photoUrl} size={40} />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{roleLabel}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
