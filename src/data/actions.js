// Todas las escrituras de la app pasan por aquí. Devuelven lo que la interfaz necesita
// (por ejemplo, el aviso de presupuesto tras apuntar un gasto).
import { ALL_TABLES, db, ensureSeeded } from '../db.js';
import { DEFAULT_SETTINGS } from '../lib/catalog.js';
import { round2 } from '../lib/format.js';
import { dueOccurrences, startKeyFor } from '../lib/recurring.js';
import { goalProgress, summarizeMonth } from '../lib/stats.js';
import { buildBackup } from '../lib/backupCore.js';

// ---------- Ajustes ----------
export const updateSettings = (patch) => db.settings.update('app', patch);

// ---------- Avisos de presupuesto ----------
/** Mira si el gasto recién apuntado cruza un umbral. Devuelve null si todo va bien. */
export async function evaluateAlert({ categoryId, delta, now = new Date() }) {
  const [settings, categories, expenses] = await Promise.all([
    db.settings.get('app'),
    db.categories.toArray(),
    db.expenses.toArray(),
  ]);
  const summary = summarizeMonth({ expenses, categories, now });
  const threshold = Math.min(settings?.alertThreshold ?? 1, 1);
  const cat = summary.perCategory.find((c) => c.id === categoryId);

  if (cat && cat.pct !== null) {
    const before = (cat.spent - delta) / cat.budget;
    if (cat.pct >= 1) return { kind: 'over', category: cat.name, pct: cat.pct, over: cat.spent - cat.budget, mood: 'stern' };
    if (cat.pct >= threshold && before < threshold) return { kind: 'watch', category: cat.name, pct: cat.pct, mood: 'watchful' };
  }
  if (summary.budget > 0 && summary.total > summary.budget && summary.total - delta <= summary.budget) {
    return { kind: 'overall', over: summary.total - summary.budget, mood: 'stern' };
  }
  return null;
}

// ---------- Gastos ----------
export async function addExpense({ amount, concept, category, date = new Date() }) {
  const value = round2(amount);
  const id = await db.expenses.add({ amount: value, concept: (concept ?? '').trim(), category, date });
  const alert = await evaluateAlert({ categoryId: category, delta: value, now: new Date() });
  return { id, alert };
}

export async function addExpenses(list) {
  await db.expenses.bulkAdd(
    list.map((e) => ({ amount: round2(e.amount), concept: (e.concept ?? '').trim(), category: e.category, date: e.date ?? new Date() })),
  );
  const ids = [...new Set(list.map((e) => e.category))];
  for (const categoryId of ids) {
    const delta = list.filter((e) => e.category === categoryId).reduce((acc, e) => acc + e.amount, 0);
    const alert = await evaluateAlert({ categoryId, delta });
    if (alert) return alert;
  }
  return null;
}

export async function updateExpense(id, patch, previous) {
  const next = { ...patch, amount: round2(patch.amount), concept: (patch.concept ?? '').trim() };
  await db.expenses.update(id, next);
  const spendsMore = !previous || next.category !== previous.category || next.amount > previous.amount;
  const delta = previous && next.category === previous.category ? next.amount - previous.amount : next.amount;
  const date = new Date(next.date);
  const now = new Date();
  const thisMonth = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  return spendsMore && thisMonth ? evaluateAlert({ categoryId: next.category, delta }) : null;
}

export const deleteExpense = (id) => db.expenses.delete(id);

// ---------- Categorías ----------
export async function saveCategory(data) {
  const clean = { name: data.name.trim(), icon: data.icon, color: data.color, budget: Math.max(0, Number(data.budget) || 0) };
  if (data.id) {
    await db.categories.update(data.id, clean);
    return data.id;
  }
  return db.categories.add(clean);
}

/** Al borrar una categoría, sus gastos pasan a "Otros" (si existe) para no perderlos. */
export async function deleteCategory(id) {
  await db.transaction('rw', db.categories, db.expenses, db.recurring, async () => {
    const fallback = (await db.categories.toArray()).find((c) => c.name === 'Otros' && c.id !== id);
    if (fallback) {
      await db.expenses.where('category').equals(id).modify({ category: fallback.id });
      await db.recurring.where('category').equals(id).modify({ category: fallback.id });
    }
    await db.categories.delete(id);
  });
}

// ---------- Objetivos de ahorro ----------
export async function saveGoal(data) {
  const clean = {
    name: data.name.trim(),
    targetAmount: Math.max(1, Number(data.targetAmount) || 0),
    targetDate: data.targetDate || null,
    icon: data.icon || 'piggy',
    color: data.color ?? 2,
  };
  if (data.id) {
    await db.savingsGoals.update(data.id, clean);
    return data.id;
  }
  return db.savingsGoals.add(clean);
}

export async function deleteGoal(id) {
  await db.transaction('rw', db.savingsGoals, db.contributions, async () => {
    await db.contributions.where('goalId').equals(id).delete();
    await db.savingsGoals.delete(id);
  });
}

export async function addContribution({ goalId, amount, date = new Date() }) {
  await db.contributions.add({ goalId, amount: round2(amount), date });
  const [goal, contributions] = await Promise.all([db.savingsGoals.get(goalId), db.contributions.toArray()]);
  const progress = goalProgress({ goal, contributions });
  return { goal, progress };
}

export const deleteContribution = (id) => db.contributions.delete(id);

// ---------- Gastos fijos ----------
export async function saveRecurring(data) {
  const clean = { concept: data.concept.trim(), amount: round2(data.amount), category: data.category, day: Number(data.day) };
  if (data.id) {
    await db.recurring.update(data.id, clean);
    return data.id;
  }
  const id = await db.recurring.add({ ...clean, startKey: startKeyFor(clean.day), lastKey: null });
  await runRecurring();
  return id;
}

export const deleteRecurring = (id) => db.recurring.delete(id);

/** Genera los gastos fijos que ya tocan. Idempotente. */
export async function runRecurring(now = new Date()) {
  return db.transaction('rw', db.recurring, db.expenses, async () => {
    const items = await db.recurring.toArray();
    let created = 0;
    for (const item of items) {
      const due = dueOccurrences(item, now);
      if (due.length === 0) continue;
      for (const o of due) {
        await db.expenses.add({
          amount: item.amount,
          concept: item.concept,
          category: item.category,
          date: o.date,
          recurringId: item.id,
        });
        created++;
      }
      await db.recurring.update(item.id, { lastKey: due[due.length - 1].key });
    }
    return created;
  });
}

// ---------- Bienvenida ----------
export async function applyOnboarding({ userName, tone, monthlyBudget }) {
  await db.transaction('rw', db.categories, db.settings, async () => {
    const cats = await db.categories.toArray();
    const total = cats.reduce((acc, c) => acc + (c.budget || 0), 0) || 1;
    for (const c of cats) {
      const budget = Math.max(0, Math.round((((c.budget || 0) / total) * monthlyBudget) / 5) * 5);
      await db.categories.update(c.id, { budget });
    }
    await db.settings.update('app', { userName: userName.trim(), tone, onboarded: true });
  });
}

// ---------- Copia de seguridad ----------
export async function exportAllData() {
  const [settings, categories, expenses, savingsGoals, contributions, recurring] = await Promise.all([
    db.settings.get('app'),
    db.categories.toArray(),
    db.expenses.toArray(),
    db.savingsGoals.toArray(),
    db.contributions.toArray(),
    db.recurring.toArray(),
  ]);
  return buildBackup({ settings, categories, expenses, savingsGoals, contributions, recurring });
}

/** Sustituye todos los datos por los de una copia ya validada con parseBackup. */
export async function importAllData(data) {
  await db.transaction('rw', db.tables, async () => {
    for (const name of ALL_TABLES) await db.table(name).clear();
    await db.categories.bulkAdd(data.categories);
    await db.expenses.bulkAdd(data.expenses);
    await db.savingsGoals.bulkAdd(data.savingsGoals);
    await db.contributions.bulkAdd(data.contributions);
    await db.recurring.bulkAdd(data.recurring);
    await db.settings.put({ ...DEFAULT_SETTINGS, ...(data.settings ?? {}), key: 'app', onboarded: true });
  });
}

export async function resetAllData() {
  await db.transaction('rw', db.tables, async () => {
    for (const name of ALL_TABLES) await db.table(name).clear();
  });
  await ensureSeeded();
}
