import Link from "next/link";
import { requireUser, canMarkTeamAttendance } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { attendanceDayKey, SHIFT_RULES } from "@/lib/attendance";
import { fmtFullDate, fmtTime, fmtDayNum, fmtMonth } from "@/lib/datetime";
import { employmentLabels } from "@/lib/labels";
import type { EmploymentType } from "@/lib/enums";
import { Card, CardContent } from "@/components/ui/card";
import { CheckInGuard } from "@/components/check-in-guard";
import { cn } from "@/lib/utils";
import { Clock, AlertCircle, TrendingUp, Users, ChevronRight } from "lucide-react";

export default async function AttendancePage() {
  const user = await requireUser();

  const employee = await prisma.employee.findUnique({
    where: { id: user.employeeId },
    select: { employmentType: true },
  });
  if (!employee) throw new Error("Account not found. Sign out and sign in again.");

  const type: EmploymentType = employee.employmentType === "SITE" ? "SITE" : "OFFICE";
  const rule = SHIFT_RULES[type];

  const today = attendanceDayKey(new Date());
  const todayRec = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId: user.employeeId, date: today } },
  });

  const history = await prisma.attendance.findMany({
    where: { employeeId: user.employeeId, date: { lt: today } },
    orderBy: { date: "desc" },
    take: 14,
  });

  const state: "in" | "out" | "done" =
    !todayRec?.checkIn ? "in" : !todayRec.checkOut ? "out" : "done";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">
          {employmentLabels[type]} ·{" "}
          {rule.overtimeEnabled
            ? `Overtime after ${rule.standardHours}h`
            : `Standard ${rule.standardHours}h day`}
        </p>
      </div>

      {canMarkTeamAttendance(user.role) && (
        <Link href="/attendance/team">
          <Card className="border-primary/20 bg-secondary/50 transition hover:border-primary/40">
            <CardContent className="flex items-center gap-3 pt-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Users className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold">Mark team attendance</p>
                <p className="text-sm text-muted-foreground">
                  Check in or out for your crew
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
        </Link>
      )}

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
      {/* Today card */}
      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              {fmtFullDate(new Date())}
            </p>
            <div className="mt-2 flex items-center justify-center gap-6">
              <TimeStat label="Check In" value={todayRec?.checkIn} />
              <div className="h-8 w-px bg-border" />
              <TimeStat label="Check Out" value={todayRec?.checkOut} />
            </div>
            {todayRec?.isLate && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-md chip-warning px-2.5 py-1 text-xs font-semibold">
                <AlertCircle className="h-3.5 w-3.5" /> Late check-in
              </span>
            )}
          </div>

          <CheckInGuard state={state} />

          {state === "done" && todayRec && (
            <p className="text-center text-sm text-muted-foreground">
              You worked <span className="font-bold text-foreground">{todayRec.hoursWorked}h</span>
              {todayRec.overtimeHours > 0 && (
                <>
                  {" "}
                  including{" "}
                  <span className="font-bold text-foreground">{todayRec.overtimeHours}h</span>{" "}
                  overtime
                </>
              )}
              .
            </p>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <section>
        <h2 className="mb-2 px-1 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Recent days
        </h2>
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {history.length === 0 ? (
              <p className="px-4 py-5 text-center text-sm text-muted-foreground">
                No past records yet.
              </p>
            ) : (
              history.map((rec) => (
                <div key={rec.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-12 text-center">
                    <p className="text-lg font-bold leading-none">{fmtDayNum(rec.date)}</p>
                    <p className="text-xs text-muted-foreground">{fmtMonth(rec.date)}</p>
                  </div>
                  <div className="flex-1">
                    <p className="flex items-center gap-1.5 font-semibold">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {rec.checkIn ? fmtTime(rec.checkIn) : "—"} –{" "}
                      {rec.checkOut ? fmtTime(rec.checkOut) : "—"}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {rec.isLate && <Tag className="chip-warning">Late</Tag>}
                      {rec.overtimeHours > 0 && (
                        <Tag className="chip-info">
                          <TrendingUp className="h-3 w-3" /> +{rec.overtimeHours}h OT
                        </Tag>
                      )}
                    </div>
                  </div>
                  <span className="font-bold">{rec.hoursWorked ?? "—"}h</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
      </div>
    </div>
  );
}

function TimeStat({ label, value }: { label: string; value?: Date | null }) {
  const [time, period] = value ? fmtTime(value).split(" ") : ["--:--", ""];
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{time}</p>
      <p className="text-xs text-muted-foreground">{period}</p>
    </div>
  );
}

function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
        className
      )}
    >
      {children}
    </span>
  );
}
