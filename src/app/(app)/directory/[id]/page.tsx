import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser, canSeeFullProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProfileView } from "@/components/profile-view";
import { ChevronLeft } from "lucide-react";

export default async function EmployeeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser();

  const employee = await prisma.employee.findUnique({
    where: { id: params.id },
    include: {
      department: { select: { name: true } },
      manager: { select: { name: true, jobTitle: true } },
    },
  });

  if (!employee) notFound();

  // Managers/HR see full details; a user always sees their own full profile.
  const isSelf = employee.id === user.employeeId;
  const showFull = isSelf || canSeeFullProfile(user.role);

  return (
    <div className="space-y-4">
      <Link
        href="/directory"
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground"
      >
        <ChevronLeft className="h-5 w-5" /> Directory
      </Link>
      <ProfileView employee={employee} showFull={showFull} />
    </div>
  );
}
