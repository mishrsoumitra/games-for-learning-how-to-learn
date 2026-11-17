import { useId } from 'react';

export interface PairedBarsProps {
  /** Two groups, for example "Predicted" and "Scored". */
  groups: readonly { label: string; values: readonly [number, number] }[];
  /** The two series names, in the order of `values`. */
  series: readonly [string, string];
  /** 0..100 by default. */
  max?: number;
  unit?: string;
  title: string;
}

const W = 560;
const H = 220;
const PAD = { top: 16, right: 16, bottom: 36, left: 40 };

/**
 * Two series side by side within each group, as thin bars with a surface gap, direct value
 * labels and a legend. Colours are the validated series tokens, so both themes read.
 */
export function PairedBars({ groups, series, max = 100, unit = '%', title }: PairedBarsProps) {
  const id = useId();
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const groupW = plotW / groups.length;
  const barW = Math.min(44, groupW / 3);
  const y = (v: number) => PAD.top + plotH - (Math.max(0, Math.min(max, v)) / max) * plotH;
  const ticks = [0, 25, 50, 75, 100].filter((t) => t <= max);
  return (
    <figure className="stack" aria-labelledby={`${id}-title`}>
      <figcaption id={`${id}-title`} className="small muted">
        {title}
      </figcaption>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-describedby={`${id}-table`}>
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid" x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} />
            <text className="tick" x={PAD.left - 8} y={y(t) + 4} textAnchor="end">
              {t}
            </text>
          </g>
        ))}
        <line className="axis" x1={PAD.left} x2={W - PAD.right} y1={y(0)} y2={y(0)} />
        {groups.map((g, gi) => {
          const cx = PAD.left + gi * groupW + groupW / 2;
          return (
            <g key={g.label}>
              {g.values.map((v, si) => {
                const x = cx + (si === 0 ? -barW - 1 : 1);
                const top = y(v);
                const h = Math.max(0, y(0) - top);
                return (
                  <g key={series[si]}>
                    <rect
                      className={si === 0 ? 'series-1' : 'series-2'}
                      x={x}
                      y={top}
                      width={barW}
                      height={h}
                      rx={h > 4 ? 4 : 0}
                    >
                      <title>{`${series[si]}, ${g.label}: ${v}${unit}`}</title>
                    </rect>
                    <text className="label-strong" x={x + barW / 2} y={top - 6} textAnchor="middle">
                      {v}
                      {unit}
                    </text>
                  </g>
                );
              })}
              <text className="label" x={cx} y={H - 12} textAnchor="middle">
                {g.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="legend" aria-hidden="true">
        <span>
          <span className="swatch swatch-1" />
          {series[0]}
        </span>
        <span>
          <span className="swatch swatch-2" />
          {series[1]}
        </span>
      </div>
      <table id={`${id}-table`} className="visually-hidden">
        <thead>
          <tr>
            <th>Group</th>
            <th>{series[0]}</th>
            <th>{series[1]}</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g.label}>
              <td>{g.label}</td>
              <td>
                {g.values[0]}
                {unit}
              </td>
              <td>
                {g.values[1]}
                {unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
