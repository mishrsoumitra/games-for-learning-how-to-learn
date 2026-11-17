import { describe, expect, it } from 'vitest';
import { dateForDay, dayIndex, localDateKey } from './dates.ts';

describe('dayIndex', () => {
  it('counts local calendar days, not 24-hour blocks', () => {
    const start = new Date(2026, 9, 25, 23, 30).toISOString();
    expect(dayIndex(start, new Date(2026, 9, 25, 23, 59))).toBe(0);
    expect(dayIndex(start, new Date(2026, 9, 26, 0, 10))).toBe(1);
    expect(dayIndex(start, new Date(2026, 9, 27, 12, 0))).toBe(2);
  });

  it('survives month ends', () => {
    const start = new Date(2026, 9, 31, 9, 0).toISOString();
    expect(dayIndex(start, new Date(2026, 10, 2, 9, 0))).toBe(2);
  });
});

describe('dateForDay', () => {
  it('returns the local date for a day offset', () => {
    const start = new Date(2026, 9, 25, 15, 0).toISOString();
    expect(localDateKey(dateForDay(start, 2))).toBe('2026-10-27');
    expect(localDateKey(dateForDay(start, 7))).toBe('2026-11-01');
  });
});
