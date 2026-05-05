'use client';

type Highlight = {
  notes: string[];
  color: 'indigo' | 'amber';
};

type Props = {
  octaves?: 1 | 2;
  startOctave?: number;
  highlight?: Highlight;
  scale?: Highlight;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
};

const WHITE = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_OFFSETS: Array<{ name: string; afterWhiteIdx: number }> = [
  { name: 'C#', afterWhiteIdx: 0 },
  { name: 'D#', afterWhiteIdx: 1 },
  { name: 'F#', afterWhiteIdx: 3 },
  { name: 'G#', afterWhiteIdx: 4 },
  { name: 'A#', afterWhiteIdx: 5 },
];

const SIZE_MAP = {
  sm: { whiteW: 14, whiteH: 50, blackW: 9, blackH: 30, fontSize: 8 },
  md: { whiteW: 22, whiteH: 80, blackW: 14, blackH: 48, fontSize: 10 },
  lg: { whiteW: 30, whiteH: 110, blackW: 19, blackH: 66, fontSize: 12 },
};

const HIGHLIGHT_COLORS = {
  indigo: { fill: '#4f46e5', text: '#fff' },
  amber: { fill: '#fbbf24', text: '#78350f' },
};

function noteNameOnly(s: string): string {
  return s.replace(/\d+$/, '');
}

export default function PianoDiagram({
  octaves = 1,
  startOctave = 4,
  highlight,
  scale,
  size = 'sm',
  showLabels = false,
}: Props) {
  const dim = SIZE_MAP[size];
  const totalWhite = 7 * octaves;
  const width = totalWhite * dim.whiteW;
  const height = dim.whiteH;

  const highlightSet = new Set(highlight?.notes.map(noteNameOnly) ?? []);
  const scaleSet = new Set(scale?.notes.map(noteNameOnly) ?? []);

  const whiteKeys: { x: number; name: string; octave: number }[] = [];
  for (let o = 0; o < octaves; o++) {
    for (let i = 0; i < 7; i++) {
      whiteKeys.push({
        x: (o * 7 + i) * dim.whiteW,
        name: WHITE[i],
        octave: startOctave + o,
      });
    }
  }

  const blackKeys: { x: number; name: string; octave: number }[] = [];
  for (let o = 0; o < octaves; o++) {
    for (const b of BLACK_OFFSETS) {
      blackKeys.push({
        x:
          (o * 7 + b.afterWhiteIdx + 1) * dim.whiteW - dim.blackW / 2,
        name: b.name,
        octave: startOctave + o,
      });
    }
  }

  const renderKey = (
    name: string,
    isBlack: boolean,
    x: number,
    label?: string,
  ) => {
    const isHighlight = highlightSet.has(name);
    const isScale = scaleSet.has(name);

    const baseFill = isBlack ? '#1e293b' : '#ffffff';
    const baseStroke = '#cbd5e1';

    let fill = baseFill;
    let labelColor = isBlack ? '#cbd5e1' : '#64748b';

    if (isHighlight && highlight) {
      fill = HIGHLIGHT_COLORS[highlight.color].fill;
      labelColor = HIGHLIGHT_COLORS[highlight.color].text;
    } else if (isScale && scale) {
      const c = HIGHLIGHT_COLORS[scale.color];
      fill = isBlack ? c.fill : '#fef3c7';
      labelColor = isBlack ? c.text : '#92400e';
    }

    const w = isBlack ? dim.blackW : dim.whiteW;
    const h = isBlack ? dim.blackH : dim.whiteH;

    return (
      <g key={`${name}-${x}-${isBlack}`}>
        <rect
          x={x}
          y={0}
          width={w}
          height={h}
          fill={fill}
          stroke={baseStroke}
          strokeWidth={0.6}
          rx={isBlack ? 1 : 0.5}
        />
        {showLabels && label && (
          <text
            x={x + w / 2}
            y={h - 4}
            fontSize={dim.fontSize}
            textAnchor="middle"
            fill={labelColor}
          >
            {label}
          </text>
        )}
      </g>
    );
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="select-none"
      role="img"
    >
      {whiteKeys.map((k) =>
        renderKey(k.name, false, k.x, showLabels ? k.name : undefined),
      )}
      {blackKeys.map((k) => renderKey(k.name, true, k.x))}
    </svg>
  );
}
