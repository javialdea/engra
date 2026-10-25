import { useEffect, useId, useState } from 'react';

const R = 98;
const SW = 15;
const C = 2 * Math.PI * R;
const TICKS = Array.from({ length: 60 }, (_, i) => i);

/**
 * Medidor de presupuesto: arco con degradado y brillo, marca de ritmo ideal y esfera de reloj.
 * pct: gastado / presupuesto (puede pasar de 1). pace: fracción del mes transcurrida.
 */
export default function BudgetRing({ pct = 0, pace = 0, status = 'ok', size = 240, children }) {
  const uid = useId().replace(/:/g, '');
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setArmed(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const p = Math.min(Math.max(pct, 0), 1);
  const dash = armed ? C * p : 0;
  const angle = pace * 2 * Math.PI - Math.PI / 2;
  const showPace = pace > 0.02 && pace < 0.98;
  const px = 120 + R * Math.cos(angle);
  const py = 120 + R * Math.sin(angle);

  return (
    <div className={`ring ring--${status}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 240 240" role="img" aria-label={`Has gastado el ${Math.round(pct * 100)}% del presupuesto`}>
        <defs>
          <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--ring-a)' }} />
            <stop offset="1" style={{ stopColor: 'var(--ring-b)' }} />
          </linearGradient>
          <filter id={`${uid}-blur`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        <g className="ring__ticks">
          {TICKS.map((i) => {
            const a = (i / 60) * 2 * Math.PI;
            const long = i % 5 === 0;
            const r1 = 113;
            const r2 = long ? 119 : 116.5;
            return <line key={i} x1={120 + r1 * Math.cos(a)} y1={120 + r1 * Math.sin(a)} x2={120 + r2 * Math.cos(a)} y2={120 + r2 * Math.sin(a)} />;
          })}
        </g>

        <circle className="ring__track" cx="120" cy="120" r={R} fill="none" strokeWidth={SW} />
        <g transform="rotate(-90 120 120)">
          <circle
            cx="120" cy="120" r={R} fill="none" strokeWidth={SW + 2} strokeLinecap="round"
            stroke={`url(#${uid}-g)`} opacity="0.55" filter={`url(#${uid}-blur)`}
            strokeDasharray={`${dash} ${C}`} className="ring__arc"
          />
          <circle
            cx="120" cy="120" r={R} fill="none" strokeWidth={SW} strokeLinecap="round"
            stroke={`url(#${uid}-g)`} strokeDasharray={`${dash} ${C}`} className="ring__arc"
          />
        </g>

        {showPace && (
          <g className="ring__pace">
            <circle cx={px} cy={py} r="7.5" className="ring__pace-halo" />
            <circle cx={px} cy={py} r="4" className="ring__pace-dot" />
          </g>
        )}
      </svg>
      <div className="ring__center">{children}</div>
    </div>
  );
}
