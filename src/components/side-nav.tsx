"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { HardHat, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { navTabs } from "@/components/nav-items";
import { Avatar } from "@/components/ui/avatar";
import { t } from "@/lib/i18n";

export function SideNav({
  name,
  photoUrl,
  roleLabel,
}: {
  name: string;
  photoUrl?: string | null;
  roleLabel: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <HardHat className="h-6 w-6" />
        </div>
        <span className="text-lg font-extrabold">{t.appName}</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navTabs.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold transition",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className={cn("h-6 w-6", active && "stroke-[2.5]")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar name={name} src={photoUrl} size={40} />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-bold">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          {t.signOut}
        </button>
      </div>
    </aside>
  );
}
