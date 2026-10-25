import { useState } from 'react';
import { formatCompact, formatPct, formatSmart } from '../../lib/format.js';

const R = 60;
const SW = 17;
const C = 2 * Math.PI * R;
const GAP = 3.2; // grados entre segmentos
const MAX_SEGMENTS = 6;

/** Agrupa en "Otras" lo que sobra de las 5 categorías mayores (máx. 6 segmentos). */
export function donutSegments(perCategory) {
  const sorted = perCategory.filter((c) => c.spent > 0).sort((a, b) => b.spent - a.spent);
  if (sorted.length <= MAX_SEGMENTS) return sorted.map((c) => ({ id: c.id, name: c.name, spent: c.spent, share: c.share, color: c.color }));
  const head = sorted.slice(0, MAX_SEGMENTS - 1);
  const rest = sorted.slice(MAX_SEGMENTS - 1);
  const spent = rest.reduce((a, c) => a + c.spent, 0);
  const share = rest.reduce((a, c) => a + c.share, 0);
  return [
    ...head.map((c) => ({ id: c.id, name: c.name, spent: c.spent, share: c.share, color: c.color })),
    { id: 'rest', name: 'Otras', spent, share, color: 7 },
  ];
}

/** Reparto del gasto (parte-todo, máx. 6 segmentos). El centro muestra el total o el segmento tocado. */
export default function Donut({ segments, total, size = 168 }) {
  const [focus, setFocus] = useState(null);
  const gapLen = (GAP / 360) * C;
  const arcs = segments.map((s, i) => ({
    ...s,
    len: Math.max(s.share * C - gapLen, 0.5),
    start: segments.slice(0, i).reduce((acc, p) => acc + p.share * C, 0),
  }));
  const current = focus !== null ? segments.find((s) => s.id === focus) : null;

  return (
    <div className="donut" style={{ width: size, height: size }}>
      <svg viewBox="0 0 160 160" role="img" aria-label="Reparto del gasto por categoría">
        <circle className="donut__track" cx="80" cy="80" r={R} fill="none" strokeWidth={SW} />
        <g transform="rotate(-90 80 80)">
          {arcs.map((a) => (
            <circle
              key={a.id}
              cx="80" cy="80" r={R} fill="none" strokeWidth={focus === a.id ? SW + 4 : SW}
              stroke={`var(--cat-${a.color})`}
              strokeDasharray={`${a.len} ${C - a.len}`}
              strokeDashoffset={-a.start}
              className={`donut__seg ${focus !== null && focus !== a.id ? 'is-dim' : ''}`}
              onPointerEnter={() => setFocus(a.id)}
              onPointerLeave={() => setFocus(null)}
              onPointerDown={() => setFocus((f) => (f === a.id ? null : a.id))}
            >
              <title>{`${a.name}: ${formatSmart(a.spent)} (${formatPct(a.share)})`}</title>
            </circle>
          ))}
        </g>
      </svg>
      <div className="donut__center">
        {current ? (
          <>
            <span className="donut__label">{current.name}</span>
            <b className="display tnum">{formatCompact(current.spent)} €</b>
            <span className="donut__label">{formatPct(current.share)}</span>
          </>
        ) : (
          <>
            <span className="donut__label">Gastado</span>
            <b className="display tnum">{formatCompact(total)} €</b>
          </>
        )}
      </div>
    </div>
  );
}
