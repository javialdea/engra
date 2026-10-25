// "Engra opina": observaciones calculadas en local a partir de los datos del mes.
import { formatCurrency, formatPct, formatSmart, monthName } from './format.js';

/**
 * Devuelve tarjetas { id, icon, tone: 'good'|'warn'|'info', title, text }.
 * Las más útiles van primero; no devuelve nada si aún no hay datos.
 */
export function buildInsights({ summary, compare, recurring = [] }) {
  const out = [];
  if (summary.count === 0) return out;

  const top = [...summary.perCategory].sort((a, b) => b.spent - a.spent)[0];
  if (top && top.spent > 0 && summary.total > 0) {
    out.push({
      id: 'top',
      icon: top.icon,
      tone: 'info',
      title: 'Tu mayor partida',
      text: `${top.name} se lleva el ${formatPct(top.share)} de lo gastado (${formatSmart(top.spent)}).`,
    });
  }

  if (summary.isCurrent && summary.dayOfMonth >= 5 && summary.budget > 0) {
    const ahead = summary.pctSpent - summary.pctElapsed;
    out.push({
      id: 'pace',
      icon: 'gauge',
      tone: ahead > 0.1 ? 'warn' : 'good',
      title: 'Ritmo del mes',
      text:
        ahead > 0.1
          ? `Llevas el ${formatPct(summary.pctSpent)} del presupuesto con el ${formatPct(summary.pctElapsed)} del mes.`
          : `Vas por debajo del ritmo: ${formatPct(summary.pctSpent)} gastado con el ${formatPct(summary.pctElapsed)} del mes.`,
    });
  }

  if (compare?.hasPrev && summary.isCurrent && Math.abs(compare.diff) >= 1) {
    const less = compare.diff < 0;
    out.push({
      id: 'vsPrev',
      icon: less ? 'trendDown' : 'trendUp',
      tone: less ? 'good' : 'warn',
      title: `Frente a ${monthName(compare.prevDate).toLowerCase()}`,
      text: `Llevas ${formatCurrency(Math.abs(compare.diff))} ${less ? 'menos' : 'más'} que a estas alturas.`,
    });
  }

  if (summary.projection !== null && summary.budget > 0) {
    const over = summary.projection > summary.budget;
    out.push({
      id: 'projection',
      icon: 'target',
      tone: over ? 'warn' : 'good',
      title: 'A este ritmo',
      text: over
        ? `Cerrarías el mes en ${formatSmart(summary.projection)}, ${formatSmart(summary.projection - summary.budget)} por encima del límite.`
        : `Cerrarías el mes en ${formatSmart(summary.projection)}, dentro de tus ${formatSmart(summary.budget)}.`,
    });
  }

  if (summary.biggest && summary.count >= 3) {
    const b = summary.biggest;
    const cat = summary.perCategory.find((c) => c.id === b.category);
    out.push({
      id: 'biggest',
      icon: cat?.icon ?? 'tag',
      tone: 'info',
      title: 'Tu mayor gasto',
      text: `${formatSmart(b.amount)} en ${b.concept || cat?.name || 'un gasto'} el día ${new Date(b.date).getDate()}.`,
    });
  }

  if (summary.isCurrent && summary.streak >= 2) {
    out.push({
      id: 'streak',
      icon: 'star',
      tone: 'good',
      title: 'Racha',
      text: `${summary.streak} días seguidos sin gastar. Así se hace.`,
    });
  }

  if (recurring.length > 0) {
    const total = recurring.reduce((acc, r) => acc + r.amount, 0);
    out.push({
      id: 'fixed',
      icon: 'repeat',
      tone: 'info',
      title: 'Gastos fijos',
      text: `${recurring.length} ${recurring.length === 1 ? 'gasto fijo suma' : 'gastos fijos suman'} ${formatSmart(total)} al mes.`,
    });
  }

  return out;
}
