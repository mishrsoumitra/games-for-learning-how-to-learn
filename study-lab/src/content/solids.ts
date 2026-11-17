import type { Rng } from '../lib/rng.ts';

/**
 * The four solids from Rohrer and Taylor (2007): wedge, spheroid, spherical cone and half
 * cone. Students rarely know these formulas, so there is no head start. Each problem gives
 * the dimensions; the student has to pick the right formula and work it out.
 *
 * The formulas are standard mensuration results. The wedge here is the one with a
 * rectangular base (a by b), a top edge of length c parallel to a, and height h.
 */
export type SolidId = 'wedge' | 'spheroid' | 'sphericalCone' | 'halfCone';

export interface Dimension {
  key: string;
  label: string;
  symbol: string;
  min: number;
  max: number;
}

export interface Solid {
  id: SolidId;
  name: string;
  formula: string;
  formulaWords: string;
  dims: readonly Dimension[];
  volume: (d: Record<string, number>) => number;
  /** What to tell a student who confuses it with another solid. */
  tellApart: string;
}

export const SOLIDS: readonly Solid[] = [
  {
    id: 'wedge',
    name: 'Wedge',
    formula: 'V = b · h · (2a + c) / 6',
    formulaWords:
      'Width times height times (twice the base length plus the top edge), divided by six.',
    dims: [
      { key: 'a', label: 'base length', symbol: 'a', min: 4, max: 12 },
      { key: 'b', label: 'base width', symbol: 'b', min: 2, max: 8 },
      { key: 'c', label: 'top edge', symbol: 'c', min: 2, max: 9 },
      { key: 'h', label: 'height', symbol: 'h', min: 3, max: 10 },
    ],
    volume: (d) => ((d['b'] ?? 0) * (d['h'] ?? 0) * (2 * (d['a'] ?? 0) + (d['c'] ?? 0))) / 6,
    tellApart:
      'A wedge has a flat rectangular base and a single straight edge on top, like a doorstop.',
  },
  {
    id: 'spheroid',
    name: 'Spheroid',
    formula: 'V = (4/3) · π · a² · b',
    formulaWords: 'Four thirds of pi, times the equator radius squared, times the pole radius.',
    dims: [
      { key: 'a', label: 'equator radius', symbol: 'a', min: 2, max: 9 },
      { key: 'b', label: 'pole radius', symbol: 'b', min: 2, max: 9 },
    ],
    volume: (d) => (4 / 3) * Math.PI * (d['a'] ?? 0) ** 2 * (d['b'] ?? 0),
    tellApart:
      'A spheroid is a squashed or stretched sphere, like a rugby ball or a flattened orange.',
  },
  {
    id: 'sphericalCone',
    name: 'Spherical cone',
    formula: 'V = (2/3) · π · r² · h',
    formulaWords: 'Two thirds of pi, times the sphere radius squared, times the cap height.',
    dims: [
      { key: 'r', label: 'sphere radius', symbol: 'r', min: 3, max: 10 },
      { key: 'h', label: 'cap height', symbol: 'h', min: 1, max: 6 },
    ],
    volume: (d) => (2 / 3) * Math.PI * (d['r'] ?? 0) ** 2 * (d['h'] ?? 0),
    tellApart:
      'A spherical cone is a cone cut out of a sphere from its centre, with a curved cap instead of a flat base, like an ice-cream cone with the scoop.',
  },
  {
    id: 'halfCone',
    name: 'Half cone',
    formula: 'V = (1/6) · π · r² · h',
    formulaWords: 'One sixth of pi, times the base radius squared, times the height.',
    dims: [
      { key: 'r', label: 'base radius', symbol: 'r', min: 2, max: 9 },
      { key: 'h', label: 'height', symbol: 'h', min: 3, max: 12 },
    ],
    volume: (d) => (1 / 6) * Math.PI * (d['r'] ?? 0) ** 2 * (d['h'] ?? 0),
    tellApart:
      'A half cone is a cone sliced straight down through its tip, so it has one flat triangular face.',
  },
];

export function solidById(id: SolidId): Solid {
  const s = SOLIDS.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown solid ${id}`);
  return s;
}

export interface Problem {
  id: string;
  solidId: SolidId;
  dims: Record<string, number>;
  answer: number;
}

export function makeProblem(rng: Rng, solidId: SolidId, index: number): Problem {
  const solid = solidById(solidId);
  const dims: Record<string, number> = {};
  for (const d of solid.dims) dims[d.key] = rng.int(d.min, d.max);
  // Keep the wedge's top edge no longer than its base, so the picture stays sensible.
  if (solidId === 'wedge' && (dims['c'] ?? 0) > (dims['a'] ?? 0)) dims['c'] = dims['a'] ?? 0;
  return { id: `${solidId}-${index}`, solidId, dims, answer: solid.volume(dims) };
}

/** Within 1% of the exact value, or within 0.5 for small answers, counts as right. */
export function volumeIsRight(typed: string, answer: number): boolean {
  const n = Number(typed.replace(/,/g, '').trim());
  if (!Number.isFinite(n)) return false;
  const tolerance = Math.max(0.5, Math.abs(answer) * 0.01);
  return Math.abs(n - answer) <= tolerance;
}

export function formatVolume(v: number): string {
  return v >= 100 ? v.toFixed(0) : v.toFixed(1);
}
