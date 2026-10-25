import { describe, expect, it } from 'vitest';
import { Rng, shuffleNoRepeats } from './rng.ts';

describe('Rng', () => {
  it('is deterministic for a seed', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    const seqA = Array.from({ length: 10 }, () => a.next());
    const seqB = Array.from({ length: 10 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it('stays inside [0, 1) and int ranges include both ends', () => {
    const rng = new Rng(7);
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const f = rng.next();
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThan(1);
      seen.add(rng.int(1, 3));
    }
    expect([...seen].sort()).toEqual([1, 2, 3]);
  });

  it('shuffles without losing or duplicating items', () => {
    const rng = new Rng(3);
    const items = Array.from({ length: 30 }, (_, i) => i);
    const shuffled = rng.shuffle(items);
    expect(shuffled.slice().sort((x, y) => x - y)).toEqual(items);
    expect(shuffled).not.toEqual(items);
  });

  it('finds an order with no neighbours sharing a key', () => {
    const rng = new Rng(11);
    const items = Array.from({ length: 36 }, (_, i) => ({ artist: i % 6, n: i }));
    const order = shuffleNoRepeats(rng, items, (x) => String(x.artist));
    for (let i = 1; i < order.length; i++) {
      expect(order[i]?.artist).not.toBe(order[i - 1]?.artist);
    }
    expect(order).toHaveLength(36);
  });
});
