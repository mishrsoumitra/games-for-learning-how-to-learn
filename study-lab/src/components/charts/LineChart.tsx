import { useId } from 'react';

export interface LinePoint {
  label: string;
  value: number | null;
}

interface Props {
  title: string;
  points: readonly LinePoint[];
  /** Optional second series drawn in the second colour, same x positions. */
  reference?: { name: string; points: readonly LinePoint[] };
  seriesName: string;
  max?: number;
  unit?: string;
}

const W = 560;
const H = 240;
const PAD = { top: 20, right: 24, bottom: 36, left: 40 };

/** A single line with markers for the forgetting curve. Missing points leave a gap. */
export function LineChart({ title, points, reference, seriesName, max = 100, unit = '%' }: Props) {
  const id = useId();
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const n = Math.max(1, points.length - 1);
  const x = (i: number) => PAD.left + (i / n) * plotW;
  const y = (v: number) => PAD.top + plotH - (Math.max(0, Math.min(max, v)) / max) * plotH;
  const path = (pts: readonly LinePoint[]) => {
    let d = '';
    let pen = false;
    pts.forEach((p, i) => {
      if (p.value === null) {
        pen = false;
        return;
      }
      d += `${pen ? 'L' : 'M'} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)} `;
      pen = true;
    });
    return d.trim();
  };
  return (
    <figure className="stack" aria-labelledby={`${id}-title`}>
      <figcaption id={`${id}-title`} className="small muted">
        {title}
      </figcaption>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-describedby={`${id}-table`}>
        {[0, 25, 50, 75, 100].map((t) => (
          <g key={t}>
            <line className="grid" x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} />
            <text className="tick" x={PAD.left - 8} y={y(t) + 4} textAnchor="end">
              {t}
            </text>
          </g>
        ))}
        {reference && <path className="line-2" d={path(reference.points)} />}
        <path className="line-1" d={path(points)} />
        {points.map((p, i) =>
          p.value === null ? null : (
            <g key={p.label}>
              <circle className="dot series-1" cx={x(i)} cy={y(p.value)} r={5}>
                <title>{`${p.label}: ${p.value}${unit}`}</title>
              </circle>
              <text className="label-strong" x={x(i)} y={y(p.value) - 10} textAnchor="middle">
                {p.value}
                {unit}
              </text>
            </g>
          ),
        )}
        {points.map((p, i) => (
          <text key={p.label} className="label" x={x(i)} y={H - 12} textAnchor="middle">
            {p.label}
          </text>
        ))}
      </svg>
      {reference && (
        <div className="legend" aria-hidden="true">
          <span>
            <span className="swatch swatch-1" />
            {seriesName}
          </span>
          <span>
            <span className="swatch swatch-2" />
            {reference.name}
          </span>
        </div>
      )}
      <table id={`${id}-table`} className="visually-hidden">
        <thead>
          <tr>
            <th>When</th>
            <th>{seriesName}</th>
            {reference && <th>{reference.name}</th>}
          </tr>
        </thead>
        <tbody>
          {points.map((p, i) => (
            <tr key={p.label}>
              <td>{p.label}</td>
              <td>{p.value === null ? 'not yet' : `${p.value}${unit}`}</td>
              {reference && <td>{reference.points[i]?.value ?? ''}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
