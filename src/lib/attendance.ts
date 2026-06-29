import type { EmploymentType } from "@/lib/enums";
import { COMPANY_TZ } from "./datetime";

// Shift rules. In production these would live in a Shift table per group;
// for the demo they are simple constants matching the brief. Hours are in the
// company timezone (Asia/Dubai).
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

/** Minutes-since-midnight of an instant, read in the company timezone. */
function wallClockMinutes(date: Date, tz: string = COMPANY_TZ): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}

/** The day-bucket key for an instant: UTC-midnight Date of the Dubai calendar
 *  date. Used as the unique (employee, date) key so a "day" means a Dubai day
 *  regardless of where the server runs. */
export function attendanceDayKey(date: Date = new Date()): Date {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: COMPANY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return new Date(`${ymd}T00:00:00.000Z`);
}

export function isLateCheckIn(checkIn: Date, type: EmploymentType): boolean {
  const rule = SHIFT_RULES[type];
  const threshold = rule.startHour * 60 + rule.startMinute + rule.graceMinutes;
  return wallClockMinutes(checkIn) > threshold;
}

/** Worked hours (2dp) and overtime hours. Based on elapsed duration, so it is
 *  timezone-independent. */
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
