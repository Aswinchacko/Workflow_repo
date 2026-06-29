import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser, canMarkTeamAttendance } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getTeamMembersForMarking } from "@/lib/team-attendance";
import { attendanceDayKey } from "@/lib/attendance";
import { fmtFullDate } from "@/lib/datetime";
import { TeamAttendanceRoster, type TeamMemberRow } from "@/components/team-attendance-roster";
import { ChevronLeft, Users } from "lucide-react";

export default async function TeamAttendancePage() {
  const user = await requireUser();
  if (!canMarkTeamAttendance(user.role)) redirect("/attendance");

  const today = attendanceDayKey(new Date());
  const team = await getTeamMembersForMarking(user.employeeId, user.role);
  const teamIds = team.map((t) => t.id);

  const records =
    teamIds.length > 0
      ? await prisma.attendance.findMany({
          where: { employeeId: { in: teamIds }, date: today },
        })
      : [];

  const byEmployee = new Map(records.map((r) => [r.employeeId, r]));

  const rows: TeamMemberRow[] = team.map((t) => {
    const rec = byEmployee.get(t.id);
    return {
      id: t.id,
      name: t.name,
      jobTitle: t.jobTitle,
      employmentType: t.employmentType,
      departmentName: t.department?.name ?? null,
      checkIn: rec?.checkIn ?? null,
      checkOut: rec?.checkOut ?? null,
      hoursWorked: rec?.hoursWorked ?? null,
      isLate: rec?.isLate ?? false,
      source: rec?.source ?? null,
    };
  });

  const pending = rows.filter((r) => !r.checkIn).length;
  const onSite = rows.filter((r) => r.checkIn && !r.checkOut).length;
  const done = rows.filter((r) => r.checkIn && r.checkOut).length;

  return (
    <div className="space-y-5">
      <Link
        href="/attendance"
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-5 w-5" /> My Attendance
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold">Mark Team Attendance</h1>
        <p className="text-muted-foreground">{fmtFullDate(new Date())}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center sm:gap-3">
        <StatBox label="Not in" value={pending} tone="amber" />
        <StatBox label="On site" value={onSite} tone="primary" />
        <StatBox label="Finished" value={done} tone="green" />
      </div>

      <section>
        <h2 className="mb-2 flex items-center gap-2 px-1 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          <Users className="h-4 w-4" /> Your team · {rows.length}
        </h2>
        <TeamAttendanceRoster members={rows} />
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Tap Mark In or Mark Out for each person. Times are recorded in Dubai time (GST).
      </p>
    </div>
  );
}

function StatBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "amber" | "primary" | "green";
}) {
  const bg =
    tone === "amber"
      ? "bg-amber-100 text-amber-900"
      : tone === "green"
        ? "bg-emerald-100 text-emerald-900"
        : "bg-primary/10 text-primary";
  return (
    <div className={`rounded-xl px-2 py-3 ${bg}`}>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs font-semibold">{label}</p>
    </div>
  );
}
