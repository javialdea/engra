import { test } from 'node:test';
import assert from 'node:assert/strict';

import { amountParts, dayLabel, parseAmount, monthKey, toInputDate, fromInputDate, formatSmart, greeting } from './format.js';
import { summarizeMonth, compareWithPrevMonth, monthlyTotals, goalProgress, statusFor } from './stats.js';
import { fill, engraVoice, alertVoice, pick } from './voice.js';
import { dueOccurrences, startKeyFor, nextOccurrence } from './recurring.js';
import { topConcepts, categoryForConcept, normalizeConcept } from './concepts.js';
import { buildBackup, parseBackup, buildCsv } from './backupCore.js';
import { buildInsights } from './insights.js';
import { pressKey, displayAmount, amountToText } from './amountInput.js';

const now = new Date(2026, 9, 25, 15, 0); // domingo 25 oct 2026
const d = (m, day, h = 12) => new Date(2026, m - 1, day, h, 0);

const categories = [
  { id: 1, name: 'Comida', icon: 'food', color: 1, budget: 300 },
  { id: 2, name: 'Transporte', icon: 'bus', color: 0, budget: 60 },
  { id: 3, name: 'Ocio', icon: 'ticket', color: 3, budget: 100 },
];
const expenses = [
  { id: 1, amount: 45.5, concept: 'Mercadona', category: 1, date: d(10, 25) },
  { id: 2, amount: 12, concept: 'Bus', category: 2, date: d(10, 25, 9) },
  { id: 3, amount: 290, concept: 'Cena', category: 1, date: d(10, 24) },
  { id: 4, amount: 9.99, concept: 'Cine', category: 3, date: d(10, 20) },
  { id: 5, amount: 50, concept: 'Cine', category: 3, date: d(9, 15) },
  { id: 6, amount: 100, concept: 'Mercadona', category: 1, date: d(9, 10) },
  { id: 7, amount: 80, concept: 'Mercadona', category: 1, date: d(9, 28) },
];

test('formato: partes de importe, parseo y fechas', () => {
  assert.deepEqual(amountParts(1234.5), { negative: false, int: '1.234', dec: '50' });
  assert.equal(amountParts(-5).negative, true);
  assert.equal(parseAmount('12,5'), 12.5);
  assert.equal(parseAmount('abc'), 0);
  assert.equal(monthKey(now), '2026-10');
  assert.equal(toInputDate(fromInputDate('2026-03-09')), '2026-03-09');
  assert.equal(dayLabel(d(10, 25), now), 'Hoy');
  assert.equal(dayLabel(d(10, 24), now), 'Ayer');
  assert.equal(dayLabel(d(10, 22), now), 'Jueves, 22 de octubre');
  assert.equal(formatSmart(12).replace(/\s/g, ' '), '12 €');
  assert.equal(formatSmart(12.5).replace(/\s/g, ' '), '12,50 €');
  assert.equal(greeting(new Date(2026, 9, 25, 9)), 'Buenos días');
  assert.equal(greeting(new Date(2026, 9, 25, 18)), 'Buenas tardes');
});

test('estadísticas del mes', () => {
  const s = summarizeMonth({ expenses, categories, now });
  assert.equal(s.dim, 31);
  assert.equal(s.dayOfMonth, 25);
  assert.equal(s.daysLeft, 7);
  assert.equal(s.total, 357.49);
  assert.equal(s.budget, 460);
  assert.equal(s.remaining, 102.51);
  assert.equal(s.count, 4);
  assert.equal(s.expectedSpend, 370.97);
  assert.equal(s.projection, 443.29);
  assert.ok(Math.abs(s.dailyAllowance - 102.51 / 7) < 1e-9);
  assert.equal(s.daily[24], 57.5);
  assert.equal(s.streak, 0);
  const comida = s.perCategory.find((c) => c.id === 1);
  assert.equal(comida.spent, 335.5);
  assert.equal(comida.status, 'over');
  assert.equal(s.biggest.id, 3);
  assert.equal(statusFor(0.79), 'ok');
  assert.equal(statusFor(0.8), 'watch');
  assert.equal(statusFor(1), 'over');
  assert.equal(statusFor(null), 'none');
});

test('gastos sin categoría cuentan en el total', () => {
  const s = summarizeMonth({ expenses: [...expenses, { id: 9, amount: 10, concept: 'x', category: 99, date: d(10, 3) }], categories, now });
  assert.equal(s.total, 367.49);
  assert.equal(s.perCategory.at(-1).name, 'Sin categoría');
});

test('racha de días sin gastar', () => {
  const s = summarizeMonth({ expenses: [{ id: 1, amount: 5, concept: 'a', category: 1, date: d(10, 21) }], categories, now });
  assert.equal(s.streak, 4); // 22, 23, 24, 25
});

test('comparación con el mes anterior al mismo día', () => {
  const c = compareWithPrevMonth({ expenses, now });
  assert.equal(c.current, 357.49);
  assert.equal(c.previous, 150);
  assert.equal(c.prevTotal, 230);
  assert.equal(c.diff, 207.49);
  assert.ok(c.hasPrev);
});

test('totales mensuales', () => {
  const m = monthlyTotals({ expenses, now, months: 3 });
  assert.deepEqual(m.map((x) => x.total), [0, 230, 357.49]);
  assert.equal(m[2].isCurrent, true);
});

test('progreso de objetivos de ahorro', () => {
  const goal = { id: 1, targetAmount: 1000 };
  const contributions = [
    { goalId: 1, amount: 200, date: d(9, 25, 15) },
    { goalId: 1, amount: 100, date: d(10, 20) },
    { goalId: 2, amount: 999, date: d(10, 20) },
  ];
  const p = goalProgress({ goal, contributions, now });
  assert.equal(p.saved, 300);
  assert.equal(p.remaining, 700);
  assert.equal(p.pct, 0.3);
  assert.equal(p.done, false);
  assert.ok(p.eta > now);
  assert.equal(goalProgress({ goal, contributions: [{ goalId: 1, amount: 1000, date: now }], now }).done, true);
});

test('voz: rellenado y nombre ausente', () => {
  assert.equal(fill('¡Qué bien vas, {name}!', { name: '' }), '¡Qué bien vas!');
  assert.equal(fill('{name}, hola', {}), 'Hola');
  assert.equal(fill('Hola, {name}.', { name: 'Javier' }), 'Hola, Javier.');
  assert.equal(fill('Nos hemos pasado en {category}, {name}.', { category: 'Comida' }), 'Nos hemos pasado en Comida.');
  assert.equal(pick(['a', 'b', 'c'], 'x'), pick(['a', 'b', 'c'], 'x'));
});

test('voz: situaciones y humor', () => {
  const empty = summarizeMonth({ expenses: [], categories, now });
  assert.equal(engraVoice({ summary: empty, now }).situation, 'empty');

  const over = summarizeMonth({ expenses, categories, now });
  const v = engraVoice({ summary: over, tone: 'formal', name: 'Javier', now });
  assert.equal(v.situation, 'over');
  assert.equal(v.mood, 'stern');
  assert.match(v.text, /Comida/);

  const calm = summarizeMonth({ expenses: [{ id: 1, amount: 20, concept: 'a', category: 1, date: d(10, 3) }], categories, now });
  const calmVoice = engraVoice({ summary: calm, now });
  assert.equal(calmVoice.mood, 'happy');

  const watch = summarizeMonth({ expenses: [{ id: 1, amount: 250, concept: 'a', category: 1, date: d(10, 3) }], categories, now });
  assert.equal(engraVoice({ summary: watch, now }).situation, 'watch');

  const all = summarizeMonth({ expenses: [{ id: 1, amount: 500, concept: 'a', category: 1, date: d(10, 3) }], categories, now });
  assert.equal(engraVoice({ summary: all, now }).situation, 'overall');

  for (const tone of ['warm', 'formal', 'witty']) {
    for (const kind of ['watch', 'over', 'overall']) {
      const text = alertVoice({ kind, tone, name: '', category: 'Ocio', pct: 1.12, over: 12 });
      assert.ok(text.length > 5 && !text.includes('{'), `${tone}/${kind}: ${text}`);
    }
  }
});

test('gastos fijos: cobros pendientes', () => {
  const item = { day: 31, startKey: '2026-01', lastKey: null };
  const keys = dueOccurrences(item, new Date(2026, 2, 2, 10)).map((o) => o.key);
  assert.deepEqual(keys, ['2026-01', '2026-02']);
  assert.equal(dueOccurrences(item, new Date(2026, 2, 2, 10))[1].date.getDate(), 28);
  assert.deepEqual(dueOccurrences({ day: 5, startKey: '2026-10', lastKey: '2026-10' }, now), []);
  assert.deepEqual(dueOccurrences({ day: 5, startKey: '2026-10', lastKey: '2026-08' }, now).map((o) => o.key), ['2026-09', '2026-10']);
  assert.equal(startKeyFor(10, now), '2026-11');
  assert.equal(startKeyFor(25, now), '2026-10');
  assert.equal(startKeyFor(30, now), '2026-10');
  assert.equal(nextOccurrence({ day: 5, startKey: '2026-11', lastKey: null }, now).getMonth(), 10);
  assert.equal(nextOccurrence({ day: 30, startKey: '2026-10', lastKey: null }, now).getDate(), 30);
});

test('memoria de conceptos', () => {
  const top = topConcepts(expenses, { now });
  assert.equal(top[0].concept, 'Mercadona');
  assert.equal(top[0].count, 3);
  assert.equal(categoryForConcept(expenses, 'MERCADONA'), 1);
  assert.equal(categoryForConcept(expenses, 'nada'), null);
  assert.equal(normalizeConcept(' Café '), 'cafe');
});

test('copia de seguridad: ida y vuelta, validación y CSV', () => {
  const backup = buildBackup({ settings: { key: 'app', userName: 'A' }, categories, expenses }, now);
  const parsed = parseBackup(JSON.stringify(backup));
  assert.equal(parsed.expenses.length, expenses.length);
  assert.ok(parsed.expenses[0].date instanceof Date);
  assert.equal(parsed.expenses[0].date.getTime(), expenses[0].date.getTime());
  assert.throws(() => parseBackup('no es json'));
  assert.throws(() => parseBackup(JSON.stringify({ app: 'otra', version: 1 })));
  assert.throws(() => parseBackup(JSON.stringify({ ...backup, version: 99 })));
  const csv = buildCsv(expenses, categories);
  const lines = csv.replace('﻿', '').split('\r\n');
  assert.equal(lines[0], 'Fecha;Concepto;Categoría;Importe');
  assert.equal(lines.length, expenses.length + 1);
  assert.match(lines[1], /^2026-09-10;Mercadona;Comida;100,00$/);
});

test('teclado numérico: reglas de escritura', () => {
  const type = (keys) => [...keys].reduce((v, k) => pressKey(v, k === 'b' ? 'back' : k), '');
  assert.equal(type('125'), '125');
  assert.equal(type('0'), '0');
  assert.equal(type('05'), '5');
  assert.equal(type('00'), '0');
  assert.equal(type(','), '0,');
  assert.equal(type('12,5'), '12,5');
  assert.equal(type('12,567'), '12,56');
  assert.equal(type('1,,2'), '1,2');
  assert.equal(type('123b'), '12');
  assert.equal(type('12345678'), '1234567');
  assert.equal(displayAmount('1234,5'), '1.234,5');
  assert.equal(displayAmount(''), '0');
  assert.equal(amountToText(12.5), '12,5');
});

test('insights: no hay nada sin datos y hay tarjetas con datos', () => {
  const empty = summarizeMonth({ expenses: [], categories, now });
  assert.deepEqual(buildInsights({ summary: empty, compare: null, now }), []);
  const s = summarizeMonth({ expenses, categories, now });
  const cards = buildInsights({ summary: s, compare: compareWithPrevMonth({ expenses, now }), recurring: [{ amount: 9.99 }], now });
  const ids = cards.map((c) => c.id);
  assert.ok(ids.includes('top') && ids.includes('pace') && ids.includes('vsPrev') && ids.includes('projection') && ids.includes('fixed'));
  assert.ok(cards.every((c) => c.title && c.text && !c.text.includes('undefined')));
});
