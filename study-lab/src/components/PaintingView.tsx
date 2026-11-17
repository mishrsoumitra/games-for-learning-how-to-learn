/* oxlint-disable react/no-array-index-key -- shapes have no ids and never reorder */
import { memo } from 'react';
import { CANVAS, type Painting } from '../content/painters.ts';

interface Props {
  painting: Painting;
  title: string;
}

/** Draws one painting from its recipe. Memoised: the same painting never re-renders. */
export const PaintingView = memo(function PaintingView({ painting, title }: Props) {
  const outline = painting.fill === 'outline';
  return (
    <div className="painting-frame">
      <svg viewBox={`0 0 ${CANVAS} ${CANVAS}`} role="img" aria-label={title}>
        <rect width={CANVAS} height={CANVAS} fill={painting.background} />
        {painting.shapes.map((s, i) => {
          const fill = outline ? 'none' : s.color;
          const stroke = outline || s.kind === 'arc' ? s.color : 'none';
          const strokeWidth = s.stroke;
          switch (s.kind) {
            case 'circle':
              return (
                <circle
                  key={i}
                  cx={s.cx}
                  cy={s.cy}
                  r={s.r}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                />
              );
            case 'rect':
              return (
                <rect
                  key={i}
                  x={s.x}
                  y={s.y}
                  width={s.w}
                  height={s.h}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  transform={`rotate(${s.rotate.toFixed(1)} ${(s.x + s.w / 2).toFixed(1)} ${(s.y + s.h / 2).toFixed(1)})`}
                />
              );
            case 'triangle':
              return (
                <polygon
                  key={i}
                  points={s.points}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                />
              );
            case 'arc':
              return (
                <path
                  key={i}
                  d={s.d}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />
              );
          }
        })}
      </svg>
    </div>
  );
});
