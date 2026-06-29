import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser, canApproveProcurement } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { decideProcurement } from "@/app/(app)/requests/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { RequestTimeline, type TimelineStep } from "@/components/request-timeline";
import { DecisionForm } from "@/components/decision-form";
import { formatCurrency } from "@/lib/utils";
import { fmtDate } from "@/lib/datetime";
import type { RequestStatus } from "@/lib/enums";
import { ChevronLeft } from "lucide-react";

export default async function ProcurementDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser();

  const r = await prisma.procurementRequest.findUnique({
    where: { id: params.id },
    include: {
      requester: { select: { name: true } },
      approver: { select: { name: true } },
    },
  });
  if (!r) notFound();

  const status = r.status as RequestStatus;
  const canDecide = canApproveProcurement(user.role) && status === "PENDING";

  const steps: TimelineStep[] = [
    {
      label: "Submitted",
      detail: `by ${r.requester.name}`,
      at: r.createdAt,
      state: "done",
    },
    status === "PENDING"
      ? { label: "Awaiting manager review", at: null, state: "current" }
      : {
          label: status === "APPROVED" ? "Approved" : "Rejected",
          detail: [r.approver?.name && `by ${r.approver.name}`, r.decisionNote]
            .filter(Boolean)
            .join(" — "),
          at: r.decidedAt,
          state: status === "APPROVED" ? "done" : "rejected",
        },
  ];

  return (
    <div className="space-y-4">
      <Link
        href="/requests/procurement"
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-5 w-5" /> Material Requests
      </Link>

      <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <CardTitle>{r.item}</CardTitle>
            <StatusBadge status={status} size="lg" />
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <Detail label="Quantity" value={`${r.quantity} ${r.unit}`} />
            <Detail label="Project / Site" value={r.project} />
            {r.neededByDate && (
              <Detail label="Needed by" value={fmtDate(r.neededByDate)} />
            )}
            {r.estCost != null && (
              <Detail label="Estimated cost" value={formatCurrency(r.estCost)} />
            )}
            {r.reason && <Detail label="Reason" value={r.reason} />}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <RequestTimeline steps={steps} />
            </CardContent>
          </Card>

          {canDecide && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Review this request</CardTitle>
              </CardHeader>
              <CardContent>
                <DecisionForm id={r.id} action={decideProcurement} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}
