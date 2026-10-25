const DAY_MS = 86_400_000;

/** Midnight, local time, for the given moment. */
export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * How many local calendar days have passed since `startIso`. The day the run started is
 * day 0; the next morning is day 1, even if only a few hours have passed. Multi-day
 * activities count days this way because a night's sleep is part of the design.
 */
export function dayIndex(startIso: string, now: Date = new Date()): number {
  const start = startOfLocalDay(new Date(startIso));
  const today = startOfLocalDay(now);
  return Math.round((today.getTime() - start.getTime()) / DAY_MS);
}

/** The local date that is `days` calendar days after the start. */
export function dateForDay(startIso: string, days: number): Date {
  const start = startOfLocalDay(new Date(startIso));
  return new Date(start.getFullYear(), start.getMonth(), start.getDate() + days);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function addDays(iso: string, days: number): string {
  return new Date(new Date(iso).getTime() + days * DAY_MS).toISOString();
}

/** A date-only key like 2026-10-25, in local time. */
export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function minutesBetween(aIso: string, bIso: string): number {
  return (new Date(bIso).getTime() - new Date(aIso).getTime()) / 60_000;
}
