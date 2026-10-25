import { useId } from 'react';
import { formatCompact, formatSmart } from '../../lib/format.js';

const W = 310;
const H = 132;
const TOP = 22;
const BASE = H - 22;

function barPath(x, y, w, base) {
  const r = Math.min(5, w / 2, base - y);
  return `M ${x} ${base} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${base} Z`;
}

/** Últimos meses: el actual en color, el resto en gris (énfasis), con la línea del presupuesto. */
export default function HistoryBars({ months, budget }) {
  const uid = useId().replace(/:/g, '');
  const max = Math.max(...months.map((m) => m.total), budget, 1);
  const y = (v) => BASE - (v / max) * (BASE - TOP);
  const slot = W / months.length;
  const barW = Math.min(24, slot * 0.5);
  const peak = months.reduce((best, m) => (m.total > best.total ? m : best), months[0]);

  return (
    <svg className="hbars" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Gasto de los últimos meses">
      <defs>
        <linearGradient id={`${uid}-a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--a1)' }} />
          <stop offset="1" style={{ stopColor: 'var(--a3)' }} />
        </linearGradient>
      </defs>
      <line className="dbars__base" x1="0" x2={W} y1={BASE + 0.5} y2={BASE + 0.5} />
      {budget > 0 && (
        <g>
          <line className="dbars__limit" x1="0" x2={W} y1={y(budget)} y2={y(budget)} />
          <text className="dbars__limit-label" x="0" y={y(budget) - 4}>
            presupuesto {formatCompact(budget)} €
          </text>
        </g>
      )}
      {months.map((m, i) => {
        const x = i * slot + (slot - barW) / 2;
        const showValue = m.isCurrent || m === peak;
        return (
          <g key={m.key}>
            {m.total > 0 ? (
              <path d={barPath(x, y(m.total), barW, BASE)} fill={m.isCurrent ? `url(#${uid}-a)` : 'var(--bar-muted)'}>
                <title>{`${m.label}: ${formatSmart(m.total)}`}</title>
              </path>
            ) : (
              <circle className="dbars__zero" cx={x + barW / 2} cy={BASE - 2} r="1.8" />
            )}
            {showValue && m.total > 0 && (
              <text className="hbars__value" x={x + barW / 2} y={y(m.total) - 6} textAnchor="middle">
                {formatCompact(m.total)}
              </text>
            )}
            <text className={`dbars__tick ${m.isCurrent ? 'is-now' : ''}`} x={x + barW / 2} y={H - 5} textAnchor="middle">
              {m.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
