import type { SolidId } from '../content/solids.ts';

interface Props {
  solidId: SolidId;
  dims?: Record<string, number>;
}

const stroke = 'var(--ink-2)';
const fill = 'var(--surface-2)';
const dash = { stroke: 'var(--muted)', strokeDasharray: '4 3', fill: 'none' } as const;

function label(x: number, y: number, text: string) {
  return (
    <text
      x={x}
      y={y}
      fontSize={14}
      fill="var(--ink)"
      textAnchor="middle"
      fontFamily="var(--font-text)"
    >
      {text}
    </text>
  );
}

/** Schematic sketches of the four solids with their dimensions written on. */
export function SolidFigure({ solidId, dims }: Props) {
  const v = (k: string) => (dims && dims[k] !== undefined ? `${k} = ${dims[k]}` : k);
  switch (solidId) {
    case 'wedge':
      return (
        <svg
          viewBox="0 0 260 180"
          width={260}
          height={180}
          role="img"
          aria-label="A wedge: rectangular base a by b, a top edge c parallel to a, height h"
        >
          <polygon
            points="40,130 170,130 220,100 90,100"
            fill={fill}
            stroke={stroke}
            strokeWidth={1.5}
          />
          <polygon
            points="40,130 170,130 150,50 70,50"
            fill="var(--surface)"
            stroke={stroke}
            strokeWidth={1.5}
          />
          <polygon points="170,130 220,100 150,50" fill={fill} stroke={stroke} strokeWidth={1.5} />
          <line x1={70} y1={50} x2={150} y2={50} stroke={stroke} strokeWidth={2.5} />
          <line x1={110} y1={50} x2={110} y2={115} {...dash} />
          {label(105, 152, v('a'))}
          {label(210, 125, v('b'))}
          {label(110, 40, v('c'))}
          {label(132, 88, v('h'))}
        </svg>
      );
    case 'spheroid':
      return (
        <svg
          viewBox="0 0 260 180"
          width={260}
          height={180}
          role="img"
          aria-label="A spheroid: equator radius a, pole radius b"
        >
          <ellipse
            cx={130}
            cy={90}
            rx={100}
            ry={60}
            fill={fill}
            stroke={stroke}
            strokeWidth={1.5}
          />
          <ellipse cx={130} cy={90} rx={100} ry={18} {...dash} />
          <line x1={130} y1={90} x2={230} y2={90} stroke={stroke} strokeWidth={1.5} />
          <line x1={130} y1={90} x2={130} y2={30} stroke={stroke} strokeWidth={1.5} />
          {label(180, 82, v('a'))}
          {label(145, 62, v('b'))}
        </svg>
      );
    case 'sphericalCone':
      return (
        <svg
          viewBox="0 0 260 180"
          width={260}
          height={180}
          role="img"
          aria-label="A spherical cone: a cone from the centre of a sphere of radius r, with a cap of height h"
        >
          <circle cx={130} cy={110} r={80} {...dash} />
          <path
            d="M 130 110 L 73 54 A 80 80 0 0 1 187 54 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth={1.5}
          />
          <line x1={130} y1={110} x2={130} y2={30} stroke={stroke} strokeWidth={1.5} />
          <line x1={73} y1={54} x2={187} y2={54} {...dash} />
          {label(118, 80, v('r'))}
          {label(155, 44, v('h'))}
        </svg>
      );
    case 'halfCone':
      return (
        <svg
          viewBox="0 0 260 180"
          width={260}
          height={180}
          role="img"
          aria-label="A half cone: a cone cut through its tip, base radius r, height h"
        >
          <path
            d="M 50 130 A 80 28 0 0 0 210 130 L 130 20 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth={1.5}
          />
          <line x1={50} y1={130} x2={210} y2={130} stroke={stroke} strokeWidth={1.5} />
          <line x1={130} y1={130} x2={130} y2={20} {...dash} />
          <line x1={130} y1={130} x2={210} y2={130} stroke={stroke} strokeWidth={2.5} />
          {label(172, 150, v('r'))}
          {label(118, 80, v('h'))}
        </svg>
      );
  }
}
