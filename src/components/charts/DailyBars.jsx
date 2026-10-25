import { useId, useRef, useState } from 'react';
import { formatSmart } from '../../lib/format.js';

const W = 310;
const H = 124;
const TOP = 12;
const BASE = H - 20;

function barPath(x, y, w, base) {
  const r = Math.min(4, w / 2, base - y);
  return `M ${x} ${base} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${base} Z`;
}

const weekday = (monthDate, day) =>
  new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric' }).format(new Date(monthDate.getFullYear(), monthDate.getMonth(), day)).replace('.', '');

/** Gasto por día del mes: columnas finas, hoy resaltado, línea del límite diario. */
export default function DailyBars({ daily, dayOfMonth, dailyBudget, monthDate, isCurrent }) {
  const uid = useId().replace(/:/g, '');
  const wrap = useRef(null);
  const [sel, setSel] = useState(null);
  const dim = daily.length;
  const slot = W / dim;
  const barW = Math.min(9, slot * 0.58);
  const max = Math.max(...daily, dailyBudget * 1.3, 1);
  const y = (v) => BASE - (v / max) * (BASE - TOP);
  const todayIdx = isCurrent ? dayOfMonth - 1 : -1;
  const active = sel ?? (todayIdx >= 0 ? todayIdx : null);
  const visibleDays = isCurrent ? dayOfMonth : dim;

  const locate = (e) => {
    const rect = wrap.current.getBoundingClientRect();
    const idx = Math.floor(((e.clientX - rect.left) / rect.width) * dim);
    setSel(Math.min(Math.max(idx, 0), visibleDays - 1));
  };

  const ticks = [1, 8, 15, 22, 29].filter((d) => d <= dim);

  return (
    <div className="dbars">
      <div className="dbars__readout" aria-live="polite">
        {active !== null ? (
          <>
            <span>{weekday(monthDate, active + 1)}</span>
            <b className="tnum">{formatSmart(daily[active])}</b>
          </>
        ) : (
          <span>Toca una columna</span>
        )}
      </div>

      <div className="dbars__plot" ref={wrap} onPointerMove={locate} onPointerDown={locate} onPointerLeave={() => setSel(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Gasto por día del mes">
          <defs>
            <linearGradient id={`${uid}-a`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: 'var(--a1)' }} />
              <stop offset="1" style={{ stopColor: 'var(--a3)' }} />
            </linearGradient>
            <linearGradient id={`${uid}-t`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: '#ffe9a8' }} />
              <stop offset="1" style={{ stopColor: '#e0a73a' }} />
            </linearGradient>
          </defs>

          <line className="dbars__base" x1="0" x2={W} y1={BASE + 0.5} y2={BASE + 0.5} />
          {dailyBudget > 0 && (
            <g>
              <line className="dbars__limit" x1="0" x2={W} y1={y(dailyBudget)} y2={y(dailyBudget)} />
              <text className="dbars__limit-label" x={W} y={y(dailyBudget) - 4} textAnchor="end">
                límite diario
              </text>
            </g>
          )}

          {daily.map((v, i) => {
            if (i >= visibleDays) return null;
            const x = i * slot + (slot - barW) / 2;
            if (v <= 0) return <circle key={i} className="dbars__zero" cx={x + barW / 2} cy={BASE - 2} r="1.6" />;
            const over = dailyBudget > 0 && v > dailyBudget * 1.5;
            const fill = i === todayIdx ? `url(#${uid}-t)` : over ? 'var(--warn-fill)' : `url(#${uid}-a)`;
            return <path key={i} d={barPath(x, y(v), barW, BASE)} fill={fill} className={`dbars__bar ${active === i ? 'is-active' : ''}`} />;
          })}

          {active !== null && <line className="dbars__guide" x1={active * slot + slot / 2} x2={active * slot + slot / 2} y1={TOP - 4} y2={BASE} />}

          {ticks.map((d) => (
            <text key={d} className="dbars__tick" x={(d - 1) * slot + slot / 2} y={H - 4} textAnchor="middle">
              {d}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
