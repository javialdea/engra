// Copia de seguridad: lógica pura (validar, revivir fechas, CSV).
import { round2 } from './format.js';

export const BACKUP_VERSION = 1;
const TABLES = ['categories', 'expenses', 'savingsGoals', 'contributions', 'recurring'];

export function buildBackup(data, now = new Date()) {
  return {
    app: 'engra',
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    settings: data.settings ?? null,
    categories: data.categories ?? [],
    expenses: data.expenses ?? [],
    savingsGoals: data.savingsGoals ?? [],
    contributions: data.contributions ?? [],
    recurring: data.recurring ?? [],
  };
}

const reviveDate = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? new Date() : d;
};

/** Valida el JSON y devuelve datos listos para guardar (fechas como Date). Lanza Error si no sirve. */
export function parseBackup(text) {
  let raw;
  try {
    raw = typeof text === 'string' ? JSON.parse(text) : text;
  } catch {
    throw new Error('El archivo no es una copia válida de Engra.');
  }
  if (!raw || raw.app !== 'engra' || typeof raw.version !== 'number') {
    throw new Error('El archivo no es una copia válida de Engra.');
  }
  if (raw.version > BACKUP_VERSION) {
    throw new Error('La copia es de una versión más nueva de Engra.');
  }
  for (const t of TABLES) {
    if (!Array.isArray(raw[t] ?? [])) throw new Error(`Copia dañada: falta la tabla ${t}.`);
  }
  return {
    settings: raw.settings ?? null,
    categories: (raw.categories ?? []).map((c) => ({ ...c })),
    expenses: (raw.expenses ?? []).map((e) => ({ ...e, amount: Number(e.amount) || 0, date: reviveDate(e.date) })),
    savingsGoals: (raw.savingsGoals ?? []).map((g) => ({ ...g })),
    contributions: (raw.contributions ?? []).map((c) => ({ ...c, amount: Number(c.amount) || 0, date: reviveDate(c.date) })),
    recurring: (raw.recurring ?? []).map((r) => ({ ...r })),
  };
}

const csvCell = (v) => {
  const s = String(v ?? '');
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** CSV con `;` y coma decimal, listo para abrir en Excel en español. */
export function buildCsv(expenses, categories) {
  const names = new Map(categories.map((c) => [c.id, c.name]));
  const rows = [...expenses]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((e) => {
      const d = new Date(e.date);
      const pad = (n) => String(n).padStart(2, '0');
      const day = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      return [day, e.concept, names.get(e.category) ?? 'Sin categoría', round2(e.amount).toFixed(2).replace('.', ',')];
    });
  return '﻿' + [['Fecha', 'Concepto', 'Categoría', 'Importe'], ...rows].map((r) => r.map(csvCell).join(';')).join('\r\n');
}
