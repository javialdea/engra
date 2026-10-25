// Estadísticas del mes. Todo puro: recibe datos y `now`, devuelve números.
import { addMonths, daysInMonth, monthKey, monthRangeFor, monthShort, round2 } from './format.js';

const asDate = (d) => (d instanceof Date ? d : new Date(d));
const sum = (list) => list.reduce((acc, n) => acc + n, 0);

export function statusFor(pct) {
  if (pct === null || pct === undefined) return 'none';
  if (pct >= 1) return 'over';
  if (pct >= 0.8) return 'watch';
  return 'ok';
}

export function expensesInMonth(expenses, monthDate) {
  const { start, end } = monthRangeFor(monthDate);
  return expenses.filter((e) => {
    const d = asDate(e.date);
    return d >= start && d < end;
  });
}

export function summarizeMonth({ expenses, categories, now = new Date(), monthDate = now }) {
  const { end } = monthRangeFor(monthDate);
  const dim = daysInMonth(monthDate);
  const isCurrent = monthKey(monthDate) === monthKey(now);
  const isFinished = end <= now;
  const dayOfMonth = isCurrent ? now.getDate() : isFinished ? dim : 0;
  const daysLeft = isCurrent ? dim - dayOfMonth + 1 : 0;

  const inMonth = expensesInMonth(expenses, monthDate);
  const total = round2(sum(inMonth.map((e) => e.amount)));

  const byId = new Map(categories.map((c) => [c.id, { ...c, spent: 0, count: 0 }]));
  const orphan = { id: -1, name: 'Sin categoría', icon: 'tag', color: 7, budget: 0, spent: 0, count: 0 };
  for (const e of inMonth) {
    const c = byId.get(e.category) ?? orphan;
    c.spent += e.amount;
    c.count += 1;
  }
  const rows = [...byId.values()];
  if (orphan.count > 0) rows.push(orphan);

  const perCategory = rows.map((c) => {
    const spent = round2(c.spent);
    const pct = c.budget > 0 ? spent / c.budget : null;
    return { ...c, spent, pct, status: statusFor(pct), share: total > 0 ? spent / total : 0 };
  });

  const budget = round2(sum(categories.map((c) => c.budget || 0)));
  const remaining = round2(budget - total);
  const pctSpent = budget > 0 ? total / budget : 0;
  const pctElapsed = isCurrent ? dayOfMonth / dim : isFinished ? 1 : 0;
  const expectedSpend = round2(budget * pctElapsed);

  const daily = Array.from({ length: dim }, () => 0);
  for (const e of inMonth) daily[asDate(e.date).getDate() - 1] += e.amount;

  let biggest = null;
  for (const e of inMonth) if (!biggest || e.amount > biggest.amount) biggest = e;

  let streak = 0;
  if (dayOfMonth > 0) {
    for (let d = dayOfMonth; d >= 1; d--) {
      if (daily[d - 1] > 0) break;
      streak++;
    }
  }

  const avgPerDay = dayOfMonth > 0 ? total / dayOfMonth : 0;

  return {
    monthDate,
    isCurrent,
    isFinished,
    dim,
    dayOfMonth,
    daysLeft,
    count: inMonth.length,
    total,
    budget,
    remaining,
    pctSpent,
    pctElapsed,
    expectedSpend,
    paceDelta: round2(total - expectedSpend),
    status: budget > 0 ? statusFor(pctSpent) : 'none',
    dailyBudget: budget > 0 ? budget / dim : 0,
    dailyAllowance: isCurrent && remaining > 0 && daysLeft > 0 ? remaining / daysLeft : 0,
    avgPerDay,
    avgExpense: inMonth.length ? total / inMonth.length : 0,
    projection: isCurrent && dayOfMonth >= 3 && total > 0 ? round2(avgPerDay * dim) : null,
    perCategory,
    daily: daily.map(round2),
    biggest,
    streak,
  };
}

/** Gasto acumulado hasta el mismo día del mes anterior, para comparar a igual ritmo. */
export function compareWithPrevMonth({ expenses, now = new Date() }) {
  const day = now.getDate();
  const prevDate = addMonths(now, -1);
  const upTo = (monthDate, lastDay) =>
    round2(sum(expensesInMonth(expenses, monthDate).filter((e) => asDate(e.date).getDate() <= lastDay).map((e) => e.amount)));
  const current = upTo(now, day);
  const previous = upTo(prevDate, day);
  const prevTotal = round2(sum(expensesInMonth(expenses, prevDate).map((e) => e.amount)));
  return {
    current,
    previous,
    prevTotal,
    diff: round2(current - previous),
    pct: previous > 0 ? (current - previous) / previous : null,
    prevDate,
    hasPrev: prevTotal > 0,
  };
}

/** Totales de los últimos n meses (el más antiguo primero). */
export function monthlyTotals({ expenses, now = new Date(), months = 6 }) {
  return Array.from({ length: months }, (_, i) => {
    const date = addMonths(now, i - (months - 1));
    return {
      key: monthKey(date),
      label: monthShort(date),
      date,
      total: round2(sum(expensesInMonth(expenses, date).map((e) => e.amount))),
      isCurrent: monthKey(date) === monthKey(now),
    };
  });
}

/** Aportaciones a un objetivo de ahorro: total, ritmo medio mensual y fecha estimada. */
export function goalProgress({ goal, contributions, now = new Date() }) {
  const mine = contributions.filter((c) => c.goalId === goal.id);
  const saved = round2(sum(mine.map((c) => c.amount)));
  const target = goal.targetAmount || 0;
  const pct = target > 0 ? Math.min(saved / target, 1) : 0;
  const remaining = round2(Math.max(target - saved, 0));
  const done = target > 0 && saved >= target;

  let monthlyPace = 0;
  let eta = null;
  if (mine.length > 0 && !done) {
    const first = mine.reduce((min, c) => (asDate(c.date) < min ? asDate(c.date) : min), asDate(mine[0].date));
    const months = Math.max((now - first) / (86400000 * 30.44), 1);
    monthlyPace = saved / months;
    if (monthlyPace > 0) eta = new Date(now.getTime() + (remaining / monthlyPace) * 30.44 * 86400000);
  }

  let neededPerMonth = null;
  if (goal.targetDate && !done) {
    const left = (new Date(goal.targetDate) - now) / (86400000 * 30.44);
    neededPerMonth = left > 0 ? remaining / Math.max(left, 1) : remaining;
  }

  return { saved, target, pct, remaining, done, monthlyPace, eta, neededPerMonth, count: mine.length };
}
