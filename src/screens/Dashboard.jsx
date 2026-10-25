import { useEffect, useState, useCallback } from 'react';
import { db } from '../db';
import Engra from '../components/Engra';
import CategoryProgress from '../components/CategoryProgress';
import { computeMood } from '../utils/engraMood';
import { formatCurrency, monthLabel, currentMonthRange } from '../utils/format';

export default function Dashboard({ refreshKey }) {
  const [categories, setCategories] = useState([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [cats, expenses, settings] = await Promise.all([
      db.categories.toArray(),
      db.expenses.toArray(),
      db.settings.get('app'),
    ]);

    const { start, end } = currentMonthRange();
    const monthExpenses = expenses.filter((e) => {
      const d = new Date(e.date);
      return d >= start && d < end;
    });

    const withSpent = cats.map((c) => ({
      ...c,
      spent: monthExpenses.filter((e) => e.category === c.id).reduce((sum, e) => sum + e.amount, 0),
    }));

    setCategories(withSpent);
    setUserName(settings?.userName ?? '');
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  if (loading) return null;

  const total = categories.reduce((sum, c) => sum + c.spent, 0);
  const budget = categories.reduce((sum, c) => sum + c.budget, 0);
  const { mood, message } = computeMood(categories);

  return (
    <div className="screen dashboard">
      <header className="dashboard__header">
        <Engra mood={mood} size={96} />
        <div>
          <h1>{userName ? `Hola, ${userName}` : 'Hola'}</h1>
          <p className="dashboard__bubble">{message}</p>
        </div>
      </header>

      <section className="dashboard__summary">
        <span className="dashboard__month">{monthLabel()}</span>
        <span className="dashboard__total">
          {formatCurrency(total)} <small>de {formatCurrency(budget)}</small>
        </span>
      </section>

      <section className="dashboard__categories">
        {categories.map((c) => (
          <CategoryProgress key={c.id} category={c} />
        ))}
      </section>
    </div>
  );
}
