"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canMarkTeamAttendance } from "@/lib/session";
import { canMarkEmployee } from "@/lib/team-attendance";
import {
  computeShift,
  isLateCheckIn,
  attendanceDayKey,
} from "@/lib/attendance";
import type { EmploymentType } from "@/lib/enums";

export async function toggleAttendance() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const employee = await prisma.employee.findUnique({
    where: { id: user.employeeId },
    select: { employmentType: true },
  });
  if (!employee) throw new Error("Employee not found.");

  const type = employee.employmentType as EmploymentType;
  const now = new Date();
  const day = attendanceDayKey(now);

  const existing = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId: user.employeeId, date: day } },
  });

  if (!existing) {
    // First check-in of the day
    await prisma.attendance.create({
      data: {
        employeeId: user.employeeId,
        date: day,
        checkIn: now,
        isLate: isLateCheckIn(now, type),
        source: "SELF",
      },
    });
  } else if (existing.checkIn && !existing.checkOut) {
    // Check out
    const { hoursWorked, overtimeHours } = computeShift(existing.checkIn, now, type);
    await prisma.attendance.update({
      where: { id: existing.id },
      data: { checkOut: now, hoursWorked, overtimeHours },
    });
  }
  // If already checked out, do nothing.

  revalidatePath("/attendance");
  revalidatePath("/");
}

async function supervisorMark(
  targetEmployeeId: string,
  action: "checkIn" | "checkOut"
) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!canMarkTeamAttendance(user.role)) throw new Error("Not allowed.");

  const allowed = await canMarkEmployee(user.employeeId, user.role, targetEmployeeId);
  if (!allowed) throw new Error("You cannot mark attendance for this person.");

  const employee = await prisma.employee.findUnique({
    where: { id: targetEmployeeId },
    select: { employmentType: true },
  });
  if (!employee) throw new Error("Employee not found.");

  const type = employee.employmentType as EmploymentType;
  const now = new Date();
  const day = attendanceDayKey(now);

  const existing = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId: targetEmployeeId, date: day } },
  });

  if (action === "checkIn") {
    if (existing?.checkIn) throw new Error("Already checked in today.");
    if (existing) {
      await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          checkIn: now,
          isLate: isLateCheckIn(now, type),
          source: "SUPERVISOR",
        },
      });
    } else {
      await prisma.attendance.create({
        data: {
          employeeId: targetEmployeeId,
          date: day,
          checkIn: now,
          isLate: isLateCheckIn(now, type),
          source: "SUPERVISOR",
        },
      });
    }
  } else {
    if (!existing?.checkIn) throw new Error("Not checked in yet.");
    if (existing.checkOut) throw new Error("Already checked out today.");
    const { hoursWorked, overtimeHours } = computeShift(existing.checkIn, now, type);
    await prisma.attendance.update({
      where: { id: existing.id },
      data: { checkOut: now, hoursWorked, overtimeHours, source: "SUPERVISOR" },
    });
  }

  revalidatePath("/attendance/team");
  revalidatePath("/attendance");
}

export async function markTeamCheckIn(formData: FormData) {
  const employeeId = String(formData.get("employeeId") ?? "");
  if (!employeeId) throw new Error("Missing employee.");
  await supervisorMark(employeeId, "checkIn");
}

export async function markTeamCheckOut(formData: FormData) {
  const employeeId = String(formData.get("employeeId") ?? "");
  if (!employeeId) throw new Error("Missing employee.");
  await supervisorMark(employeeId, "checkOut");
}
