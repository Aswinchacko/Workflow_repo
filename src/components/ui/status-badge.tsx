import { cn } from "@/lib/utils";
import { Check, Clock, X, Wallet } from "lucide-react";

type Status = "PENDING" | "APPROVED" | "REJECTED" | "PAID";

const map: Record<Status, { label: string; className: string; Icon: typeof Clock }> = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-100 text-amber-900 border-amber-300",
    Icon: Clock,
  },
  APPROVED: {
    label: "Approved",
    className: "bg-emerald-100 text-emerald-900 border-emerald-300",
    Icon: Check,
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 border-red-300",
    Icon: X,
  },
  PAID: {
    label: "Paid",
    className: "bg-blue-100 text-blue-900 border-blue-300",
    Icon: Wallet,
  },
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
        "inline-flex items-center gap-1.5 rounded-full border font-bold",
        size === "lg" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <Icon className={size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"} />
      {label}
    </span>
  );
}
