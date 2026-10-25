import { useMemo, useState } from 'react';
import { useData } from '../data/DataProvider.jsx';
import { useUi } from '../ui/UiContext.jsx';
import Icon, { Badge } from '../components/Icon.jsx';
import Medallion from '../components/Medallion.jsx';
import ExpenseRow from '../components/ExpenseRow.jsx';
import GoalCard from '../components/GoalCard.jsx';
import Guilloche from '../components/Guilloche.jsx';
import BudgetRing from '../components/charts/BudgetRing.jsx';
import DailyBars from '../components/charts/DailyBars.jsx';
import Donut, { donutSegments } from '../components/charts/Donut.jsx';
import HistoryBars from '../components/charts/HistoryBars.jsx';
import { useCountUp } from '../hooks/useCountUp.js';
import { amountParts, formatPct, formatSmart, greeting, longDate, monthLabel } from '../lib/format.js';
import { buildInsights } from '../lib/insights.js';
import { compareWithPrevMonth, goalProgress, monthlyTotals, summarizeMonth } from '../lib/stats.js';
import { engraVoice } from '../lib/voice.js';

const STATUS_CHIP = {
  over: { icon: 'warningCircle', text: 'Presupuesto superado' },
  watch: { icon: 'warning', text: 'Cerca del límite' },
  none: { icon: 'info', text: 'Sin presupuesto' },
};

function statusChip(summary) {
  if (summary.status === 'ok') {
    return summary.count > 0 && summary.pctSpent < summary.pctElapsed
      ? { icon: 'checkCircle', text: 'Por debajo del ritmo' }
      : { icon: 'checkCircle', text: 'Todo en orden' };
  }
  return STATUS_CHIP[summary.status];
}

function Section({ title, action, onAction, children, className = '' }) {
  return (
    <section className={`sec ${className}`}>
      <header className="sec__head">
        <h2 className="display">{title}</h2>
        {action && (
          <button className="link" onClick={onAction}>
            {action} <Icon name="caretR" size={14} weight="bold" />
          </button>
        )}
      </header>
      {children}
    </section>
  );
}

export default function Home() {
  const { settings, categories, expenses, goals, contributions, recurring } = useData();
  const ui = useUi();
  const [showAll, setShowAll] = useState(false);
  const now = useMemo(() => new Date(), []);

  const summary = useMemo(() => summarizeMonth({ expenses, categories, now }), [expenses, categories, now]);
  const compare = useMemo(() => compareWithPrevMonth({ expenses, now }), [expenses, now]);
  const history = useMemo(() => monthlyTotals({ expenses, now, months: 6 }), [expenses, now]);
  const voice = useMemo(() => engraVoice({ summary, tone: settings.tone, name: settings.userName, now }), [summary, settings.tone, settings.userName, now]);
  const insights = useMemo(() => buildInsights({ summary, compare, recurring, now }), [summary, compare, recurring, now]);
  const recent = useMemo(() => [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id).slice(0, 4), [expenses]);
  const goalCards = useMemo(() => goals.map((goal) => ({ goal, progress: goalProgress({ goal, contributions, now }) })), [goals, contributions, now]);
  const byId = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const hasBudget = summary.budget > 0;
  const over = hasBudget && summary.remaining < 0;
  const heroValue = hasBudget ? Math.abs(summary.remaining) : summary.total;
  const shown = useCountUp(heroValue);
  const parts = amountParts(shown);
  const chip = statusChip(summary);

  const segments = useMemo(() => donutSegments(summary.perCategory), [summary.perCategory]);
  const budgets = useMemo(
    () => [...summary.perCategory].filter((c) => c.id !== -1).sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1)),
    [summary.perCategory],
  );
  const visibleBudgets = showAll ? budgets : budgets.slice(0, 5);
  const monthsWithData = history.filter((m) => m.total > 0).length;
  const name = settings.userName.trim();

  return (
    <div className="screen home">
      <header className="home__top rise" style={{ '--i': 0 }}>
        <div>
          <p className="eyebrow">{longDate(now)}</p>
          <h1 className="display home__title">
            {greeting(now)}
            {name && <>, <span>{name}</span></>}
          </h1>
        </div>
      </header>

      <section className="hero glass rise" style={{ '--i': 1 }}>
        <Guilloche className="hero__pattern" size={420} />
        <div className="hero__bar">
          <span className="pill">{monthLabel(now)}</span>
          <span className={`status status--${summary.status}`}>
            <Icon name={chip.icon} size={15} weight="fill" /> {chip.text}
          </span>
        </div>

        <BudgetRing pct={hasBudget ? summary.pctSpent : 0} pace={hasBudget ? summary.pctElapsed : 0} status={summary.status === 'none' ? 'ok' : summary.status} size={236}>
          <span className="eyebrow">{hasBudget ? (over ? 'Te has pasado' : 'Te quedan') : 'Gastado'}</span>
          <span className={`hero__figure display ${parts.int.length >= 6 ? 'is-xlong' : parts.int.length >= 5 ? 'is-long' : ''}`} aria-live="polite">
            {parts.negative && '−'}
            {parts.int}
            <small>,{parts.dec} €</small>
          </span>
          <span className="hero__of">{hasBudget ? `de ${formatSmart(summary.budget)} al mes` : 'Define presupuestos en Objetivos'}</span>
        </BudgetRing>

        {hasBudget && summary.pctElapsed > 0.02 && summary.pctElapsed < 0.98 && (
          <p className="hero__legend"><i /> ritmo ideal de hoy</p>
        )}

        <dl className="hero__stats">
          <div>
            <dt>Gastado</dt>
            <dd className="tnum">{formatSmart(summary.total)}</dd>
          </div>
          <div>
            <dt>Por día</dt>
            <dd className="tnum">{summary.dailyAllowance > 0 ? formatSmart(summary.dailyAllowance) : '—'}</dd>
          </div>
          <div>
            <dt>A este ritmo</dt>
            <dd className={`tnum ${summary.projection !== null && summary.projection > summary.budget && hasBudget ? 'is-warn' : ''}`}>
              {summary.projection !== null ? formatSmart(summary.projection) : '—'}
            </dd>
          </div>
        </dl>
      </section>

      <section className="says glass rise" style={{ '--i': 2 }}>
        <Medallion mood={voice.mood} size={78} />
        <div>
          <p className="eyebrow">Engra dice</p>
          <p className="voice says__text" key={voice.text}>{voice.text}</p>
        </div>
      </section>

      {summary.count === 0 && (
        <button className="cta glass rise" style={{ '--i': 3 }} onClick={() => ui.openSheet('expense')}>
          <span className="cta__icon"><Icon name="plus" size={22} weight="bold" /></span>
          <span>
            <b>Apunta tu primer gasto</b>
            <small>Importe, categoría y listo. Tarda dos segundos.</small>
          </span>
          <Icon name="caretR" size={18} weight="bold" />
        </button>
      )}

      {budgets.length > 0 && hasBudget && (
        <Section title="Presupuestos" action="Editar" onAction={() => ui.setTab('goals')} className="rise" >
          <div className="card glass list">
            {visibleBudgets.map((c) => {
              const pct = c.pct ?? 0;
              const left = c.budget - c.spent;
              return (
                <button key={c.id} className="brow" onClick={() => ui.goExpenses(c.id)}>
                  <Badge icon={c.icon} color={c.color} size={42} />
                  <span className="brow__main">
                    <span className="brow__top">
                      <b>{c.name}</b>
                      <span className="tnum">{formatSmart(c.spent)}<i> / {formatSmart(c.budget)}</i></span>
                    </span>
                    <span className={`meter meter--${c.status}`} role="progressbar" aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`${c.name}: ${formatPct(pct)} del presupuesto`}>
                      <i style={{ width: `${Math.min(pct, 1) * 100}%` }} />
                    </span>
                    <span className={`brow__sub brow__sub--${c.status}`}>
                      {c.status === 'over' && <><Icon name="warningCircle" size={13} weight="fill" /> Pasado en {formatSmart(-left)}</>}
                      {c.status === 'watch' && <><Icon name="warning" size={13} weight="fill" /> Casi al límite · quedan {formatSmart(left)}</>}
                      {c.status === 'ok' && <>Te quedan {formatSmart(left)}</>}
                      {c.status === 'none' && <>Sin presupuesto</>}
                    </span>
                  </span>
                </button>
              );
            })}
            {budgets.length > 5 && (
              <button className="more" onClick={() => setShowAll((v) => !v)}>
                {showAll ? 'Ver menos' : `Ver las ${budgets.length} categorías`} <Icon name="caretD" size={14} weight="bold" className={showAll ? 'flip' : ''} />
              </button>
            )}
          </div>
        </Section>
      )}

      {summary.total > 0 && (
        <Section title="Dónde se va tu dinero" className="rise">
          <div className="card glass share">
            <Donut segments={segments} total={summary.total} />
            <ul className="legend">
              {segments.map((s) => (
                <li key={s.id}>
                  <i style={{ background: `var(--cat-${s.color})` }} />
                  <span>{s.name}</span>
                  <b className="tnum">{formatPct(s.share)}</b>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      {summary.total > 0 && (
        <Section title="Cada día" className="rise">
          <div className="card glass">
            <DailyBars daily={summary.daily} dayOfMonth={summary.dayOfMonth} dailyBudget={summary.dailyBudget} monthDate={now} isCurrent />
            <div className="card__foot">
              <span>Media diaria <b className="tnum">{formatSmart(summary.avgPerDay)}</b></span>
              <button className="link" onClick={() => ui.goExpenses()}>Ver lista <Icon name="caretR" size={14} weight="bold" /></button>
            </div>
          </div>
        </Section>
      )}

      {goalCards.length > 0 && (
        <Section title="Objetivos de ahorro" action="Ver todos" onAction={() => ui.setTab('goals')} className="rise">
          <div className="hscroll scroll-x">
            {goalCards.map(({ goal, progress }) => (
              <GoalCard key={goal.id} compact goal={goal} progress={progress} onClick={() => ui.openSheet('goalDetail', { goalId: goal.id })} />
            ))}
          </div>
        </Section>
      )}

      {insights.length > 0 && (
        <Section title="Engra opina" className="rise">
          <div className="hscroll scroll-x">
            {insights.map((card) => (
              <article key={card.id} className={`insight glass insight--${card.tone}`}>
                <span className="insight__icon"><Icon name={card.icon} size={20} weight="duotone" /></span>
                <h3 className="eyebrow">{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </Section>
      )}

      {monthsWithData >= 2 && (
        <Section title="Últimos meses" className="rise">
          <div className="card glass">
            <HistoryBars months={history} budget={summary.budget} />
          </div>
        </Section>
      )}

      {recent.length > 0 && (
        <Section title="Últimos gastos" action="Ver todos" onAction={() => ui.goExpenses()} className="rise">
          <div className="card glass list">
            {recent.map((e) => (
              <ExpenseRow key={e.id} expense={e} category={byId.get(e.category)} onClick={() => ui.openSheet('expense', { expense: e })} />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
