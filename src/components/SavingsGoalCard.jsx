import { useState } from 'react';
import { formatCurrency } from '../utils/format';

export default function SavingsGoalCard({ goal, onContribute, onRemove }) {
  const [amount, setAmount] = useState('');
  const ratio = goal.targetAmount > 0 ? Math.min(goal.saved / goal.targetAmount, 1) : 0;

  return (
    <div className="savings-card">
      <div className="savings-card__header">
        <strong>{goal.name}</strong>
        <button className="icon-btn" onClick={() => onRemove(goal.id)} aria-label="Eliminar">✕</button>
      </div>
      <div className="category-progress__track">
        <div className="category-progress__fill category-progress__fill--ok" style={{ width: `${ratio * 100}%` }} />
      </div>
      <div className="savings-card__amounts">
        {formatCurrency(goal.saved)} de {formatCurrency(goal.targetAmount)}
        {goal.targetDate && <span> · antes de {goal.targetDate}</span>}
      </div>
      <div className="savings-card__add">
        <input
          type="number"
          inputMode="decimal"
          placeholder="Aportar…"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          className="btn"
          onClick={() => {
            if (Number(amount) > 0) {
              onContribute(goal.id, Number(amount));
              setAmount('');
            }
          }}
        >
          Aportar
        </button>
      </div>
    </div>
  );
}
