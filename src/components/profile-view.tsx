import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { parseJsonArray } from "@/lib/utils";
import { employmentLabels } from "@/lib/labels";
import type { EmploymentType } from "@/lib/enums";
import { format } from "date-fns";
import {
  Phone,
  Building2,
  Briefcase,
  UserCog,
  MapPin,
  CalendarDays,
  ShieldAlert,
  Lock,
} from "lucide-react";

type EmployeeData = {
  name: string;
  jobTitle: string;
  photoUrl: string | null;
  phone: string | null;
  employmentType: string;
  siteAssignment: string | null;
  joiningDate: Date | null;
  skills: string;
  emergencyContact: string | null;
  visaExpiry: Date | null;
  department: { name: string } | null;
  manager: { name: string; jobTitle: string } | null;
};

function Row({
  Icon,
  label,
  value,
}: {
  Icon: typeof Phone;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}

export function ProfileView({
  employee,
  showFull,
}: {
  employee: EmployeeData;
  showFull: boolean;
}) {
  const skills = parseJsonArray(employee.skills);

  return (
    <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
      <Card className="lg:sticky lg:top-8">
        <CardContent className="flex flex-col items-center pt-6 text-center">
          <Avatar name={employee.name} src={employee.photoUrl} size={112} />
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">{employee.name}</h1>
          <p className="text-muted-foreground">{employee.jobTitle}</p>
          {employee.department?.name && (
            <span className="mt-3 rounded-full bg-secondary px-3 py-1 text-sm font-semibold">
              {employee.department.name}
            </span>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4 lg:col-span-2">
      {/* Basic info: visible to everyone */}
      <Card>
        <CardContent className="divide-y divide-border p-0">
          <Row Icon={Building2} label="Department" value={employee.department?.name ?? "—"} />
          <Row Icon={Briefcase} label="Job Title" value={employee.jobTitle} />
          <Row
            Icon={Phone}
            label="Work Phone"
            value={
              employee.phone ? (
                <a href={`tel:${employee.phone}`} className="text-primary">
                  {employee.phone}
                </a>
              ) : (
                "—"
              )
            }
          />
        </CardContent>
      </Card>

      {/* Full info: managers / HR / self only */}
      {showFull ? (
        <Card>
          <CardContent className="divide-y divide-border p-0">
            <Row
              Icon={UserCog}
              label="Reports To"
              value={
                employee.manager
                  ? `${employee.manager.name} · ${employee.manager.jobTitle}`
                  : "—"
              }
            />
            <Row
              Icon={Briefcase}
              label="Employment Type"
              value={employmentLabels[employee.employmentType as EmploymentType]}
            />
            <Row Icon={MapPin} label="Site Assignment" value={employee.siteAssignment ?? "—"} />
            <Row
              Icon={CalendarDays}
              label="Joining Date"
              value={employee.joiningDate ? format(employee.joiningDate, "dd MMM yyyy") : "—"}
            />
            <Row
              Icon={ShieldAlert}
              label="Emergency Contact"
              value={employee.emergencyContact ?? "—"}
            />
            <div className="px-4 py-3">
              <p className="mb-2 flex items-center gap-3 text-xs font-medium text-muted-foreground">
                <Briefcase className="h-5 w-5" /> Skills
              </p>
              <div className="flex flex-wrap gap-2 pl-8">
                {skills.length > 0 ? (
                  skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-secondary px-3 py-1 text-sm font-medium"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex items-center gap-3 py-4 text-muted-foreground">
            <Lock className="h-5 w-5 shrink-0" />
            <p className="text-sm">
              Full details (reporting line, skills, site) are visible to managers only.
            </p>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
