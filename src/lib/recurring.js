// Gastos fijos: se generan solos cuando llega su día.
import { daysInMonth, monthKey } from './format.js';

const pad = (n) => String(n).padStart(2, '0');

function parseKey(key) {
  const [y, m] = key.split('-').map(Number);
  return { y, m };
}

export function nextKey(key) {
  const { y, m } = parseKey(key);
  return m === 12 ? `${y + 1}-01` : `${y}-${pad(m + 1)}`;
}

/** Mes en el que debe empezar un gasto fijo nuevo (no se rellena el pasado). */
export function startKeyFor(day, now = new Date()) {
  return day >= now.getDate() ? monthKey(now) : nextKey(monthKey(now));
}

export function occurrenceDate(key, day) {
  const { y, m } = parseKey(key);
  const dim = daysInMonth(new Date(y, m - 1, 1));
  return new Date(y, m - 1, Math.min(day, dim), 8, 0, 0);
}

/** Cobros pendientes de un gasto fijo hasta `now`. */
export function dueOccurrences(item, now = new Date()) {
  const out = [];
  let key = item.lastKey ? nextKey(item.lastKey) : item.startKey;
  const nowKey = monthKey(now);
  let guard = 0;
  while (key <= nowKey && guard++ < 240) {
    const date = occurrenceDate(key, item.day);
    if (date > now) break;
    out.push({ key, date });
    key = nextKey(key);
  }
  return out;
}

/** Próximo cobro, para mostrarlo en la lista. */
export function nextOccurrence(item, now = new Date()) {
  const thisMonth = occurrenceDate(monthKey(now), item.day);
  const startsLater = item.startKey > monthKey(now);
  if (startsLater) return occurrenceDate(item.startKey, item.day);
  return thisMonth > now ? thisMonth : occurrenceDate(nextKey(monthKey(now)), item.day);
}
