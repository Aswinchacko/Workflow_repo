import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProfileView } from "@/components/profile-view";
import { roleLabels } from "@/lib/labels";

export default async function ProfilePage() {
  const user = await requireUser();

  const employee = await prisma.employee.findUnique({
    where: { id: user.employeeId },
    include: {
      department: { select: { name: true } },
      manager: { select: { name: true, jobTitle: true } },
    },
  });

  if (!employee) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
        <span className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold">
          {roleLabels[user.role]}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        Your User ID is <span className="font-bold text-foreground">{user.userId}</span>
      </p>
      {/* Users always see their own full profile */}
      <ProfileView employee={employee} showFull />
    </div>
  );
}
