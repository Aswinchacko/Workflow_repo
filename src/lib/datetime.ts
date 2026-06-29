// Company timezone. Used for date rules (e.g. "needed-by must be in the future")
// so they behave consistently regardless of where the server runs (Vercel = UTC).
export const COMPANY_TZ = "Asia/Dubai";

/** YYYY-MM-DD for a given instant in a timezone. */
export function ymdInTz(date: Date, tz: string = COMPANY_TZ): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function todayYmd(tz: string = COMPANY_TZ): string {
  return ymdInTz(new Date(), tz);
}

export function addDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function tomorrowYmd(tz: string = COMPANY_TZ): string {
  return addDaysYmd(todayYmd(tz), 1);
}

// ── Display helpers (always render in the company timezone) ──────────────────
function fmt(date: Date, opts: Intl.DateTimeFormatOptions, tz: string = COMPANY_TZ) {
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, ...opts }).format(date);
}

export const fmtTime = (d: Date) =>
  fmt(d, { hour: "numeric", minute: "2-digit", hour12: true });

export const fmtFullDate = (d: Date) =>
  fmt(d, { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

export const fmtDate = (d: Date) =>
  fmt(d, { day: "2-digit", month: "short", year: "numeric" });

export const fmtDayNum = (d: Date) => fmt(d, { day: "2-digit" });
export const fmtMonth = (d: Date) => fmt(d, { month: "short" });

export const fmtDateTime = (d: Date) =>
  fmt(d, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
