import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser, canApproveClaims } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { decideClaim, markClaimPaid } from "@/app/(app)/requests/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { RequestTimeline, type TimelineStep } from "@/components/request-timeline";
import { DecisionForm } from "@/components/decision-form";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency, parseJsonArray } from "@/lib/utils";
import type { ClaimStatus } from "@/lib/enums";
import { format } from "date-fns";
import { ChevronLeft, FileText } from "lucide-react";

export default async function PettyCashDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser();

  const c = await prisma.pettyCashClaim.findUnique({
    where: { id: params.id },
    include: {
      requester: { select: { name: true } },
      approver: { select: { name: true } },
    },
  });
  if (!c) notFound();

  const status = c.status as ClaimStatus;
  const isApprover = canApproveClaims(user.role);
  const attachments = parseJsonArray(c.attachments);

  const steps: TimelineStep[] = [
    { label: "Submitted", detail: `by ${c.requester.name}`, at: c.createdAt, state: "done" },
  ];
  if (status === "PENDING") {
    steps.push({ label: "Awaiting finance review", at: null, state: "current" });
  } else if (status === "REJECTED") {
    steps.push({
      label: "Rejected",
      detail: [c.approver?.name && `by ${c.approver.name}`, c.decisionNote]
        .filter(Boolean)
        .join(" — "),
      at: c.decidedAt,
      state: "rejected",
    });
  } else {
    steps.push({
      label: "Approved",
      detail: [c.approver?.name && `by ${c.approver.name}`, c.decisionNote]
        .filter(Boolean)
        .join(" — "),
      at: c.decidedAt,
      state: "done",
    });
    steps.push(
      status === "PAID"
        ? {
            label: "Paid",
            detail: c.paymentRef ? `Ref: ${c.paymentRef}` : null,
            at: c.paidAt,
            state: "paid",
          }
        : { label: "Awaiting payment", at: null, state: "current" }
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/requests/petty-cash"
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-5 w-5" /> Petty Cash
      </Link>

      <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <CardTitle>{formatCurrency(c.amount)}</CardTitle>
              <StatusBadge status={status} size="lg" />
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <Detail label="Category" value={c.category} />
              <Detail label="Date spent" value={format(c.spentDate, "dd MMM yyyy")} />
              {c.description && <Detail label="Description" value={c.description} />}
            </CardContent>
          </Card>

          {attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Receipts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {attachments.map((url) => {
                    const isPdf = url.toLowerCase().endsWith(".pdf");
                    return (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-square overflow-hidden rounded-lg border border-border bg-secondary"
                      >
                        {isPdf ? (
                          <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
                            <FileText className="h-7 w-7" />
                            <span className="mt-1 text-[10px]">PDF</span>
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={url} alt="Receipt" className="h-full w-full object-cover" />
                        )}
                      </a>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <RequestTimeline steps={steps} />
            </CardContent>
          </Card>

          {isApprover && status === "PENDING" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Review this claim</CardTitle>
              </CardHeader>
              <CardContent>
                <DecisionForm id={c.id} action={decideClaim} />
              </CardContent>
            </Card>
          )}

          {isApprover && status === "APPROVED" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Release payment</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={markClaimPaid} className="space-y-3">
                  <input type="hidden" name="id" value={c.id} />
                  <div>
                    <Label htmlFor="paymentRef">Payment reference (optional)</Label>
                    <Input id="paymentRef" name="paymentRef" placeholder="e.g. PC-2026-0050" />
                  </div>
                  <Button type="submit" size="lg" variant="success" className="w-full">
                    Mark as Paid
                  </Button>
                </form>
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
