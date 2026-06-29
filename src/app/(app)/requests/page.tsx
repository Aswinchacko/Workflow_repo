import Link from "next/link";
import { requireUser, canApproveProcurement, canApproveClaims } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Wallet, ChevronRight } from "lucide-react";

export default async function RequestsPage() {
  const user = await requireUser();

  const canProc = canApproveProcurement(user.role);
  const canClaim = canApproveClaims(user.role);

  const [procPending, claimPending, myProc, myClaims] = await Promise.all([
    canProc ? prisma.procurementRequest.count({ where: { status: "PENDING" } }) : 0,
    canClaim ? prisma.pettyCashClaim.count({ where: { status: "PENDING" } }) : 0,
    prisma.procurementRequest.count({ where: { requesterId: user.employeeId } }),
    prisma.pettyCashClaim.count({ where: { requesterId: user.employeeId } }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold">Requests</h1>
        <p className="text-muted-foreground">Material purchases and petty cash claims.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <HubCard
          href="/requests/procurement"
          Icon={ShoppingCart}
          title="Material Requests"
          subtitle={`${myProc} submitted by you`}
          badge={canProc && procPending > 0 ? procPending : undefined}
          badgeLabel="to review"
        />
        <HubCard
          href="/requests/petty-cash"
          Icon={Wallet}
          title="Petty Cash"
          subtitle={`${myClaims} submitted by you`}
          badge={canClaim && claimPending > 0 ? claimPending : undefined}
          badgeLabel="to review"
        />
      </div>
    </div>
  );
}

function HubCard({
  href,
  Icon,
  title,
  subtitle,
  badge,
  badgeLabel,
}: {
  href: string;
  Icon: typeof Wallet;
  title: string;
  subtitle: string;
  badge?: number;
  badgeLabel: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition active:scale-[0.99]">
        <CardContent className="flex items-center gap-3 pt-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="font-bold">{title}</p>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {badge ? (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
              {badge} {badgeLabel}
            </span>
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
