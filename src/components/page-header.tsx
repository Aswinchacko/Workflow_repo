import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function PageHeader({
  backHref,
  backLabel,
  title,
  subtitle,
  action,
}: {
  backHref?: string;
  backLabel?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" /> {backLabel}
        </Link>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
