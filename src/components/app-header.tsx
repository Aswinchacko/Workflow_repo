"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { t } from "@/lib/i18n";

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
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={name} src={photoUrl} size={40} />
          <div className="leading-tight">
            <p className="text-sm font-bold">{name}</p>
            <p className="text-xs text-muted-foreground">{roleLabel}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
          aria-label={t.signOut}
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
