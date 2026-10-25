import { useEffect, useState, useCallback } from 'react';
import { db } from '../db';
import SavingsGoalCard from './SavingsGoalCard';

export default function SavingsPanel({ refreshKey, onChanged }) {
  const [goals, setGoals] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [date, setDate] = useState('');

  const load = useCallback(async () => {
    const gs = await db.savingsGoals.toArray();
    const contributions = await db.contributions.toArray();
    setGoals(
      gs.map((g) => ({
        ...g,
        saved: contributions.filter((c) => c.goalId === g.id).reduce((sum, c) => sum + c.amount, 0),
      }))
    );
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function addGoal() {
    if (!name.trim() || !Number(target)) return;
    await db.savingsGoals.add({ name: name.trim(), targetAmount: Number(target), targetDate: date || null });
    setName('');
    setTarget('');
    setDate('');
    setShowNew(false);
    load();
    onChanged();
  }

  async function contribute(goalId, amount) {
    await db.contributions.add({ goalId, amount, date: new Date() });
    load();
    onChanged();
  }

  async function removeGoal(id) {
    await db.savingsGoals.delete(id);
    await db.contributions.where('goalId').equals(id).delete();
    load();
    onChanged();
  }

  return (
    <div className="panel">
      {goals.map((g) => (
        <SavingsGoalCard key={g.id} goal={g} onContribute={contribute} onRemove={removeGoal} />
      ))}

      {showNew ? (
        <div className="panel__add panel__add--stacked">
          <input type="text" placeholder="Nombre del objetivo" value={name} onChange={(e) => setName(e.target.value)} />
          <input
            type="number"
            inputMode="decimal"
            placeholder="Cantidad objetivo"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button className="btn btn--primary" onClick={addGoal}>Crear objetivo</button>
        </div>
      ) : (
        <button className="btn" onClick={() => setShowNew(true)}>+ Nuevo objetivo de ahorro</button>
      )}
    </div>
  );
}
