/** Rosetón de billete: elipses giradas. Se tiñe con `color` y se atenúa con CSS. */
export default function Guilloche({ size = 320, className = '' }) {
  const half = size / 2;
  const rosette = (count, rx, ry) =>
    Array.from({ length: count }, (_, i) => (
      <ellipse key={`${count}-${rx}-${i}`} rx={rx} ry={ry} transform={`rotate(${(i * 180) / count})`} />
    ));

  return (
    <svg className={`guilloche ${className}`} width={size} height={size} viewBox={`${-half} ${-half} ${size} ${size}`} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="0.55">
        {rosette(30, half * 0.96, half * 0.34)}
        {rosette(24, half * 0.66, half * 0.46)}
        <circle r={half * 0.98} />
        <circle r={half * 0.9} />
        <circle r={half * 0.3} />
      </g>
    </svg>
  );
}
