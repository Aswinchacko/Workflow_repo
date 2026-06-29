import Link from "next/link";
import { requireUser, canApproveClaims } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, cn } from "@/lib/utils";
import type { ClaimStatus } from "@/lib/enums";
import { format } from "date-fns";
import { Plus, ChevronRight } from "lucide-react";

export default async function PettyCashListPage() {
  const user = await requireUser();
  const isApprover = canApproveClaims(user.role);

  const items = await prisma.pettyCashClaim.findMany({
    where: isApprover ? {} : { requesterId: user.employeeId },
    orderBy: { createdAt: "desc" },
    include: { requester: { select: { name: true } } },
  });

  const pending = items.filter((i) => i.status === "PENDING");
  const decided = items.filter((i) => i.status !== "PENDING");

  return (
    <div className={cn("space-y-5", !isApprover && "lg:mx-auto lg:max-w-3xl")}>
      <PageHeader
        backHref="/requests"
        backLabel="Requests"
        title="Petty Cash"
        action={
          <Link href="/requests/petty-cash/new" className="block">
            <Button size="lg" className="w-full sm:w-auto">
              <Plus className="h-5 w-5" /> New Claim
            </Button>
          </Link>
        }
      />

      <div className={cn("grid gap-5", isApprover && "lg:grid-cols-2 lg:items-start")}>
        {isApprover && (
          <Section title="Waiting for your review" empty="Nothing to review.">
            {pending.map((i) => (
              <Row
                key={i.id}
                href={`/requests/petty-cash/${i.id}`}
                title={`${formatCurrency(i.amount)} · ${i.category}`}
                subtitle={`${i.requester.name} · ${format(i.spentDate, "dd MMM")}`}
                status={i.status as ClaimStatus}
              />
            ))}
          </Section>
        )}

        <Section title={isApprover ? "Decided" : "My claims"} empty="No claims yet.">
          {(isApprover ? decided : items).map((i) => (
            <Row
              key={i.id}
              href={`/requests/petty-cash/${i.id}`}
              title={`${formatCurrency(i.amount)} · ${i.category}`}
              subtitle={format(i.spentDate, "dd MMM yyyy")}
              status={i.status as ClaimStatus}
            />
          ))}
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <section>
      <h2 className="mb-2 px-1 text-sm font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {hasChildren ? (
            children
          ) : (
            <p className="px-4 py-5 text-center text-sm text-muted-foreground">{empty}</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function Row({
  href,
  title,
  subtitle,
  status,
}: {
  href: string;
  title: string;
  subtitle: string;
  status: ClaimStatus;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 active:bg-secondary">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{title}</p>
        <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <StatusBadge status={status} />
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
