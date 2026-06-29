"use client";

import { useFormStatus } from "react-dom";
import { markTeamCheckIn, markTeamCheckOut } from "@/app/(app)/attendance/actions";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fmtTime } from "@/lib/datetime";
import { employmentLabels } from "@/lib/labels";
import type { EmploymentType } from "@/lib/enums";
import { LogIn, LogOut, Loader2, CheckCircle2 } from "lucide-react";

export type TeamMemberRow = {
  id: string;
  name: string;
  jobTitle: string;
  employmentType: string;
  departmentName: string | null;
  checkIn: Date | null;
  checkOut: Date | null;
  hoursWorked: number | null;
  isLate: boolean;
  source: string | null;
};

function MarkButton({
  employeeId,
  action,
  label,
  variant,
}: {
  employeeId: string;
  action: "in" | "out";
  label: string;
  variant: "primary" | "destructive";
}) {
  const { pending } = useFormStatus();
  const actionFn = action === "in" ? markTeamCheckIn : markTeamCheckOut;

  return (
    <form action={actionFn}>
      <input type="hidden" name="employeeId" value={employeeId} />
      <Button
        type="submit"
        variant={variant}
        size="default"
        className="min-h-11 w-full sm:w-auto sm:min-w-[120px]"
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : action === "in" ? (
          <>
            <LogIn className="h-4 w-4" /> {label}
          </>
        ) : (
          <>
            <LogOut className="h-4 w-4" /> {label}
          </>
        )}
      </Button>
    </form>
  );
}

function statusOf(m: TeamMemberRow): "none" | "in" | "done" {
  if (!m.checkIn) return "none";
  if (!m.checkOut) return "in";
  return "done";
}

export function TeamAttendanceRoster({ members }: { members: TeamMemberRow[] }) {
  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No team members to mark. Managers see their direct reports; HR sees all staff.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="divide-y divide-border p-0">
        {members.map((m) => {
          const status = statusOf(m);
          return (
            <div key={m.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar name={m.name} size={48} />
                <div className="min-w-0">
                  <p className="truncate font-bold">{m.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {m.jobTitle}
                    {m.departmentName ? ` · ${m.departmentName}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {employmentLabels[m.employmentType as EmploymentType]}
                    {status === "in" && m.checkIn && (
                      <> · In since {fmtTime(m.checkIn)}</>
                    )}
                    {status === "done" && m.checkIn && m.checkOut && (
                      <>
                        {" "}
                        · {fmtTime(m.checkIn)} – {fmtTime(m.checkOut)}
                        {m.hoursWorked != null && ` (${m.hoursWorked}h)`}
                      </>
                    )}
                    {m.source === "SUPERVISOR" && status !== "none" && (
                      <span className="text-primary"> · Marked by supervisor</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {status === "none" && (
                  <MarkButton
                    employeeId={m.id}
                    action="in"
                    label="Mark In"
                    variant="primary"
                  />
                )}
                {status === "in" && (
                  <MarkButton
                    employeeId={m.id}
                    action="out"
                    label="Mark Out"
                    variant="destructive"
                  />
                )}
                {status === "done" && (
                  <span className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-emerald-100 px-4 text-sm font-bold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4" /> Done
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
