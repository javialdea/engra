import Dexie from 'dexie';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS, EMOJI_TO_ICON } from './lib/catalog.js';

export const db = new Dexie('engra');

db.version(1).stores({
  expenses: '++id, category, date',
  categories: '++id, name',
  savingsGoals: '++id, name',
  contributions: '++id, goalId, date',
  settings: 'key',
});

// v2: iconos por clave (antes emojis), color por categoría, gastos fijos y ajustes nuevos.
db.version(2)
  .stores({
    expenses: '++id, category, date',
    categories: '++id, name',
    savingsGoals: '++id, name',
    contributions: '++id, goalId, date',
    settings: 'key',
    recurring: '++id, category',
  })
  .upgrade(async (tx) => {
    const byName = Object.fromEntries(DEFAULT_CATEGORIES.map((c) => [c.name, c]));
    let i = 0;
    await tx.table('categories').toCollection().modify((c) => {
      const known = byName[c.name];
      c.icon = known?.icon ?? EMOJI_TO_ICON[c.icon] ?? 'tag';
      c.color = known?.color ?? i++ % 7;
    });
    const hasData = (await tx.table('expenses').count()) > 0;
    await tx.table('settings').toCollection().modify((s) => {
      s.tone ??= DEFAULT_SETTINGS.tone;
      s.theme = DEFAULT_SETTINGS.theme;
      s.accent ??= DEFAULT_SETTINGS.accent;
      s.haptics ??= DEFAULT_SETTINGS.haptics;
      s.onboarded ??= hasData || Boolean(s.userName);
    });
  });

export const ALL_TABLES = ['expenses', 'categories', 'savingsGoals', 'contributions', 'settings', 'recurring'];

export async function ensureSeeded() {
  await db.transaction('rw', db.categories, db.settings, async () => {
    if ((await db.categories.count()) === 0) {
      await db.categories.bulkAdd(DEFAULT_CATEGORIES);
    }
    if (!(await db.settings.get('app'))) {
      await db.settings.put({ ...DEFAULT_SETTINGS });
    }
  });
}
