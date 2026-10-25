import { useState, useEffect } from 'react';
import { db } from '../db';
import { checkCategoryAlert } from '../utils/alerts';
import ImportPanel from './ImportPanel';

export default function QuickAddSheet({ open, onClose, categories, onAdded }) {
  const [mode, setMode] = useState('manual');
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [categoryId, setCategoryId] = useState(null);

  useEffect(() => {
    if (open) {
      setAmount('');
      setConcept('');
      setCategoryId(categories[0]?.id ?? null);
      setMode('manual');
    }
  }, [open, categories]);

  if (!open) return null;

  const canSave = Number(amount) > 0 && concept.trim() && categoryId;

  async function handleSave() {
    await db.expenses.add({
      amount: Number(amount),
      concept: concept.trim(),
      category: categoryId,
      date: new Date(),
    });
    const alert = await checkCategoryAlert(categoryId);
    onAdded(alert);
    onClose();
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__tabs">
          <button className={mode === 'manual' ? 'is-active' : ''} onClick={() => setMode('manual')}>
            Manual
          </button>
          <button className={mode === 'import' ? 'is-active' : ''} onClick={() => setMode('import')}>
            Desde captura
          </button>
        </div>

        {mode === 'manual' ? (
          <div className="sheet__form">
            <input
              className="sheet__amount"
              type="number"
              inputMode="decimal"
              placeholder="0,00 €"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
            <input
              className="sheet__concept"
              type="text"
              placeholder="¿En qué te lo has gastado?"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
            />
            <div className="sheet__categories">
              {categories.map((c) => (
                <button
                  key={c.id}
                  className={`chip ${categoryId === c.id ? 'is-active' : ''}`}
                  onClick={() => setCategoryId(c.id)}
                >
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
            <button className="btn btn--primary" disabled={!canSave} onClick={handleSave}>
              Guardar gasto
            </button>
          </div>
        ) : (
          <ImportPanel categories={categories} onAdded={onAdded} onClose={onClose} />
        )}
      </div>
    </div>
  );
}
