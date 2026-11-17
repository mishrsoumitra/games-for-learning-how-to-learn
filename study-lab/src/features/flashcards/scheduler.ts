import type { Card, ReviewState } from '../../data/schemas.ts';
import { nowIso } from '../../lib/dates.ts';

export type Grade = 'again' | 'hard' | 'good' | 'easy';

const DAY_MS = 86_400_000;
const MIN_EASE = 1.3;
const MAX_EASE = 3.5;

/**
 * A spacing scheduler in the family of SM-2 (the one behind Anki and most flashcard apps).
 * The idea is the one from Cram or space: bring a card back just before you would forget it,
 * and stretch the gap each time you remember. "Again" starts the card over. The first gaps
 * are one day and then three days, after which the gap multiplies by the card's ease.
 */
export function nextReview(review: ReviewState, grade: Grade, now: Date = new Date()): ReviewState {
  let ease = review.ease;
  let interval: number;
  let lapses = review.lapses;
  const reps = review.reps + 1;

  if (grade === 'again') {
    ease = Math.max(MIN_EASE, ease - 0.2);
    interval = 0;
    lapses += 1;
  } else if (review.intervalDays === 0) {
    interval = grade === 'easy' ? 3 : grade === 'good' ? 1 : 0.5;
    if (grade === 'hard') ease = Math.max(MIN_EASE, ease - 0.15);
    if (grade === 'easy') ease = Math.min(MAX_EASE, ease + 0.15);
  } else {
    if (grade === 'hard') {
      ease = Math.max(MIN_EASE, ease - 0.15);
      interval = Math.max(1, review.intervalDays * 1.2);
    } else if (grade === 'good') {
      interval = Math.max(1, review.intervalDays * ease);
    } else {
      ease = Math.min(MAX_EASE, ease + 0.15);
      interval = Math.max(1, review.intervalDays * ease * 1.3);
    }
  }
  interval = Math.min(365, Math.round(interval * 10) / 10);
  // A card answered "again" comes back in ten minutes; everything else is due at local midnight
  // of the target day, so a card does not become due at an odd hour.
  const due = interval === 0 ? new Date(now.getTime() + 10 * 60_000) : dueAtMidnight(now, interval);
  return {
    due: due.toISOString(),
    intervalDays: interval,
    ease,
    reps,
    lapses,
    lastReviewedAt: now.toISOString(),
    lastGrade: grade,
  };
}

function dueAtMidnight(now: Date, intervalDays: number): Date {
  const whole = Math.floor(intervalDays);
  if (whole === 0) return new Date(now.getTime() + intervalDays * DAY_MS);
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + whole);
}

export function freshReview(now: Date = new Date()): ReviewState {
  return { due: now.toISOString(), intervalDays: 0, ease: 2.5, reps: 0, lapses: 0 };
}

export function isDue(card: Card, now: Date = new Date()): boolean {
  return new Date(card.review.due).getTime() <= now.getTime();
}

export function dueCards(cards: readonly Card[], now: Date = new Date(), deckId?: string): Card[] {
  return cards
    .filter((c) => (deckId === undefined || c.deckId === deckId) && isDue(c, now))
    .sort((a, b) => a.review.due.localeCompare(b.review.due));
}

/** What a grade would do to the gap, for the buttons. */
export function previewInterval(review: ReviewState, grade: Grade): string {
  const next = nextReview(review, grade);
  if (next.intervalDays === 0) return '10 min';
  if (next.intervalDays < 1) return '12 hours';
  const d = Math.round(next.intervalDays);
  if (d >= 30) return `${Math.round(d / 30)} mo`;
  return `${d} d`;
}

/** Parses pasted lines like "front :: back" or "front<TAB>back" or "front, back". */
export function parsePastedCards(text: string, max = 2000): { front: string; back: string }[] {
  const out: { front: string; back: string }[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === '') continue;
    let parts: string[];
    if (line.includes('::')) parts = line.split('::');
    else if (line.includes('\t')) parts = line.split('\t');
    else if (line.includes(' - ')) parts = line.split(' - ');
    else if (line.includes(',')) parts = line.split(',');
    else continue;
    const front = (parts[0] ?? '').trim();
    const back = parts
      .slice(1)
      .join(parts.length > 2 ? ', ' : '')
      .trim();
    if (front === '' || back === '') continue;
    out.push({ front: front.slice(0, 2000), back: back.slice(0, 2000) });
    if (out.length >= max) break;
  }
  return out;
}

export function touch<T extends { updatedAt: string }>(item: T): T {
  return { ...item, updatedAt: nowIso() };
}
