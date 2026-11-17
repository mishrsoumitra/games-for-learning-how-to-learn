import { describe, expect, it } from 'vitest';
import { freshReview, isDue, nextReview, parsePastedCards, previewInterval } from './scheduler.ts';

describe('scheduler', () => {
  it('stretches the gap on good answers and resets on again', () => {
    const now = new Date(2026, 9, 25, 10);
    const first = nextReview(freshReview(now), 'good', now);
    expect(first.intervalDays).toBe(1);
    expect(new Date(first.due).getDate()).toBe(26);
    const second = nextReview(first, 'good', new Date(2026, 9, 26, 10));
    expect(second.intervalDays).toBeCloseTo(2.5, 1);
    const lapse = nextReview(second, 'again', new Date(2026, 9, 28, 10));
    expect(lapse.intervalDays).toBe(0);
    expect(lapse.lapses).toBe(1);
    expect(lapse.ease).toBeCloseTo(2.3, 5);
  });

  it('keeps ease inside its bounds and intervals under a year', () => {
    let r = freshReview();
    for (let i = 0; i < 30; i++) r = nextReview(r, 'easy');
    expect(r.ease).toBeLessThanOrEqual(3.5);
    expect(r.intervalDays).toBeLessThanOrEqual(365);
    for (let i = 0; i < 30; i++) r = nextReview(r, 'again');
    expect(r.ease).toBeGreaterThanOrEqual(1.3);
  });

  it('reports due cards', () => {
    const now = new Date();
    const card = {
      id: 'c',
      deckId: 'd',
      front: 'a',
      back: 'b',
      hint: '',
      mnemonicId: null,
      tags: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      review: freshReview(now),
    };
    expect(isDue(card, now)).toBe(true);
    const later = { ...card, review: nextReview(card.review, 'easy', now) };
    expect(isDue(later, now)).toBe(false);
    expect(previewInterval(card.review, 'again')).toBe('10 min');
  });

  it('parses pasted lines in several shapes', () => {
    const parsed = parsePastedCards(
      'force :: mass × acceleration\nwork\tforce × distance\nspeed - distance / time\n\nbad line\nohm, V / I',
    );
    expect(parsed).toEqual([
      { front: 'force', back: 'mass × acceleration' },
      { front: 'work', back: 'force × distance' },
      { front: 'speed', back: 'distance / time' },
      { front: 'ohm', back: 'V / I' },
    ]);
  });
});
