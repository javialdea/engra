import Engra from './Engra.jsx';

/** Retrato de Engra en medallón. El aro cambia de color con su humor. */
export default function Medallion({ mood = 'happy', size = 84, animate = true, className = '' }) {
  return (
    <span className={`medal medal--${mood} ${className}`} style={{ width: size, height: size }}>
      <Engra mood={mood} size={size} view="18 0 164 164" animate={animate} />
    </span>
  );
}
