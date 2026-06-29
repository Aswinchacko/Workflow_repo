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
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar lg:flex">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sidebar-active">
          <HardHat className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="block text-base font-semibold text-sidebar-foreground">
            {t.appName}
          </span>
          <span className="text-xs text-sidebar-muted">Workforce portal</span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {navTabs.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-[15px] font-medium transition-colors",
                active
                  ? "bg-sidebar-active text-white"
                  : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", active && "stroke-[2.5]")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <Avatar name={name} src={photoUrl} size={40} className="border-white/20 bg-white/10 text-white" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">{name}</p>
            <p className="truncate text-xs text-sidebar-muted">{roleLabel}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-hover hover:text-sidebar-foreground"
        >
          <LogOut className="h-5 w-5" />
          {t.signOut}
        </button>
      </div>
    </aside>
  );
}
