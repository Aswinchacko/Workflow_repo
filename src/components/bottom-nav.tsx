"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navTabs } from "@/components/nav-items";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {navTabs.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-6 w-6", active && "stroke-[2.5]")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
