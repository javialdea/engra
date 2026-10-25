import { useState } from 'react';

const COLORS = ['#5af0b4', '#f3d082', '#ffffff', '#c7a6ff', '#ff9a86', '#7fd1ff'];

/** Lluvia de confeti en CSS puro. Cambia `key` para repetirla. */
export default function Confetti({ count = 46 }) {
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1.8 + Math.random() * 1.6,
      drift: (Math.random() - 0.5) * 160,
      spin: (Math.random() - 0.5) * 900,
      size: 6 + Math.random() * 7,
      color: COLORS[i % COLORS.length],
      round: i % 3 === 0,
    })),
  );

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <i
          key={p.id}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.5,
            background: p.color,
            borderRadius: p.round ? '50%' : 2,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--drift': `${p.drift}px`,
            '--spin': `${p.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}
