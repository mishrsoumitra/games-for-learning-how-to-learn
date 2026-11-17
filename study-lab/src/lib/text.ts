/**
 * Puts a typed answer into a plain form before comparing: lower case, no accents, no
 * leading "a", "an" or "the", no punctuation, single spaces.
 */
export function normaliseAnswer(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(a|an|the|to) /, '')
    .trim();
}

/** Edit distance between two short strings. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min((cur[j - 1] ?? 0) + 1, (prev[j] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
    }
    prev = cur;
  }
  return prev[b.length] ?? 0;
}

/**
 * Lenient marking for typed recall: the answer counts if, after normalising, it equals
 * any accepted form, or is one letter off an accepted form of five or more letters, or is
 * the plural or singular of one. Only spelling is forgiven, never meaning.
 */
export function answerMatches(typed: string, accepted: readonly string[]): boolean {
  const t = normaliseAnswer(typed);
  if (t.length === 0) return false;
  for (const raw of accepted) {
    const a = normaliseAnswer(raw);
    if (t === a) return true;
    if (t === `${a}s` || t === `${a}es` || `${t}s` === a || `${t}es` === a) return true;
    if (a.length >= 5 && levenshtein(t, a) <= 1) return true;
  }
  return false;
}

/** Turns free text into a safe part of a file name. */
export function slugify(input: string, max = 40): string {
  const s = input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max);
  return s.length > 0 ? s : 'untitled';
}

export function truncate(input: string, max: number): string {
  return input.length > max ? `${input.slice(0, max - 1)}…` : input;
}

export function plural(n: number, one: string, many: string = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** The first letters of each line, for the acronym helper. */
export function initials(lines: readonly string[]): string {
  return lines
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => (l[0] ?? '').toUpperCase())
    .join('');
}
