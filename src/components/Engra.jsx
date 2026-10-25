import { useId } from 'react';
import './engra.css';

// Humor: cejas, boca, rubor y cuánto bajan las gafas de sol por la nariz.
const FACE = {
  happy: {
    browL: 'M 69 82 C 75 77, 87 76.5, 94 80',
    browR: 'M 106 80 C 113 76.5, 125 77, 131 82',
    lips: 'M 90 139 C 94 135, 98 135, 100 137 C 102 135, 106 135, 110 139 C 106 146, 94 146, 90 139 Z',
    smirk: 'M 88 140 C 90 144, 94 146, 100 146.4 C 106 146, 111 143, 113 138',
    shades: 0,
    blush: 0.6,
    lid: 0,
  },
  watchful: {
    browL: 'M 69 85 C 77 82, 87 82, 94 84',
    browR: 'M 106 74 C 113 67, 126 67, 133 75',
    lips: 'M 91 141 C 95 137, 99 137, 101 139 C 103 137, 107 137, 110 140 C 106 146, 95 147, 91 141 Z',
    smirk: 'M 90 142 C 94 145, 102 145, 111 140',
    shades: 12,
    blush: 0.4,
    lid: 0.12,
  },
  stern: {
    browL: 'M 69 79 C 77 80, 87 83, 95 87',
    browR: 'M 105 87 C 113 83, 123 80, 131 79',
    lips: 'M 91 143 C 94 138, 106 138, 109 143 C 105 147, 95 147, 91 143 Z',
    smirk: 'M 91 143.5 C 95 141, 105 141, 109 143.5',
    shades: 12,
    blush: 0.25,
    lid: 0.3,
  },
};

const LENS_L = 'M 67 92 C 67 89, 70 88, 74 88 L 93 88 C 97 88, 99 91, 99 95 C 99 105, 93 113, 83 113 C 73 113, 67 105, 67 97 Z';
const LENS_R = 'M 133 92 C 133 89, 130 88, 126 88 L 107 88 C 103 88, 101 91, 101 95 C 101 105, 107 113, 117 113 C 127 113, 133 105, 133 97 Z';
const EYES = [
  { id: 'L', cx: 83, cy: 95 },
  { id: 'R', cx: 117, cy: 95 },
];
const BEADS = Array.from({ length: 9 }, (_, i) => {
  const t = i / 8;
  return { x: 73 + 54 * t, y: 168 + 17 * Math.sin(Math.PI * t), pearl: i % 2 === 1 };
});

/**
 * Engra: abuela elegante, descarada e inquisitiva. Busto en SVG, caricatura plana con contorno.
 * mood: 'happy' (gafas de sol puestas) | 'watchful' (gafas bajadas, mira por encima) | 'stern' (seria)
 * view: viewBox para recortar (por defecto, busto entero)
 */
export default function Engra({ mood = 'happy', size = 120, view = '0 0 200 200', animate = true, className = '' }) {
  const uid = useId().replace(/:/g, '');
  const f = FACE[mood] ?? FACE.happy;
  const showLens = mood !== 'happy';

  return (
    <svg
      className={`eg eg--${mood} ${animate ? '' : 'eg--still'} ${className}`}
      width={size}
      height={size}
      viewBox={view}
      role="img"
      aria-label={`Engra, ${mood === 'happy' ? 'contenta' : mood === 'watchful' ? 'vigilante' : 'seria'}`}
      style={{ '--lid': f.lid }}
    >
      <defs>
        {/* Nube de pelo: se dibuja dos veces (contorno y relleno) para que el borde sea continuo */}
        <g id={`${uid}-hair`}>
          <circle cx="100" cy="62" r="31" />
          <circle cx="72" cy="72" r="23" />
          <circle cx="128" cy="72" r="23" />
          <circle cx="57" cy="94" r="16" />
          <circle cx="143" cy="94" r="16" />
          <circle cx="62" cy="114" r="10" />
          <circle cx="138" cy="114" r="10" />
        </g>
        <g id={`${uid}-bun`}>
          <circle cx="100" cy="27" r="21" />
          <circle cx="83" cy="36" r="10" />
          <circle cx="117" cy="36" r="10" />
        </g>
        <g id={`${uid}-fringe`}>
          <circle cx="82" cy="66" r="12" />
          <circle cx="101" cy="62" r="14" />
          <circle cx="120" cy="67" r="12" />
          <circle cx="68" cy="78" r="9" />
          <circle cx="133" cy="79" r="9" />
        </g>
        <clipPath id={`${uid}-lensL`}><path d={LENS_L} /></clipPath>
        <clipPath id={`${uid}-lensR`}><path d={LENS_R} /></clipPath>
        <linearGradient id={`${uid}-sweater`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--e-cardi)" />
          <stop offset="1" stopColor="var(--e-cardi-lo)" />
        </linearGradient>
        <radialGradient id={`${uid}-bead`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.78" />
        </radialGradient>
        <radialGradient id={`${uid}-cheek`}>
          <stop offset="0" stopColor="var(--e-blush)" />
          <stop offset="1" stopColor="var(--e-blush)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g key={mood} className="eg__pop">
        <g className="eg__bob">
          {/* Pelo trasero y moño */}
          <use href={`#${uid}-hair`} fill="none" stroke="var(--e-hair-line)" strokeWidth="5" strokeLinejoin="round" />
          <g className="eg__bun">
            <use href={`#${uid}-bun`} fill="none" stroke="var(--e-hair-line)" strokeWidth="5" />
            <use href={`#${uid}-bun`} fill="var(--e-hair)" />
            <path d="M 87 28 C 87 15, 113 15, 113 28 C 113 36, 100 38, 95 31 C 92 27, 99 24, 102 28" fill="none" stroke="var(--e-hair-lo)" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 90 16 C 97 11, 106 11, 111 15" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" opacity="0.9" />
            <path d="M 79 40 L 125 17" stroke="var(--e-gold-lo)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="126" cy="16.4" r="3.4" fill="var(--e-pearl)" stroke="var(--e-gold-lo)" strokeWidth="1" />
          </g>
          <use href={`#${uid}-hair`} fill="var(--e-hair)" />
          <path d="M 52 96 C 50 104, 52 110, 58 116" fill="none" stroke="var(--e-hair-lo)" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          <path d="M 148 96 C 150 104, 148 110, 142 116" fill="none" stroke="var(--e-hair-lo)" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          <path d="M 78 50 C 88 44, 112 44, 124 50" fill="none" stroke="var(--e-hair-lo)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

          {/* Cuello con tendones y jersey */}
          <path d="M 83 138 L 84 166 C 91 175, 109 175, 116 166 L 117 138 Z" fill="var(--e-skin-2)" stroke="var(--e-line)" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M 90 154 C 96 157.5, 104 157.5, 110 154" fill="none" stroke="var(--e-line)" strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
          <path d="M 91 160 C 97 163.5, 103 163.5, 109 160" fill="none" stroke="var(--e-line)" strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
          <path d="M 22 200 C 24 178, 46 168, 76 163 C 90 173, 110 173, 124 163 C 154 168, 176 178, 178 200 Z" fill={`url(#${uid}-sweater)`} stroke="var(--e-cardi-line)" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M 76 163 C 90 173, 110 173, 124 163" fill="none" stroke="var(--e-cardi-hi)" strokeWidth="7" strokeLinecap="round" />
          <path d="M 76 163 C 90 173, 110 173, 124 163" fill="none" stroke="var(--e-cardi-line)" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
          <path d="M 40 184 C 44 176, 54 171, 66 168 M 160 184 C 156 176, 146 171, 134 168" fill="none" stroke="var(--e-cardi-hi)" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />

          {/* Collar de cuentas grandes */}
          <g className="eg__beads">
            {BEADS.map((b, i) => (
              <circle key={i} cx={b.x} cy={b.y} r={b.pearl ? 5.4 : 5} fill={`url(#${uid}-bead)`} style={{ color: b.pearl ? 'var(--e-pearl)' : 'var(--e-gold)' }} stroke="var(--e-gold-lo)" strokeWidth="0.9" />
            ))}
          </g>

          {/* Orejas y cara: larga, con mofletes caídos */}
          <ellipse cx="62.5" cy="106" rx="5.5" ry="10" fill="var(--e-skin)" stroke="var(--e-line)" strokeWidth="1.5" />
          <ellipse cx="137.5" cy="106" rx="5.5" ry="10" fill="var(--e-skin)" stroke="var(--e-line)" strokeWidth="1.5" />
          <path
            d="M 64 96 C 62 64, 138 64, 136 96 C 138 112, 137 124, 134 134 C 131 148, 118 160, 100 160 C 82 160, 69 148, 66 134 C 63 124, 62 112, 64 96 Z"
            fill="var(--e-skin)"
            stroke="var(--e-line)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M 136 96 C 138 112, 137 124, 134 134 C 131 148, 118 160, 100 160 C 116 154, 126 142, 128 124 Z" fill="var(--e-skin-2)" opacity="0.42" />
          <ellipse cx="73" cy="124" rx="11" ry="8" fill={`url(#${uid}-cheek)`} opacity={f.blush} />
          <ellipse cx="127" cy="124" rx="11" ry="8" fill={`url(#${uid}-cheek)`} opacity={f.blush} />

          {/* Arrugas */}
          <g fill="none" stroke="var(--e-line)" strokeLinecap="round" strokeWidth="1.4" opacity="0.62">
            <path d="M 92 126 C 87 131, 85 136, 86 142" />
            <path d="M 108 126 C 113 131, 115 136, 114 142" />
            <path d="M 87 146 C 86 150, 88 154, 92 157" />
            <path d="M 113 146 C 114 150, 112 154, 108 157" />
            <path d="M 69 119 C 70 128, 76 135, 84 138" opacity="0.7" />
            <path d="M 131 119 C 130 128, 124 135, 116 138" opacity="0.7" />
            <path d="M 65.4 96 L 60.6 93" />
            <path d="M 65 100 L 59.6 100.4" />
            <path d="M 65.4 104 L 60.6 107" />
            <path d="M 134.6 96 L 139.4 93" />
            <path d="M 135 100 L 140.4 100.4" />
            <path d="M 134.6 104 L 139.4 107" />
            <path d="M 94.5 132.4 L 94.8 135.4" />
            <path d="M 98 131.4 L 98.2 134.6" />
            <path d="M 102 131.4 L 101.8 134.6" />
            <path d="M 105.5 132.4 L 105.2 135.4" />
            <path d="M 95.5 152 C 98.5 154.2, 101.5 154.2, 104.5 152" />
            <path d="M 84 74 C 94 71, 106 71, 116 74" opacity="0.7" />
          </g>

          {/* Nariz larga y puntiaguda */}
          <path d="M 99 97 C 98 108, 95.5 116.5, 92.4 123 C 91.8 127.6, 98.4 129.4, 105.6 125.2" fill="none" stroke="var(--e-line)" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx="98.6" cy="125.8" rx="6" ry="3.8" fill="var(--e-blush)" opacity="0.45" />

          {/* Ojos (se ven cuando baja las gafas) */}
          <g className="eg__eyes">
            {EYES.map((e) => (
              <g key={e.id}>
                <ellipse cx={e.cx} cy={e.cy} rx="7" ry="4.4" fill="#fffdf8" stroke="var(--e-line)" strokeWidth="1" />
                <g className="eg__gaze">
                  <circle cx={e.cx} cy={e.cy} r="3.2" fill="var(--e-iris)" />
                  <circle cx={e.cx} cy={e.cy} r="1.5" fill="#120d0a" />
                  <circle cx={e.cx + 1.1} cy={e.cy - 1.1} r="0.9" fill="#fff" />
                </g>
                <ellipse className="eg__lid" cx={e.cx} cy={e.cy - 0.6} rx="7.8" ry="5.2" fill="var(--e-skin)" />
                <path d={`M ${e.cx - 7.6} ${e.cy + 0.6} C ${e.cx - 3.5} ${e.cy - 5.4}, ${e.cx + 3.5} ${e.cy - 5.4}, ${e.cx + 7.6} ${e.cy + 0.6}`} fill="none" stroke="var(--e-ink)" strokeWidth="2" strokeLinecap="round" />
                <path d={`M ${e.cx - 6.5} ${e.cy + 5.6} C ${e.cx - 2.5} ${e.cy + 7.4}, ${e.cx + 2.5} ${e.cy + 7.4}, ${e.cx + 6.5} ${e.cy + 5.6}`} fill="none" stroke="var(--e-line)" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
              </g>
            ))}
          </g>

          {/* Boca de piñón */}
          <path d={f.lips} fill="var(--e-lips)" stroke="var(--e-lips-lo)" strokeWidth="1.2" strokeLinejoin="round" />
          <path d={f.smirk} fill="none" stroke="var(--e-lips-lo)" strokeWidth="1.3" strokeLinecap="round" opacity="0.8" />
          <ellipse cx="100" cy="142.4" rx="3.6" ry="1" fill="#fff" opacity="0.35" />

          {/* Gafas de sol: puestas o bajadas por la nariz */}
          <g className="eg__shades" style={{ transform: `translateY(${f.shades}px)` }}>
            <path d={LENS_L} fill="var(--e-shade)" stroke="var(--e-shade)" strokeWidth="3.4" strokeLinejoin="round" />
            <path d={LENS_R} fill="var(--e-shade)" stroke="var(--e-shade)" strokeWidth="3.4" strokeLinejoin="round" />
            <path d="M 96.5 94 C 98.5 91.5, 101.5 91.5, 103.5 94" fill="none" stroke="var(--e-shade)" strokeWidth="4.4" strokeLinecap="round" />
            <path d="M 67 92 L 58.5 96.5" stroke="var(--e-shade)" strokeWidth="4" strokeLinecap="round" />
            <path d="M 133 92 L 141.5 96.5" stroke="var(--e-shade)" strokeWidth="4" strokeLinecap="round" />
            <path d="M 72 91.4 L 94 91.4" stroke="#3a3a46" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
            <path d="M 106 91.4 L 128 91.4" stroke="#3a3a46" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
            <path d="M 74 96 L 82 96 L 76 108 L 72 108 Z" fill="#fff" opacity="0.14" />
            <path d="M 108 96 L 116 96 L 110 108 L 106 108 Z" fill="#fff" opacity="0.14" />
            {[['L', 83], ['R', 117]].map(([id, cx]) => (
              <g key={id} clipPath={`url(#${uid}-lens${id})`}>
                <g transform={`rotate(24 ${cx} 100)`}>
                  <rect className="eg__glint" x={cx - 26} y="78" width="6" height="44" fill="#fff" opacity="0.5" />
                </g>
              </g>
            ))}
          </g>

          {/* Flequillo de nube, pendientes y cejas */}
          <use href={`#${uid}-fringe`} fill="none" stroke="var(--e-hair-line)" strokeWidth="5" strokeLinejoin="round" />
          <use href={`#${uid}-fringe`} fill="var(--e-hair)" />
          <path d="M 76 61 C 82 57, 90 57, 95 61" fill="none" stroke="var(--e-hair-lo)" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
          <path d="M 106 58 C 112 55, 119 56, 124 61" fill="none" stroke="var(--e-hair-lo)" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />

          <path d={f.browL} fill="none" stroke="var(--e-brow)" strokeWidth="3.4" strokeLinecap="round" />
          <path className="eg__browR" d={f.browR} fill="none" stroke="var(--e-brow)" strokeWidth="3.4" strokeLinecap="round" />

          <g>
            <path d="M 62.5 115 L 62.5 121" stroke="var(--e-gold-lo)" strokeWidth="1.4" />
            <circle cx="62.5" cy="124" r="4.2" fill="var(--e-pearl)" stroke="var(--e-gold-lo)" strokeWidth="1" />
            <path d="M 137.5 115 L 137.5 121" stroke="var(--e-gold-lo)" strokeWidth="1.4" />
            <circle cx="137.5" cy="124" r="4.2" fill="var(--e-pearl)" stroke="var(--e-gold-lo)" strokeWidth="1" />
          </g>

          {/* Lupa */}
          {showLens && (
            <g className="eg__lens">
              <path d="M 158 152 L 177 174" stroke="var(--e-wood)" strokeWidth="7.5" strokeLinecap="round" />
              <circle cx="146" cy="140" r="17" fill="#fff" opacity="0.18" />
              <circle cx="146" cy="140" r="17" fill="none" stroke="var(--e-gold)" strokeWidth="4.4" />
              <circle cx="146" cy="140" r="19.4" fill="none" stroke="var(--e-gold-lo)" strokeWidth="1" opacity="0.7" />
              <path d="M 135 134 C 137 129, 142 127, 147 127" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" opacity="0.9" />
              <circle cx="163" cy="158" r="5" fill="var(--e-skin)" stroke="var(--e-line)" strokeWidth="1.3" />
            </g>
          )}
        </g>
      </g>
    </svg>
  );
}
