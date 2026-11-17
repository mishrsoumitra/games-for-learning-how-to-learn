import { describe, expect, it } from 'vitest';
import { Rng } from '../lib/rng.ts';
import { PAINTERS, paintingFor, paintingSeed } from './painters.ts';
import { SOLIDS, makeProblem, volumeIsRight } from './solids.ts';
import {
  ALL_PAIRS,
  CRAMMED_SET,
  CURVE_SET,
  RETRIEVAL_IMMEDIATE_SET,
  RETRIEVAL_SET,
  SPACED_SET,
} from './swahili.ts';

describe('swahili sets', () => {
  it('has the sizes the activities expect and no duplicate cues', () => {
    expect(RETRIEVAL_SET).toHaveLength(40);
    expect(RETRIEVAL_IMMEDIATE_SET).toHaveLength(8);
    expect(SPACED_SET).toHaveLength(20);
    expect(CRAMMED_SET).toHaveLength(20);
    expect(CURVE_SET).toHaveLength(20);
    const cues = new Set(ALL_PAIRS.map((p) => p.cue));
    expect(cues.size).toBe(ALL_PAIRS.length);
  });

  it('never gives the same English answer to two cues', () => {
    const answers = ALL_PAIRS.map((p) => p.answer);
    const dupes = answers.filter((a, i) => answers.indexOf(a) !== i);
    expect(dupes).toEqual([]);
  });
});

describe('painters', () => {
  it('has twelve painters sharing shapes and palettes', () => {
    expect(PAINTERS).toHaveLength(12);
    const shapes = new Map<string, number>();
    for (const p of PAINTERS) shapes.set(p.shape, (shapes.get(p.shape) ?? 0) + 1);
    for (const n of shapes.values()) expect(n).toBe(3);
    const combos = new Set(PAINTERS.map((p) => `${p.shape}-${p.palette}-${p.layout}-${p.fill}`));
    expect(combos.size).toBe(12);
  });

  it('draws the same painting from the same seed, and different ones from different seeds', () => {
    const painter = PAINTERS[0];
    if (!painter) throw new Error('no painter');
    const a = paintingFor(painter, paintingSeed(99, painter.id, 0));
    const b = paintingFor(painter, paintingSeed(99, painter.id, 0));
    const c = paintingFor(painter, paintingSeed(99, painter.id, 1));
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
    expect(a.shapes.length).toBeGreaterThan(4);
  });

  it('draws every painter without errors', () => {
    for (const p of PAINTERS) {
      for (let i = 0; i < 8; i++) {
        const painting = paintingFor(p, paintingSeed(5, p.id, i));
        expect(painting.shapes.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('solids', () => {
  it('builds problems with integer dimensions and positive volumes', () => {
    const rng = new Rng(1);
    for (const s of SOLIDS) {
      const problem = makeProblem(rng, s.id, 0);
      expect(problem.answer).toBeGreaterThan(0);
      for (const d of s.dims) expect(Number.isInteger(problem.dims[d.key])).toBe(true);
    }
  });

  it('marks answers within one percent as right', () => {
    expect(volumeIsRight('100', 100.9)).toBe(true);
    expect(volumeIsRight('1,005', 1000)).toBe(true);
    expect(volumeIsRight('90', 100)).toBe(false);
    expect(volumeIsRight('abc', 100)).toBe(false);
    expect(volumeIsRight('2.4', 2.1)).toBe(true);
  });

  it('computes known volumes', () => {
    const halfCone = SOLIDS.find((s) => s.id === 'halfCone');
    expect(halfCone?.volume({ r: 3, h: 4 })).toBeCloseTo((Math.PI * 9 * 4) / 6, 6);
    const wedge = SOLIDS.find((s) => s.id === 'wedge');
    expect(wedge?.volume({ a: 6, b: 2, c: 3, h: 3 })).toBeCloseTo((2 * 3 * (12 + 3)) / 6, 6);
  });
});
