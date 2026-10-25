import { useMemo, useState } from 'react';
import { useData } from '../data/DataProvider.jsx';
import { useUi } from '../ui/UiContext.jsx';
import Icon, { Badge } from '../components/Icon.jsx';
import GoalCard from '../components/GoalCard.jsx';
import Medallion from '../components/Medallion.jsx';
import { formatSmart, shortDate } from '../lib/format.js';
import { nextOccurrence } from '../lib/recurring.js';
import { goalProgress, summarizeMonth } from '../lib/stats.js';

const SECTIONS = [
  { id: 'budgets', label: 'Presupuestos' },
  { id: 'savings', label: 'Ahorro' },
  { id: 'fixed', label: 'Fijos' },
];

function Budgets() {
  const { categories, expenses } = useData();
  const ui = useUi();
  const now = useMemo(() => new Date(), []);
  const summary = useMemo(() => summarizeMonth({ expenses, categories, now }), [expenses, categories, now]);
  const spentById = new Map(summary.perCategory.map((c) => [c.id, c.spent]));
  const withBudget = categories.filter((c) => c.budget > 0).sort((a, b) => a.color - b.color);

  return (
    <>
      <div className="card glass rise" style={{ '--i': 1 }}>
        <span className="eyebrow">Presupuesto mensual</span>
        <b className="display big tnum">{formatSmart(summary.budget)}</b>
        {withBudget.length > 0 && (
          <div className="sbar" role="img" aria-label="Reparto del presupuesto por categoría">
            {withBudget.map((c) => (
              <i key={c.id} style={{ flexGrow: c.budget, background: `var(--cat-${c.color})` }} title={`${c.name}: ${formatSmart(c.budget)}`} />
            ))}
          </div>
        )}
        <small className="muted">
          {categories.length} categorías · lo que llevas gastado: <b className="tnum">{formatSmart(summary.total)}</b>
        </small>
      </div>

      <div className="card glass list rise" style={{ '--i': 2 }}>
        {categories.map((c) => (
          <button key={c.id} className="brow brow--edit" onClick={() => ui.openSheet('category', { category: c })}>
            <Badge icon={c.icon} color={c.color} size={42} />
            <span className="brow__main">
              <span className="brow__top">
                <b>{c.name}</b>
                <span className="tnum">{c.budget > 0 ? `${formatSmart(c.budget)} al mes` : 'Sin límite'}</span>
              </span>
              <span className="brow__sub">Este mes llevas {formatSmart(spentById.get(c.id) ?? 0)}</span>
            </span>
            <Icon name="caretR" size={16} weight="bold" />
          </button>
        ))}
      </div>

      <button className="btn btn--ghost btn--block rise" style={{ '--i': 3 }} onClick={() => ui.openSheet('category', { nextColor: categories.length % 7 })}>
        <Icon name="plus" size={18} weight="bold" /> Nueva categoría
      </button>
    </>
  );
}

function Savings() {
  const { goals, contributions } = useData();
  const ui = useUi();
  const now = useMemo(() => new Date(), []);
  const cards = useMemo(() => goals.map((goal) => ({ goal, progress: goalProgress({ goal, contributions, now }) })), [goals, contributions, now]);
  const saved = cards.reduce((acc, c) => acc + c.progress.saved, 0);

  return (
    <>
      {cards.length > 0 && (
        <div className="card glass rise" style={{ '--i': 1 }}>
          <span className="eyebrow">Ahorrado en total</span>
          <b className="display big tnum">{formatSmart(saved)}</b>
          <small className="muted">{cards.length} {cards.length === 1 ? 'objetivo' : 'objetivos'} en marcha</small>
        </div>
      )}

      {cards.length === 0 ? (
        <div className="empty rise" style={{ '--i': 1 }}>
          <Medallion mood="happy" size={92} />
          <p>Aún no tienes objetivos de ahorro. Cuéntame para qué quieres juntar dinero y te ayudo a llegar.</p>
        </div>
      ) : (
        <div className="stack">
          {cards.map(({ goal, progress }, i) => (
            <div className="rise" style={{ '--i': i + 2 }} key={goal.id}>
              <GoalCard goal={goal} progress={progress} onClick={() => ui.openSheet('goalDetail', { goalId: goal.id })} />
            </div>
          ))}
        </div>
      )}

      <button className="btn btn--primary btn--block rise" style={{ '--i': cards.length + 2 }} onClick={() => ui.openSheet('goal')}>
        <Icon name="plus" size={18} weight="bold" /> Nuevo objetivo de ahorro
      </button>
    </>
  );
}

function Fixed() {
  const { recurring, categories } = useData();
  const ui = useUi();
  const now = useMemo(() => new Date(), []);
  const byId = new Map(categories.map((c) => [c.id, c]));
  const total = recurring.reduce((acc, r) => acc + r.amount, 0);

  return (
    <>
      <div className="card glass rise" style={{ '--i': 1 }}>
        <span className="eyebrow">Gastos fijos al mes</span>
        <b className="display big tnum">{formatSmart(total)}</b>
        <small className="muted">Alquiler, suscripciones, cuotas… Engra los apunta sola cada mes.</small>
      </div>

      {recurring.length > 0 && (
        <div className="card glass list rise" style={{ '--i': 2 }}>
          {[...recurring].sort((a, b) => a.day - b.day).map((r) => {
            const cat = byId.get(r.category) ?? { icon: 'tag', color: 7, name: 'Sin categoría' };
            return (
              <button key={r.id} className="xrow" onClick={() => ui.openSheet('recurring', { item: r })}>
                <Badge icon={cat.icon} color={cat.color} size={42} />
                <span className="xrow__main">
                  <b>{r.concept}</b>
                  <small>Día {r.day} · próximo: {shortDate(nextOccurrence(r, now))}</small>
                </span>
                <b className="xrow__amt tnum">{formatSmart(r.amount)}</b>
              </button>
            );
          })}
        </div>
      )}

      <button className="btn btn--primary btn--block rise" style={{ '--i': 3 }} onClick={() => ui.openSheet('recurring')}>
        <Icon name="plus" size={18} weight="bold" /> Nuevo gasto fijo
      </button>
    </>
  );
}

export default function Goals() {
  const [section, setSection] = useState('budgets');
  return (
    <div className="screen goals">
      <header className="rise" style={{ '--i': 0 }}>
        <h1 className="display">Objetivos</h1>
        <div className="seg glass" role="tablist">
          {SECTIONS.map((s) => (
            <button key={s.id} role="tab" aria-selected={section === s.id} className={section === s.id ? 'is-active' : ''} onClick={() => setSection(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      </header>
      <div className="goals__body" key={section}>
        {section === 'budgets' && <Budgets />}
        {section === 'savings' && <Savings />}
        {section === 'fixed' && <Fixed />}
      </div>
    </div>
  );
}
