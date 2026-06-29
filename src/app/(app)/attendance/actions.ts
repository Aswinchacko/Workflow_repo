"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import {
  computeShift,
  isLateCheckIn,
  startOfDay,
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
  const day = startOfDay(now);

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
