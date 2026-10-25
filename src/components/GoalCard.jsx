import Guilloche from './Guilloche.jsx';
import Icon from './Icon.jsx';
import { formatPct, formatSmart, monthLabel } from '../lib/format.js';

/** Objetivo de ahorro con aspecto de tarjeta: degradado del color elegido y rosetón de billete. */
export default function GoalCard({ goal, progress: p, onClick, compact = false }) {
  const eta = p.done ? 'Objetivo cumplido' : p.eta ? `A este ritmo: ${monthLabel(p.eta)}` : 'Aporta para ver la fecha';
  return (
    <button className={`gcard ${compact ? 'gcard--compact' : ''} ${p.done ? 'is-done' : ''}`} style={{ '--c': `var(--cat-${goal.color ?? 2})` }} onClick={onClick}>
      <Guilloche className="gcard__pattern" size={300} />
      <span className="gcard__top">
        <span className="gcard__icon"><Icon name={goal.icon ?? 'piggy'} size={22} weight="duotone" /></span>
        <span className="gcard__pct tnum">{p.done ? <Icon name="check" size={16} weight="bold" /> : formatPct(p.pct)}</span>
      </span>
      <b className="gcard__name display">{goal.name}</b>
      <span className="gcard__amounts tnum">
        {formatSmart(p.saved)} <i>de {formatSmart(p.target)}</i>
      </span>
      <span className="meter meter--card" aria-hidden="true">
        <i style={{ width: `${p.pct * 100}%` }} />
      </span>
      <small className="gcard__eta">{eta}</small>
    </button>
  );
}
