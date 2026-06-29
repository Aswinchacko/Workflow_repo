import { cn } from "@/lib/utils";
import { fmtDateTime } from "@/lib/datetime";
import { Check, Clock, X, Wallet } from "lucide-react";

export type TimelineStep = {
  label: string;
  detail?: string | null;
  at?: Date | null;
  state: "done" | "current" | "rejected" | "paid" | "upcoming";
};

const dot: Record<TimelineStep["state"], string> = {
  done: "bg-success text-success-foreground",
  current: "bg-warning text-warning-foreground",
  rejected: "bg-destructive text-destructive-foreground",
  paid: "bg-primary text-primary-foreground",
  upcoming: "bg-secondary text-muted-foreground",
};

function Icon({ state }: { state: TimelineStep["state"] }) {
  const cls = "h-4 w-4";
  if (state === "rejected") return <X className={cls} />;
  if (state === "current") return <Clock className={cls} />;
  if (state === "paid") return <Wallet className={cls} />;
  if (state === "done") return <Check className={cls} />;
  return <Clock className={cls} />;
}

export function RequestTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((s, idx) => (
        <li key={idx} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md",
                dot[s.state]
              )}
            >
              <Icon state={s.state} />
            </span>
            {idx < steps.length - 1 && <span className="w-px flex-1 bg-border" />}
          </div>
          <div className={cn("pb-5", idx === steps.length - 1 && "pb-0")}>
            <p className="font-semibold leading-tight text-foreground">{s.label}</p>
            {s.detail && <p className="text-sm text-muted-foreground">{s.detail}</p>}
            {s.at && (
              <p className="text-xs text-muted-foreground">{fmtDateTime(s.at)}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
