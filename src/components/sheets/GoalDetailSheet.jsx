import { useState } from 'react';
import Sheet from '../Sheet.jsx';
import Icon, { Badge } from '../Icon.jsx';
import { useData } from '../../data/DataProvider.jsx';
import { useUi } from '../../ui/UiContext.jsx';
import { addContribution, deleteContribution } from '../../data/actions.js';
import { formatCurrency, formatPct, formatSmart, monthLabel, parseAmount, shortDate } from '../../lib/format.js';
import { goalProgress } from '../../lib/stats.js';

const QUICK = [10, 25, 50, 100];

/** Detalle de un objetivo: progreso, aportaciones rápidas e historial. */
export default function GoalDetailSheet({ goalId, onClose }) {
  const { goals, contributions } = useData();
  const ui = useUi();
  const [custom, setCustom] = useState('');
  const goal = goals.find((g) => g.id === goalId);
  if (!goal) return null;

  const p = goalProgress({ goal, contributions });
  const history = contributions.filter((c) => c.goalId === goal.id).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  const contribute = async (amount) => {
    if (!(amount > 0)) return;
    const result = await addContribution({ goalId: goal.id, amount });
    ui.notifyGoal(result);
    setCustom('');
  };

  return (
    <Sheet
      onClose={onClose}
      size="tall"
      title={goal.name}
      actions={
        <button className="icon-btn" onClick={() => ui.openSheet('goal', { goal })} aria-label="Editar objetivo">
          <Icon name="pencil" size={18} />
        </button>
      }
    >
      <div className="goal-hero" style={{ '--c': `var(--cat-${goal.color ?? 2})` }}>
        <Badge icon={goal.icon ?? 'piggy'} color={goal.color ?? 2} size={56} />
        <div>
          <b className="display tnum">{formatCurrency(p.saved)}</b>
          <span className="muted"> de {formatSmart(p.target)}</span>
        </div>
        <div className="meter meter--lg" role="progressbar" aria-valuenow={Math.round(p.pct * 100)} aria-valuemin={0} aria-valuemax={100}>
          <i style={{ width: `${p.pct * 100}%` }} />
        </div>
        <p className="muted">
          {p.done
            ? '¡Objetivo cumplido!'
            : `${formatPct(p.pct)} · te faltan ${formatSmart(p.remaining)}${p.eta ? ` · a este ritmo, ${monthLabel(p.eta).toLowerCase()}` : ''}`}
        </p>
        {p.neededPerMonth !== null && !p.done && (
          <p className="notice">Para llegar a tiempo necesitas ahorrar unos {formatSmart(p.neededPerMonth)} al mes.</p>
        )}
      </div>

      {!p.done && (
        <div className="field">
          <span className="field__label">Aportar</span>
          <div className="quick">
            {QUICK.map((n) => (
              <button key={n} className="chip chip--lg" onClick={() => contribute(n)}>+{n} €</button>
            ))}
          </div>
          <div className="inline-field">
            <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Otra cantidad" inputMode="decimal" aria-label="Otra cantidad" />
            <button className="btn btn--primary" disabled={!(parseAmount(custom) > 0)} onClick={() => contribute(parseAmount(custom))}>Aportar</button>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="field">
          <span className="field__label">Últimas aportaciones</span>
          <ul className="history">
            {history.map((c) => (
              <li key={c.id}>
                <span>{shortDate(c.date)}</span>
                <b className="tnum">+{formatCurrency(c.amount)}</b>
                <button className="icon-btn icon-btn--sm" onClick={() => deleteContribution(c.id)} aria-label="Borrar aportación">
                  <Icon name="x" size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Sheet>
  );
}
