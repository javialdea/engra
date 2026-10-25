import { useMemo, useState } from 'react';
import { useData } from '../data/DataProvider.jsx';
import { useUi } from '../ui/UiContext.jsx';
import Icon from '../components/Icon.jsx';
import Medallion from '../components/Medallion.jsx';
import ExpenseRow from '../components/ExpenseRow.jsx';
import { normalizeConcept } from '../lib/concepts.js';
import { dayLabel, formatCurrency, monthLabel, monthRangeFor, toInputDate } from '../lib/format.js';
import { expensesInMonth } from '../lib/stats.js';

/** Historial del mes: buscar, filtrar por categoría, editar y borrar. */
export default function Expenses() {
  const { categories, expenses } = useData();
  const ui = useUi();
  const now = useMemo(() => new Date(), []);
  const [monthDate, setMonthDate] = useState(() => monthRangeFor(now).start);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const filter = ui.expenseFilter;

  const byId = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const isCurrent = monthRangeFor(now).start.getTime() === monthDate.getTime();
  const q = normalizeConcept(query);

  const list = useMemo(
    () =>
      expensesInMonth(expenses, monthDate)
        .filter((e) => filter === null || e.category === filter)
        .filter((e) => !q || normalizeConcept(e.concept).includes(q) || normalizeConcept(byId.get(e.category)?.name).includes(q))
        .sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id),
    [expenses, monthDate, filter, q, byId],
  );

  const total = list.reduce((acc, e) => acc + e.amount, 0);
  const groups = [];
  for (const e of list) {
    const key = toInputDate(e.date);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(e);
    else groups.push({ key, date: e.date, items: [e] });
  }

  const move = (delta) => setMonthDate((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  const activeCategory = filter !== null ? byId.get(filter) : null;

  return (
    <div className="screen expenses">
      <header className="xhead rise" style={{ '--i': 0 }}>
        <div className="xhead__title">
          <h1 className="display">Gastos</h1>
          <button className={`icon-btn ${searching ? 'icon-btn--accent' : ''}`} onClick={() => { setSearching((s) => !s); setQuery(''); }} aria-label="Buscar" aria-pressed={searching}>
            <Icon name="search" size={19} weight={searching ? 'bold' : 'regular'} />
          </button>
        </div>

        <div className="monthbar glass">
          <button className="icon-btn icon-btn--sm" onClick={() => move(-1)} aria-label="Mes anterior"><Icon name="caretL" size={16} weight="bold" /></button>
          <span className="display">{monthLabel(monthDate)}</span>
          <button className="icon-btn icon-btn--sm" onClick={() => move(1)} disabled={isCurrent} aria-label="Mes siguiente"><Icon name="caretR" size={16} weight="bold" /></button>
        </div>

        {searching && (
          <label className="field field--icon rise">
            <Icon name="search" size={18} />
            <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar concepto o categoría" aria-label="Buscar" />
          </label>
        )}

        <div className="filters scroll-x" role="group" aria-label="Filtrar por categoría">
          <button className={`chip ${filter === null ? 'is-active' : ''}`} onClick={() => ui.setExpenseFilter(null)}>Todas</button>
          {categories.map((c) => (
            <button key={c.id} className={`chip chip--cat ${filter === c.id ? 'is-active' : ''}`} style={{ '--c': `var(--cat-${c.color})` }} onClick={() => ui.setExpenseFilter(filter === c.id ? null : c.id)}>
              <Icon name={c.icon} size={15} weight="duotone" /> {c.name}
            </button>
          ))}
        </div>
      </header>

      <div className="xtotal glass rise" style={{ '--i': 1 }}>
        <div>
          <span className="eyebrow">{activeCategory ? activeCategory.name : 'Total del mes'}</span>
          <b className="display tnum">{formatCurrency(total)}</b>
        </div>
        <span className="pill">{list.length} {list.length === 1 ? 'gasto' : 'gastos'}</span>
      </div>

      {groups.length === 0 ? (
        <div className="empty rise" style={{ '--i': 2 }}>
          <Medallion mood="happy" size={86} />
          <p>{q || filter !== null ? 'No hay gastos que coincidan.' : 'No hay gastos en este mes.'}</p>
          {isCurrent && !q && filter === null && (
            <button className="btn btn--primary" onClick={() => ui.openSheet('expense')}>
              <Icon name="plus" size={18} weight="bold" /> Apuntar un gasto
            </button>
          )}
        </div>
      ) : (
        groups.map((g, gi) => (
          <section className="day rise" style={{ '--i': Math.min(gi + 2, 8) }} key={g.key}>
            <header className="day__head">
              <span>{dayLabel(g.date, now)}</span>
              <span className="tnum">{formatCurrency(g.items.reduce((a, e) => a + e.amount, 0))}</span>
            </header>
            <div className="card glass list">
              {g.items.map((e) => (
                <ExpenseRow key={e.id} expense={e} category={byId.get(e.category)} onClick={() => ui.openSheet('expense', { expense: e })} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
