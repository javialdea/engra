import Dexie from 'dexie';

export const db = new Dexie('engra');

db.version(1).stores({
  expenses: '++id, category, date',
  categories: '++id, name',
  savingsGoals: '++id, name',
  contributions: '++id, goalId, date',
  settings: 'key',
});

const DEFAULT_CATEGORIES = [
  { name: 'Comida', icon: '🍽️', budget: 300 },
  { name: 'Transporte', icon: '🚌', budget: 60 },
  { name: 'Ocio', icon: '🎉', budget: 100 },
  { name: 'Casa', icon: '🏠', budget: 200 },
  { name: 'Salud', icon: '💊', budget: 50 },
  { name: 'Compras', icon: '🛍️', budget: 100 },
  { name: 'Suscripciones', icon: '📱', budget: 40 },
  { name: 'Otros', icon: '📦', budget: 50 },
];

export async function ensureSeeded() {
  await db.transaction('rw', db.categories, db.settings, async () => {
    const count = await db.categories.count();
    if (count === 0) {
      await db.categories.bulkAdd(DEFAULT_CATEGORIES);
    }
    const settings = await db.settings.get('app');
    if (!settings) {
      await db.settings.put({ key: 'app', userName: '', alertThreshold: 1 });
    }
  });
}
