import Link from "next/link";
import { requireUser, canApproveProcurement, canApproveClaims } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { attendanceDayKey } from "@/lib/attendance";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CalendarClock,
  Users,
  ShoppingCart,
  Wallet,
  ArrowRight,
  CheckCircle2,
  CircleDashed,
} from "lucide-react";

export default async function HomePage() {
  const user = await requireUser();

  const today = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId: user.employeeId, date: attendanceDayKey(new Date()) } },
  });

  const isCheckedIn = !!today?.checkIn && !today?.checkOut;
  const isDone = !!today?.checkIn && !!today?.checkOut;

  let pendingProcurement = 0;
  let pendingClaims = 0;
  if (canApproveProcurement(user.role)) {
    pendingProcurement = await prisma.procurementRequest.count({
      where: { status: "PENDING" },
    });
  }
  if (canApproveClaims(user.role)) {
    pendingClaims = await prisma.pettyCashClaim.count({ where: { status: "PENDING" } });
  }
  const toReview = pendingProcurement + pendingClaims;

  const firstName = (user.name ?? "there").split(" ")[0];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hello, {firstName}</h1>
        <p className="text-muted-foreground">Here is your day at a glance.</p>
      </div>

      <div className={cn("grid gap-4", toReview > 0 && "lg:grid-cols-2 lg:items-start")}>
      {/* Attendance quick card */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-secondary text-primary">
              <CalendarClock className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-bold">Attendance</p>
              <p className="text-sm text-muted-foreground">
                {isDone
                  ? "You have completed today's shift."
                  : isCheckedIn
                    ? "You are checked in."
                    : "You have not checked in yet."}
              </p>
            </div>
            {isDone ? (
              <CheckCircle2 className="h-6 w-6 text-success" />
            ) : (
              <CircleDashed className="h-6 w-6 text-warning" />
            )}
          </div>
          <Link href="/attendance" className="mt-3 block">
            <Button size="lg" variant={isCheckedIn ? "outline" : "primary"} className="w-full">
              {isDone ? "View attendance" : isCheckedIn ? "Check Out" : "Check In"}
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Approvals needing attention */}
      {toReview > 0 && (
        <Link href="/requests">
          <Card className="border-primary/20 bg-secondary/40">
            <CardContent className="flex items-center gap-3 pt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                {toReview}
              </div>
              <div className="flex-1">
                <p className="font-bold">Waiting for your review</p>
                <p className="text-sm text-muted-foreground">
                  {pendingProcurement > 0 && `${pendingProcurement} material request(s)`}
                  {pendingProcurement > 0 && pendingClaims > 0 && " · "}
                  {pendingClaims > 0 && `${pendingClaims} petty cash claim(s)`}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
        </Link>
      )}
      </div>

      {/* Shortcuts */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Shortcut href="/requests/procurement/new" Icon={ShoppingCart} label="New Material Request" />
        <Shortcut href="/requests/petty-cash/new" Icon={Wallet} label="New Petty Cash Claim" />
        <Shortcut href="/directory" Icon={Users} label="Team Directory" />
        <Shortcut href="/attendance" Icon={CalendarClock} label="My Attendance" />
      </div>
    </div>
  );
}

function Shortcut({
  href,
  Icon,
  label,
}: {
  href: string;
  Icon: typeof Users;
  label: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full transition active:scale-[0.98]">
        <CardContent className="flex h-full flex-col items-start gap-2 pt-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold leading-tight">{label}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
