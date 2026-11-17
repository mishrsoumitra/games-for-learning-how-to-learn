import { useId } from 'react';

export interface QuadrantPoint {
  id: string;
  /** How much better the student expected the research-favoured way to do, in points. */
  felt: number;
  /** How much better it actually did, in points. */
  worked: number;
  label?: string;
  highlight?: boolean;
}

interface Props {
  title: string;
  points: readonly QuadrantPoint[];
  xLabel: string;
  yLabel: string;
}

const W = 560;
const H = 420;
const PAD = { top: 24, right: 24, bottom: 48, left: 52 };
const RANGE = 100;

/**
 * The felt-versus-worked plot. Each run is a dot: x is how the student expected the two ways
 * to compare, y is how they actually compared. The top-left quadrant, "felt worse, worked
 * better", is where most of the published data land, so it is tinted.
 */
export function QuadrantPlot({ title, points, xLabel, yLabel }: Props) {
  const id = useId();
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (v: number) =>
    PAD.left + ((Math.max(-RANGE, Math.min(RANGE, v)) + RANGE) / (2 * RANGE)) * plotW;
  const y = (v: number) =>
    PAD.top + plotH - ((Math.max(-RANGE, Math.min(RANGE, v)) + RANGE) / (2 * RANGE)) * plotH;
  const ticks = [-100, -50, 0, 50, 100];
  const inTopLeft = points.filter((p) => p.felt <= 0 && p.worked > 0).length;
  return (
    <figure className="stack" aria-labelledby={`${id}-title`}>
      <figcaption id={`${id}-title`} className="small muted">
        {title}
      </figcaption>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-describedby={`${id}-table`}>
        <rect
          className="quadrant quadrant-hit"
          x={x(-RANGE)}
          y={y(RANGE)}
          width={x(0) - x(-RANGE)}
          height={y(0) - y(RANGE)}
        />
        <text className="tick" x={x(-RANGE) + 8} y={y(RANGE) + 16}>
          felt worse, worked better
        </text>
        <text className="tick" x={x(RANGE) - 8} y={y(RANGE) + 16} textAnchor="end">
          felt better, worked better
        </text>
        <text className="tick" x={x(-RANGE) + 8} y={y(-RANGE) - 8}>
          felt worse, worked worse
        </text>
        <text className="tick" x={x(RANGE) - 8} y={y(-RANGE) - 8} textAnchor="end">
          felt better, worked worse
        </text>
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid" x1={x(t)} x2={x(t)} y1={y(-RANGE)} y2={y(RANGE)} />
            <line className="grid" x1={x(-RANGE)} x2={x(RANGE)} y1={y(t)} y2={y(t)} />
            <text className="tick" x={x(t)} y={y(-RANGE) + 18} textAnchor="middle">
              {t > 0 ? `+${t}` : t}
            </text>
            <text className="tick" x={x(-RANGE) - 8} y={y(t) + 4} textAnchor="end">
              {t > 0 ? `+${t}` : t}
            </text>
          </g>
        ))}
        <line className="axis" x1={x(0)} x2={x(0)} y1={y(-RANGE)} y2={y(RANGE)} />
        <line className="axis" x1={x(-RANGE)} x2={x(RANGE)} y1={y(0)} y2={y(0)} />
        {points.map((p) => (
          <circle
            key={p.id}
            className={p.highlight ? 'dot series-1' : 'dot series-2'}
            cx={x(p.felt)}
            cy={y(p.worked)}
            r={p.highlight ? 8 : 6}
          >
            <title>{`${p.label ?? p.id}: felt ${p.felt > 0 ? '+' : ''}${p.felt}, worked ${p.worked > 0 ? '+' : ''}${p.worked}`}</title>
          </circle>
        ))}
        <text className="label" x={PAD.left + plotW / 2} y={H - 6} textAnchor="middle">
          {xLabel}
        </text>
        <text
          className="label"
          transform={`translate(14 ${PAD.top + plotH / 2}) rotate(-90)`}
          textAnchor="middle"
        >
          {yLabel}
        </text>
      </svg>
      <p className="small muted">
        {points.length === 0
          ? 'No points yet.'
          : `${inTopLeft} of ${points.length} ${points.length === 1 ? 'run' : 'runs'} in the "felt worse, worked better" corner.`}
      </p>
      <table id={`${id}-table`} className="visually-hidden">
        <thead>
          <tr>
            <th>Run</th>
            <th>Felt (points)</th>
            <th>Worked (points)</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.id}>
              <td>{p.label ?? p.id}</td>
              <td>{p.felt}</td>
              <td>{p.worked}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
