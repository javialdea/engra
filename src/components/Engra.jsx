const EXPRESSIONS = {
  happy: {
    eyebrow: 'M 34 40 Q 40 36 46 40 M 74 40 Q 80 36 86 40',
    mouth: 'M 45 78 Q 60 88 75 78',
  },
  watchful: {
    eyebrow: 'M 33 39 L 47 42 M 87 39 L 73 42',
    mouth: 'M 47 80 L 73 80',
  },
  stern: {
    eyebrow: 'M 33 42 L 47 37 M 87 42 L 73 37',
    mouth: 'M 47 82 Q 60 76 73 82',
  },
};

export default function Engra({ mood = 'happy', size = 120 }) {
  const expression = EXPRESSIONS[mood] ?? EXPRESSIONS.happy;

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={`Engra: ${mood}`}>
      <path
        d="M 26 58 Q 24 20 60 18 Q 96 20 94 58 Q 94 34 60 32 Q 26 34 26 58 Z"
        fill="var(--engra-hair)"
      />
      <circle cx="60" cy="20" r="10" fill="var(--engra-hair)" />
      <circle cx="60" cy="62" r="34" fill="var(--engra-skin)" />

      <g stroke="var(--engra-ink)" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <circle cx="46" cy="60" r="10" />
        <circle cx="74" cy="60" r="10" />
        <line x1="56" y1="60" x2="64" y2="60" />
      </g>
      <g stroke="var(--engra-ink)" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d={expression.eyebrow} />
      </g>
      <circle cx="46" cy="60" r="2.5" fill="var(--engra-ink)" />
      <circle cx="74" cy="60" r="2.5" fill="var(--engra-ink)" />
      <path d={expression.mouth} stroke="var(--engra-lips)" strokeWidth="4" fill="none" strokeLinecap="round" />

      <path d="M 20 100 Q 60 78 100 100 L 100 120 L 20 120 Z" fill="var(--engra-dress)" />
      <path d="M 60 93 L 41 118 L 79 118 Z" fill="var(--color-accent)" />
      <circle cx="60" cy="95" r="6" fill="var(--color-accent)" />

      {mood !== 'happy' && (
        <g stroke="var(--engra-ink)" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <circle cx="96" cy="84" r="9" />
          <line x1="103" y1="91" x2="110" y2="98" />
        </g>
      )}
    </svg>
  );
}
