import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/enums";

/** Employees this user may mark attendance for. Managers → direct reports; HR → everyone else. */
export async function getTeamMembersForMarking(
  actorEmployeeId: string,
  role: Role
) {
  if (role === "ADMIN_HR") {
    return prisma.employee.findMany({
      where: { id: { not: actorEmployeeId } },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        jobTitle: true,
        employmentType: true,
        department: { select: { name: true } },
      },
    });
  }

  if (role === "MANAGER") {
    return prisma.employee.findMany({
      where: { managerId: actorEmployeeId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        jobTitle: true,
        employmentType: true,
        department: { select: { name: true } },
      },
    });
  }

  return [];
}

export async function canMarkEmployee(
  actorEmployeeId: string,
  role: Role,
  targetEmployeeId: string
): Promise<boolean> {
  if (targetEmployeeId === actorEmployeeId) return false;
  if (role === "ADMIN_HR") return true;
  if (role === "MANAGER") {
    const emp = await prisma.employee.findFirst({
      where: { id: targetEmployeeId, managerId: actorEmployeeId },
      select: { id: true },
    });
    return !!emp;
  }
  return false;
}
