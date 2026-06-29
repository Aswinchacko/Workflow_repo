import { cn } from "@/lib/utils";
import { Check, Clock, X, Wallet } from "lucide-react";

type Status = "PENDING" | "APPROVED" | "REJECTED" | "PAID";

const map: Record<Status, { label: string; className: string; Icon: typeof Clock }> = {
  PENDING: { label: "Pending", className: "chip-warning border border-warning/20", Icon: Clock },
  APPROVED: {
    label: "Approved",
    className: "chip-success border border-success/20",
    Icon: Check,
  },
  REJECTED: {
    label: "Rejected",
    className: "chip-danger border border-destructive/20",
    Icon: X,
  },
  PAID: { label: "Paid", className: "chip-info border border-primary/20", Icon: Wallet },
};

export function StatusBadge({
  status,
  size = "default",
}: {
  status: Status;
  size?: "default" | "lg";
}) {
  const { label, className, Icon } = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-semibold",
        size === "lg" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <Icon className={size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"} />
      {label}
    </span>
  );
}
