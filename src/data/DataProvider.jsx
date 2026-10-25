import { createContext, useContext } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db.js';

const DataContext = createContext(null);

/** Una sola consulta viva con todas las tablas: las pantallas siempre ven la misma foto. */
export function DataProvider({ children }) {
  const data = useLiveQuery(async () => {
    const [settings, categories, expenses, goals, contributions, recurring] = await Promise.all([
      db.settings.get('app'),
      db.categories.toArray(),
      db.expenses.toArray(),
      db.savingsGoals.toArray(),
      db.contributions.toArray(),
      db.recurring.toArray(),
    ]);
    return { settings, categories, expenses, goals, contributions, recurring };
  }, []);

  if (!data || !data.settings) return null;
  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}

export function useData() {
  const value = useContext(DataContext);
  if (!value) throw new Error('useData fuera de DataProvider');
  return value;
}
