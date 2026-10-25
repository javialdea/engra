import { useEffect, useState, useCallback } from 'react';
import { db } from '../db';

export default function BudgetsPanel({ refreshKey, onChanged }) {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');

  const load = useCallback(async () => {
    setCategories(await db.categories.toArray());
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function updateBudget(id, value) {
    await db.categories.update(id, { budget: Number(value) || 0 });
    load();
    onChanged();
  }

  async function addCategory() {
    if (!newName.trim()) return;
    await db.categories.add({ name: newName.trim(), icon: '🏷️', budget: 0 });
    setNewName('');
    load();
    onChanged();
  }

  async function removeCategory(id) {
    await db.categories.delete(id);
    load();
    onChanged();
  }

  return (
    <div className="panel">
      {categories.map((c) => (
        <div className="budget-row" key={c.id}>
          <span className="budget-row__name">{c.icon} {c.name}</span>
          <input type="number" inputMode="decimal" defaultValue={c.budget} onBlur={(e) => updateBudget(c.id, e.target.value)} />
          <button className="icon-btn" onClick={() => removeCategory(c.id)} aria-label="Eliminar">✕</button>
        </div>
      ))}

      <div className="panel__add">
        <input
          type="text"
          placeholder="Nueva categoría"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button className="btn" onClick={addCategory}>Añadir</button>
      </div>
    </div>
  );
}
