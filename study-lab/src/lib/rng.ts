/**
 * A small seeded random number generator (mulberry32). Every activity plan is built from a
 * seed stored with the run, so the same plan can be rebuilt, tested and audited later.
 */
export class Rng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /** A float in [0, 1). */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** An integer in [min, max], both ends included. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** A float in [min, max). */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  pick<T>(items: readonly T[]): T {
    const item = items[this.int(0, items.length - 1)];
    if (item === undefined) throw new Error('pick from an empty list');
    return item;
  }

  /** A new shuffled copy (Fisher–Yates). */
  shuffle<T>(items: readonly T[]): T[] {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      const a = out[i] as T;
      out[i] = out[j] as T;
      out[j] = a;
    }
    return out;
  }

  /** A fresh generator derived from this one, so sub-plans do not disturb each other. */
  fork(): Rng {
    return new Rng(Math.floor(this.next() * 0xffffffff));
  }
}

/**
 * Shuffles so that no two neighbouring items share a key. Used for interleaved orders,
 * where the same artist or problem type must not appear twice in a row. Builds the order
 * one item at a time, always choosing among groups other than the previous one and taking
 * the biggest remaining group whenever leaving it would make a clean order impossible.
 */
export function shuffleNoRepeats<T>(rng: Rng, items: readonly T[], key: (item: T) => string): T[] {
  for (let attempt = 0; attempt < 50; attempt++) {
    const result = tryNoRepeats(rng, items, key);
    if (result) return result;
  }
  return rng.shuffle(items);
}

function tryNoRepeats<T>(rng: Rng, items: readonly T[], key: (item: T) => string): T[] | null {
  const groups = new Map<string, T[]>();
  for (const item of rng.shuffle(items)) {
    const k = key(item);
    const list = groups.get(k);
    if (list) list.push(item);
    else groups.set(k, [item]);
  }
  const out: T[] = [];
  let prev: string | null = null;
  let total = items.length;
  while (total > 0) {
    const candidates = [...groups.entries()].filter(([k, list]) => k !== prev && list.length > 0);
    if (candidates.length === 0) return null;
    let largest = candidates[0] as [string, T[]];
    let weightSum = 0;
    for (const c of candidates) {
      if (c[1].length > largest[1].length) largest = c;
      weightSum += c[1].length;
    }
    let chosen: [string, T[]];
    if (largest[1].length >= total - largest[1].length) {
      chosen = largest;
    } else {
      let r = rng.next() * weightSum;
      chosen = largest;
      for (const c of candidates) {
        r -= c[1].length;
        if (r <= 0) {
          chosen = c;
          break;
        }
      }
    }
    const item = chosen[1].pop();
    if (item === undefined) return null;
    out.push(item);
    prev = chosen[0];
    total--;
  }
  return out;
}
