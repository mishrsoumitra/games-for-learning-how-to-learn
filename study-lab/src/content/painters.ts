import { Rng } from '../lib/rng.ts';

/**
 * Twelve made-up painters, each with a style that can be drawn on demand. Kornell and Bjork
 * (2008) used real landscape painters. Real paintings cannot be shipped in this app, so each
 * painter here is a recipe: a shape family, a palette, a layout and a fill. Painters share
 * each of these with others, so telling them apart means noticing combinations, which is
 * exactly the kind of learning that interleaving helps (Brunmair and Richter, 2019: the
 * benefit is largest when categories are similar to each other and vary within themselves).
 *
 * Every painting is drawn from a seed, so a run can be rebuilt exactly from its seed.
 */

export type ShapeFamily = 'circles' | 'blocks' | 'triangles' | 'arcs';
export type Palette = 'warm' | 'cool' | 'earth' | 'mono';
export type Layout = 'grid' | 'scatter' | 'bands' | 'radial';
export type Fill = 'solid' | 'outline';

export interface Painter {
  id: string;
  name: string;
  shape: ShapeFamily;
  palette: Palette;
  layout: Layout;
  fill: Fill;
}

export const PAINTERS: readonly Painter[] = [
  {
    id: 'arbel',
    name: 'Arbel',
    shape: 'circles',
    palette: 'warm',
    layout: 'scatter',
    fill: 'solid',
  },
  {
    id: 'bexley',
    name: 'Bexley',
    shape: 'circles',
    palette: 'cool',
    layout: 'grid',
    fill: 'outline',
  },
  {
    id: 'corvin',
    name: 'Corvin',
    shape: 'circles',
    palette: 'earth',
    layout: 'bands',
    fill: 'solid',
  },
  { id: 'dalmar', name: 'Dalmar', shape: 'blocks', palette: 'warm', layout: 'grid', fill: 'solid' },
  {
    id: 'essen',
    name: 'Essen',
    shape: 'blocks',
    palette: 'cool',
    layout: 'bands',
    fill: 'outline',
  },
  {
    id: 'farrow',
    name: 'Farrow',
    shape: 'blocks',
    palette: 'mono',
    layout: 'scatter',
    fill: 'solid',
  },
  {
    id: 'gilder',
    name: 'Gilder',
    shape: 'triangles',
    palette: 'earth',
    layout: 'radial',
    fill: 'solid',
  },
  {
    id: 'hollis',
    name: 'Hollis',
    shape: 'triangles',
    palette: 'cool',
    layout: 'scatter',
    fill: 'outline',
  },
  {
    id: 'imber',
    name: 'Imber',
    shape: 'triangles',
    palette: 'warm',
    layout: 'bands',
    fill: 'solid',
  },
  {
    id: 'jarvik',
    name: 'Jarvik',
    shape: 'arcs',
    palette: 'mono',
    layout: 'radial',
    fill: 'outline',
  },
  {
    id: 'kestrel',
    name: 'Kestrel',
    shape: 'arcs',
    palette: 'earth',
    layout: 'grid',
    fill: 'solid',
  },
  { id: 'lomax', name: 'Lomax', shape: 'arcs', palette: 'cool', layout: 'radial', fill: 'solid' },
];

export function painterById(id: string): Painter {
  const p = PAINTERS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown painter ${id}`);
  return p;
}

const PALETTES: Record<
  Palette,
  { backgrounds: string[]; hues: [number, number]; sat: [number, number]; light: [number, number] }
> = {
  warm: {
    backgrounds: ['#F6E7D2', '#F3DCC0', '#EFD3B5'],
    hues: [0, 55],
    sat: [55, 85],
    light: [42, 62],
  },
  cool: {
    backgrounds: ['#DCE6F2', '#D3DFEE', '#E3EAF4'],
    hues: [190, 260],
    sat: [40, 70],
    light: [40, 62],
  },
  earth: {
    backgrounds: ['#E8E2D2', '#E2DAC5', '#DED6C1'],
    hues: [25, 110],
    sat: [25, 50],
    light: [30, 50],
  },
  mono: {
    backgrounds: ['#ECECEC', '#E2E2E4', '#F2F2F2'],
    hues: [215, 235],
    sat: [4, 14],
    light: [18, 62],
  },
};

export const CANVAS = 200;

export type Shape =
  | { kind: 'circle'; cx: number; cy: number; r: number; color: string; stroke: number }
  | {
      kind: 'rect';
      x: number;
      y: number;
      w: number;
      h: number;
      rotate: number;
      color: string;
      stroke: number;
    }
  | { kind: 'triangle'; points: string; color: string; stroke: number }
  | { kind: 'arc'; d: string; color: string; stroke: number };

export interface Painting {
  painterId: string;
  seed: number;
  background: string;
  fill: Fill;
  shapes: Shape[];
}

function color(rng: Rng, palette: Palette): string {
  const p = PALETTES[palette];
  const h = rng.range(p.hues[0], p.hues[1]);
  const s = rng.range(p.sat[0], p.sat[1]);
  const l = rng.range(p.light[0], p.light[1]);
  return `hsl(${h.toFixed(0)} ${s.toFixed(0)}% ${l.toFixed(0)}%)`;
}

function positions(
  rng: Rng,
  layout: Layout,
  count: number,
): { x: number; y: number; size: number }[] {
  const out: { x: number; y: number; size: number }[] = [];
  const C = CANVAS;
  switch (layout) {
    case 'grid': {
      const cols = rng.int(3, 4);
      const rows = rng.int(3, 4);
      const cell = C / Math.max(cols, rows);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (rng.next() < 0.12) continue;
          out.push({
            x: (c + 0.5) * cell + rng.range(-3, 3),
            y: (r + 0.5) * cell + rng.range(-3, 3),
            size: cell * rng.range(0.28, 0.42),
          });
        }
      }
      break;
    }
    case 'scatter': {
      for (let i = 0; i < count; i++) {
        out.push({ x: rng.range(12, C - 12), y: rng.range(12, C - 12), size: rng.range(9, 30) });
      }
      break;
    }
    case 'bands': {
      const bands = rng.int(3, 5);
      const bandH = C / bands;
      for (let b = 0; b < bands; b++) {
        const n = rng.int(2, 5);
        const size = bandH * rng.range(0.25, 0.4);
        for (let i = 0; i < n; i++) {
          out.push({
            x: ((i + 0.5) / n) * C + rng.range(-8, 8),
            y: (b + 0.5) * bandH + rng.range(-4, 4),
            size,
          });
        }
      }
      break;
    }
    case 'radial': {
      const rings = rng.int(2, 3);
      const cx = C / 2 + rng.range(-10, 10);
      const cy = C / 2 + rng.range(-10, 10);
      out.push({ x: cx, y: cy, size: rng.range(10, 18) });
      for (let ring = 1; ring <= rings; ring++) {
        const n = rng.int(5, 8);
        const radius = ring * (C / 2 / (rings + 0.6));
        const offset = rng.range(0, Math.PI * 2);
        for (let i = 0; i < n; i++) {
          const a = offset + (i / n) * Math.PI * 2;
          out.push({
            x: cx + Math.cos(a) * radius,
            y: cy + Math.sin(a) * radius,
            size: rng.range(7, 14),
          });
        }
      }
      break;
    }
  }
  return out;
}

export function paintingFor(painter: Painter, seed: number): Painting {
  const rng = new Rng(seed);
  const palette = PALETTES[painter.palette];
  const background = rng.pick(palette.backgrounds);
  const spots = positions(rng, painter.layout, rng.int(10, 18));
  const stroke = painter.fill === 'outline' ? rng.range(2, 3.5) : 0;
  const shapes: Shape[] = spots.map((s) => {
    const c = color(rng, painter.palette);
    switch (painter.shape) {
      case 'circles':
        return { kind: 'circle', cx: s.x, cy: s.y, r: s.size, color: c, stroke };
      case 'blocks': {
        const w = s.size * rng.range(1.2, 2.2);
        const h = s.size * rng.range(0.8, 1.6);
        return {
          kind: 'rect',
          x: s.x - w / 2,
          y: s.y - h / 2,
          w,
          h,
          rotate: rng.range(-12, 12),
          color: c,
          stroke,
        };
      }
      case 'triangles': {
        const r = s.size * 1.15;
        const a0 = rng.range(0, Math.PI * 2);
        const pts = [0, 1, 2].map((k) => {
          const a = a0 + (k * 2 * Math.PI) / 3;
          return `${(s.x + Math.cos(a) * r).toFixed(1)},${(s.y + Math.sin(a) * r).toFixed(1)}`;
        });
        return { kind: 'triangle', points: pts.join(' '), color: c, stroke };
      }
      case 'arcs': {
        const r = s.size * 1.3;
        const a0 = rng.range(0, Math.PI * 2);
        const a1 = a0 + rng.range(Math.PI * 0.7, Math.PI * 1.4);
        const x0 = s.x + Math.cos(a0) * r;
        const y0 = s.y + Math.sin(a0) * r;
        const x1 = s.x + Math.cos(a1) * r;
        const y1 = s.y + Math.sin(a1) * r;
        const large = a1 - a0 > Math.PI ? 1 : 0;
        return {
          kind: 'arc',
          d: `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`,
          color: c,
          stroke: Math.max(stroke, rng.range(3, 6)),
        };
      }
    }
  });
  return { painterId: painter.id, seed, background, fill: painter.fill, shapes };
}

/** A stable seed for painting number `index` by a painter in a given run. */
export function paintingSeed(runSeed: number, painterId: string, index: number): number {
  let h = runSeed >>> 0;
  for (const ch of `${painterId}:${index}`) {
    h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  }
  return h;
}
