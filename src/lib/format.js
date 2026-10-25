// Formato y fechas. Funciones puras: aceptan `now` para poder probarlas.

const nf2 = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', useGrouping: 'always' });
const nf0 = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  useGrouping: 'always',
});
const nfCompact = new Intl.NumberFormat('es-ES', { notation: 'compact', maximumFractionDigits: 1 });

export const round2 = (n) => Math.round(((n || 0) + Number.EPSILON) * 100) / 100;

export function formatCurrency(n) {
  return nf2.format(round2(n));
}

export function formatWhole(n) {
  return nf0.format(Math.round(n || 0));
}

/** 12 € si es entero, 12,50 € si no. */
export function formatSmart(n) {
  const r = round2(n);
  return Number.isInteger(r) ? nf0.format(r) : nf2.format(r);
}

export function formatCompact(n) {
  return nfCompact.format(n || 0);
}

/** Para cifras grandes: separa signo, enteros y céntimos. */
export function amountParts(n) {
  const r = Math.abs(round2(n));
  const [int, dec] = r.toFixed(2).split('.');
  return {
    negative: n < 0 && r > 0,
    int: Number(int).toLocaleString('es-ES', { useGrouping: 'always' }),
    dec,
  };
}

export const formatPct = (x) => `${Math.round((x || 0) * 100)}%`;

/** '12,5' -> 12.5 */
export function parseAmount(text) {
  const n = Number(String(text ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

// ---------- Fechas ----------

export const startOfDay = (d) => {
  const x = new Date(d);
  return new Date(x.getFullYear(), x.getMonth(), x.getDate());
};

export const isSameDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime();

export function monthRangeFor(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

export const currentMonthRange = (now = new Date()) => monthRangeFor(now);

export const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

export const addMonths = (date, n) => new Date(date.getFullYear(), date.getMonth() + n, 1);

export const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export function monthLabel(date = new Date()) {
  return capitalize(new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date));
}

export function monthName(date = new Date()) {
  return capitalize(new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date));
}

export function monthShort(date = new Date()) {
  return new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(date).replace('.', '');
}

export function toInputDate(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 'YYYY-MM-DD' -> Date a mediodía local (evita saltos por zona horaria). */
export function fromInputDate(text) {
  const [y, m, d] = text.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export function dayLabel(date, now = new Date()) {
  const d = new Date(date);
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  return capitalize(new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(d));
}

export function shortDate(date) {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(date)).replace('.', '');
}

export function longDate(now = new Date()) {
  return capitalize(new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(now));
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 6) return 'Buenas noches';
  if (h < 14) return 'Buenos días';
  if (h < 21) return 'Buenas tardes';
  return 'Buenas noches';
}
