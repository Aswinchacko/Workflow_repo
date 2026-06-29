import type { EmploymentType } from "@/lib/enums";

// Shift rules. In production these would live in a Shift table per group;
// for the demo they are simple constants matching the brief.
export const SHIFT_RULES = {
  OFFICE: {
    startHour: 8, // 08:00 expected start
    startMinute: 0,
    graceMinutes: 15,
    standardHours: 10, // fixed 10-hour day, no overtime
    overtimeEnabled: false,
  },
  SITE: {
    startHour: 7, // 07:00 expected start
    startMinute: 0,
    graceMinutes: 15,
    standardHours: 8, // hours beyond this count as overtime
    overtimeEnabled: true,
  },
} as const;

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function isLateCheckIn(checkIn: Date, type: EmploymentType): boolean {
  const rule = SHIFT_RULES[type];
  const threshold = new Date(checkIn);
  threshold.setHours(rule.startHour, rule.startMinute + rule.graceMinutes, 0, 0);
  return checkIn.getTime() > threshold.getTime();
}

/** Returns worked hours (2dp) and overtime hours for a completed shift. */
export function computeShift(
  checkIn: Date,
  checkOut: Date,
  type: EmploymentType
): { hoursWorked: number; overtimeHours: number } {
  const rule = SHIFT_RULES[type];
  const ms = Math.max(0, checkOut.getTime() - checkIn.getTime());
  const hoursWorked = Math.round((ms / 3_600_000) * 100) / 100;

  let overtimeHours = 0;
  if (rule.overtimeEnabled && hoursWorked > rule.standardHours) {
    overtimeHours = Math.round((hoursWorked - rule.standardHours) * 100) / 100;
  }
  return { hoursWorked, overtimeHours };
}
