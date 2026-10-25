import { ICONS } from '../lib/catalog.js';

/** Icono por clave. weight: thin | light | regular | bold | fill | duotone */
export default function Icon({ name, size = 20, weight = 'regular', className = '', ...rest }) {
  const Component = ICONS[name] ?? ICONS.tag;
  return <Component size={size} weight={weight} className={className} aria-hidden="true" {...rest} />;
}

/** Insignia redonda con el icono de una categoría o meta, en su color. */
export function Badge({ icon, color = 0, size = 40, className = '' }) {
  return (
    <span className={`badge ${className}`} style={{ '--c': `var(--cat-${color})`, width: size, height: size }}>
      <Icon name={icon} size={Math.round(size * 0.52)} weight="duotone" />
    </span>
  );
}
