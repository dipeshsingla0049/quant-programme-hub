const TZ = "Asia/Kolkata";

/** "Nov 15, 2026" */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: TZ,
  }).format(new Date(iso));
}

/** "Nov 16 · 17:00 IST" */
export function formatEventStamp(iso: string): string {
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: TZ }).format(d);
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: TZ,
  }).format(d);
  return `${day} · ${time} IST`;
}

/** { day: "16", month: "NOV" } */
export function dayParts(iso: string): { day: string; month: string } {
  const d = new Date(iso);
  return {
    day: new Intl.DateTimeFormat("en-US", { day: "2-digit", timeZone: TZ }).format(d),
    month: new Intl.DateTimeFormat("en-US", { month: "short", timeZone: TZ }).format(d).toUpperCase(),
  };
}

/** "November 2026" */
export function monthLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: TZ }).format(new Date(iso));
}

/** 18296 -> "18,296" */
export function formatInt(n: number): string {
  return n.toLocaleString("en-US");
}

/** 0.74533 -> "0.75"; null -> "—" (no submitted alphas to average). */
export function formatMetric(n: number | null, digits = 2): string {
  return n === null ? "—" : n.toFixed(digits);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((p) => /[a-z]/i.test(p))
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

/** A calendar day (YYYY-MM-DD, IST) as an instant at midday IST, safe to format. */
function dayInstant(day: string): Date {
  return new Date(`${day}T12:00:00+05:30`);
}

/** "2026-11-07" -> "Nov 7" (or "Nov 7, 2026"). */
export function formatDay(day: string, withYear = false): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: TZ,
  }).format(dayInstant(day));
}

/** "Nov 7 – Nov 21". */
export function formatDayRange(start: string, end: string): string {
  return `${formatDay(start)} – ${formatDay(end)}`;
}

/** The last second of a calendar day in IST, as ISO 8601. */
export function endOfDayIst(day: string): string {
  return `${day}T23:59:59+05:30`;
}

/** Midnight at the start of a calendar day in IST, as ISO 8601. */
export function startOfDayIst(day: string): string {
  return `${day}T00:00:00+05:30`;
}
